export default class VersionedStore {
  /**
   * Data store that keeps track of the last properties that were changed
   * @constructor
   * @param {Set} [validProperties=null] - A list of properties which if
   *    provided will be enforced as the only valid properties for this store
   * @param [defaultValue=null] - The default value to provide for a valid property not provided
   */
  constructor(validProperties=null, defaultValue=null) {
    this._data = {};
    
    // {changedProperty: oldValue, ...}
    this._changes = {};

    this._validProperties = validProperties;
    this._defaultValue = defaultValue;
  }
  
  /**
   * Gets a copy of the value associated with the given name
   * @param {string} name
   */
  get(name) {
    
  }

  /**
   * Stores the given value and tracks its old value as changed
   * @param {string} name
   * @param value
   */
  set(name, value) {

  }

  /**
   * Retrieves a list of the names of the properties that have changed
   */
  getChangedPropertyNames() {
    return Object.keys(this._changes);
  }
  
  /**
   * Retrieves an object containing the name and old value
   * of each property that has been changed
   */
  getChangedOldValues() {
    return this._changes;
  }

  /**
   * Retrieves an object containing the name and current values
   * of each property that has been changed
   */
  getChangedCurrentValues() {
    const changed = {};

    for (let propName of this._changes) {
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
}
