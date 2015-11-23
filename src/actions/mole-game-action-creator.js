const BaseActionCreator = require('./base-action-creator');

export default class MoleGameActionCreator extends BaseActionCreator {
  // Action types
  static ACTIVATE_PANEL = "activate-panel";
  static DEACTIVATE_PANEL = "deactivate-panel";

  /**
   * Signals the mole game to activate a panel, typically from a timer
   */
  sendActivatePanel({stripId, panelId}) {
    this._dispatch(MoleGameActionCreator.ACTIVATE_PANEL, {stripId, panelId});
  }

  /**
   * Signals the mole game to deactivate a panel, typically from a timer
   */
  sendDeactivatePanel({stripId, panelId}) {
    this._dispatch(MoleGameActionCreator.DEACTIVATE_PANEL, {stripId, panelId});
  }
}
