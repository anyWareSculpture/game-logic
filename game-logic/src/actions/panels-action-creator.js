const BaseActionCreator = require('./base-action-creator');

export default class PanelsActionCreator extends BaseActionCreator {
  // Action types
  static PANEL_PRESSED = "panel-press";

  /**
   * Sends an action representing when a panel is pressed to the
   * dispatcher.
   * @param {String} stripId - The ID of the strip where the panel was pressed
   * @param {String} panelId - The ID of the panel that was pressed
   * @param {Boolean|Number} pressed - Whether the panel was pressed or not (1 or 0)
   */
  sendPanelPressed(stripId, panelId, pressed=1) {
    this._dispatch(PanelsActionCreator.PANEL_PRESSED, {
      stripId: stripId,
      panelId: panelId,
      pressed: pressed
    });
  }
}
