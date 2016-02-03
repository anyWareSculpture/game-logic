const BaseActionCreator = require('./base-action-creator');

export default class MoleGameActionCreator extends BaseActionCreator {
  // Action types
  static AVAIL_PANEL = "avail-panel";
  static DEAVAIL_PANEL = "deavail-panel";

  /**
   * Signals the mole game to avail a panel, typically from a timer
   */
  sendAvailPanel({stripId, panelId}) {
    this._dispatch(MoleGameActionCreator.AVAIL_PANEL, {stripId, panelId});
  }

  /**
   * Signals the mole game to deavail a panel, typically from a timer
   */
  sendDeavailPanel({stripId, panelId}) {
    this._dispatch(MoleGameActionCreator.DEAVAIL_PANEL, {stripId, panelId});
  }
}
