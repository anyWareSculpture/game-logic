const TrackedData = require('./tracked-data');

/**
 * Tracks panel state.
 * Since we don't support removing tracked data, we need to introduce an OFF state
 * This is currently meant for the mole game, where we want to know if an "on" state 
 * is active or turned to location color (and thus ignored)
 * 
 * Note: Since we require a string key, we use the combined stripId and panelId
 * as a key.
 */
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
    return Object.keys(this._data).length;
  }

  _hash(stripId, panelId) {
    return `${stripId},${panelId}`;
  }
}
