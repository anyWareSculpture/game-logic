const TrackedData = require('./tracked-data');

export class TrackedPanelSet extends TrackedData {
  constructor() {
    super();
  }

  addPanel(stripId, panelId) {
    this.set(this._hash(stripId, panelId), true);
  }

  hasPanel(stripId, panelId) {
    const key = this._hash(stripId, panelId);
    return this.has(key) && this.get(key);
  }

  deletePanel(stripId, panelId) {
    this.set(this._hash(stripId, panelId), false);
  }

  get numPanels() {
    return Object.keys(_this.data).length;
  } 

  _hash(stripId, panelId) {
    return `${stripId},${panelId}`;
  }
}

export class PanelSet {
  constructor() {
    this._set = {};
  }

  addPanel(panel) {
    this._set[this._hash(panel)] = panel;
  }

  hasPanel(panel) {
    return this._set.hasOwnProperty(this._hash(panel));
  }

  deletePanel(panel) {
    delete this._set[this._hash(panel)];
  }

  get size() {
    return Object.keys(this._set).length;
  }

  *values() {
    for (let key of Object.values(this._set)) yield key;
  }

  _hash([stripId, panelId]) {
    return `${stripId},${panelId}`;
  }
}
