export default class TrackedData {
  /**
   * Keeps track of the last change made to any data that is stored
   * @constructor
   * @param {Object} [validProperties=null] - An object containing valid property names as keys and that property's default value as values. If not provided, no validation will occur on property names
   */
  constructor(validProperties=null) {
    this._data = Object.assign({}, validProperties || {});

    // {changedProperty: oldValue, ...}
    this._changes = {};

    this._validPropertiesNames = null;
    if (validProperties) {
      this._validPropertiesNames = new Set(Object.keys(validProperties));
    }
  }

  /**
   * Gets a copy of the value associated with the given name
   * @param {string} name - The name of the property to retrieve
   * @returns {*} a copy of the value of name
   */
  get(name) {
    this._assertValidProperty(name);

    return this._data[name];
  }

  /**
   * Stores the given value and tracks its old value as changed
   * Even if the same value is stored twice, a change will still be registered
   * @param {string} name - The name of the property to set
   * @param {*} value - The value to store
   */
  set(name, value) {
    this._assertValidProperty(name);

    if (value !== this._data[name]) {
      this._changes[name] = this._data[name];
    }

    this._data[name] = value;
  }

  /**
   * @returns {Boolean} Returns whether the given name is a valid name for this store. If no valid names were provided initially, this always returns true since then any name is valid
   * @param {String} name - The name of the property to check
   */
  has(name) {
    return this._validPropertiesNames ? this._validPropertiesNames.has(name) : true;
  }

  /**
   * Iterates through the names of the properties that have changed
   */
  *getChangedPropertyNames() {
    yield* Object.keys(this._changes);
    for (let propName of this._changedTrackedDataProperties()) {
      yield propName;
    }
  }

  /**
   * Retrieves an object containing the name and old value
   * of each property that has been changed
   * @returns {Object} - Object where keys are the names of each changed property and values are the previous value of that property
   */
  getChangedOldValues() {
    const changed = Object.assign({}, this._changes);

    for (let propName of this._changedTrackedDataProperties()) {
      if (!changed.hasOwnProperty(propName)) {
        changed[propName] = this.get(propName).getChangedOldValues();
      }
    }

    return changed;
  }

  /**
   * Retrieves an object containing the name and current values
   * of each property that has been changed
   * @returns {Object} - Object where keys are the names of each changed property and the values are the current value of that property
   */
  getChangedCurrentValues() {
    const changed = {};

    for (let propName of this._changedTrackedDataProperties()) {
      changed[propName] = this.get(propName).getChangedCurrentValues();
    }

    for (let propName of Object.keys(this._changes)) {
      changed[propName] = this.get(propName);
    }

    return changed;
  }

  /**
   * Clears out any recorded changes
   */
  clearChanges() {
    this._changes = {};

    for (let propName of this._changedTrackedDataProperties()) {
      this.get(propName).clearChanges();
    }
  }

  /**
   * Iterates through all the data property names currently defined
   */
  *[Symbol.iterator]() {
    for (let name of Object.keys(this._data)) {
      yield name;
    }
  }

  *_changedTrackedDataProperties() {
    for (let propName of Object.keys(this._data)) {
      const value = this.get(propName);
      if (value instanceof TrackedData) {
        if (!value.getChangedPropertyNames().next().done) {
          yield propName;
        }
      }
    }
  }

  _assertValidProperty(name) {
    if (!this.has(name)) {
      throw new Error("Cannot retrieve property '" + name + "'");
    }
  }
}
