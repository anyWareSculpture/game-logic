export default class DataChangeTracker {
  /**
   * Data store that keeps track of the last properties that were changed
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
   * @param {string} name - The name of the property to set
   * @param {*} value - The value to store
   */
  set(name, value) {
    this._assertValidProperty(name);

    if (this._data.hasOwnProperty(name)) {
      this._changes[name] = this._data[name];
    }

    this._data[name] = value;
  }

  /**
   * Retrieves a list of the names of the properties that have changed
   * @returns {String[]} - The list of names
   */
  getChangedPropertyNames() {
    return Object.keys(this._changes);
  }

  /**
   * Retrieves an object containing the name and old value
   * of each property that has been changed
   * @returns {Object} - Object where keys are the names of each changed property and values are the previous value of that property
   */
  getChangedOldValues() {
    return Object.assign({}, this._changes);
  }

  /**
   * Retrieves an object containing the name and current values
   * of each property that has been changed
   * @returns {Object} - Object where keys are the names of each changed property and the values are the current value of that property
   */
  getChangedCurrentValues() {
    const changed = {};

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
  }

  _assertValidProperty(name) {
    if (this._validPropertiesNames && !this._validPropertiesNames.has(name)) {
      throw new Error("Cannot retrieve property '" + name + "'");
    }
  }
}