const BaseActionCreator = require('./base-action-creator');

export default class MoleGameActionCreator extends BaseActionCreator {
  // Action types
  static MOVE_PANEL = "move-panel";
  static ACTIVATE_PANEL = "activate-panel";
  static DEACTIVATE_PANEL = "deactivate-panel";

  /**
   * Signals the mole game to move a panel due to a timeout
   */
  sendMovePanel({oldPanel: {stripId: oldStripId, panelId: oldPanelId},
                 panel: {stripId, panelId}}) {
    this._dispatch(MoleGameActionCreator.MOVE_PANEL, {
      oldPanel: {stripId: oldStripId, panelId: oldPanelId}, 
      panel: {stripId, panelId}
    });
  }

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
