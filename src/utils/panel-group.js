const TrackedData = require('./tracked-data');

export class TrackedPanels extends TrackedData {

  static STATE_ON = "on";
  static STATE_OFF = "off"; // default
  static STATE_IGNORED = "ignored";

  constructor() {
    super();
  }

  setPanelState(stripId, panelId, state) {
    this.set(this._hash(stripId, panelId), state);
  }

  getPanelState(stripId, panelId) {
    return this.get(this._hash(stripId, panelId)) || TrackedData.STATE_OFF;
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
