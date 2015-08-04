const PanelsActionCreator = require('../actions/panels-action-creator');
const MoleGameActionCreator = require('../actions/mole-game-action-creator');

const TARGET_PANELS = [
  // [stripId, panelId],
  ['0', '3'],
  ['1', '3'],
  ['2', '3'],
  ['1', '4'],
  ['0', '5'],
  ['2', '5']
];

const TARGET_PANEL_INTENSITY = 100;
const PANEL_OFF_INTENSITY = 0;

export default class MoleGameLogic {
  // These are automatically added to the sculpture store
  static trackedProperties = {
    targetPanelIndex: 0,
  };

  constructor(store) {
    this.store = store;
    
    this._complete = false;
  }

  get data() {
    return this.store.data.get('mole');
  }

  start() {
    this.data.set("targetPanelIndex", 0);
    this._enableCurrentTargetPanel();
  }

  handleActionPayload(payload) {
    if (this._complete) {
      return;
    }

    const actionHandlers = {
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) {
      actionHandler(payload);
    }
  }

  _actionPanelPressed(payload) {
    let {stripId, panelId, pressed} = payload;

    const targetPanelIndex = this.data.get("targetPanelIndex");
    const [targetStripId, targetPanelId] = this._getTargetPanel(targetPanelIndex);

    if (stripId === targetStripId && panelId === targetPanelId && pressed) {
      this.data.set("targetPanelIndex", targetPanelIndex + 1);
      this._enableCurrentTargetPanel();
    }
  }

  _enableCurrentTargetPanel() {
    const targetPanelIndex = this.data.get("targetPanelIndex");
    if (targetPanelIndex > 0) {
      this._disablePanelIndex(targetPanelIndex - 1);
    }

    if (targetPanelIndex >= TARGET_PANELS.length) {
      this._winGame();
      return;
    }

    const [targetStripId, targetPanelId] = this._getTargetPanel(targetPanelIndex);
    this._enablePanel(targetStripId, targetPanelId);
  }

  _enablePanel(stripId, panelId) {
    this.store.data.get('lights').setIntensity(stripId, panelId, TARGET_PANEL_INTENSITY);
  }

  _disablePanelIndex(index) {
    const [stripId, panelId] = this._getTargetPanel(index);
    this._disablePanel(stripId, panelId);
  }

  _disablePanel(stripId, panelId) {
    this.store.data.get('lights').setIntensity(stripId, panelId, PANEL_OFF_INTENSITY);
  }

  _getTargetPanel(index) {
    return TARGET_PANELS[index];
  }

  _winGame() {
    this._complete = true;
    this.store.data.get('lights').deactivateAll();
    this.store.setSuccessStatus();
  }
}
