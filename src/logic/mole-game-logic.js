const PanelsActionCreator = require('../actions/panels-action-creator');
const MoleGameActionCreator = require('../actions/mole-game-action-creator');

const TARGET_PANELS = [
  // [[stripId, panelId], ...],
  [['0', '3'], ['1', '3'], ['2', '3']],
  [['0', '4'], ['1', '5']],
  [['0', '3'], ['0', '5'], ['2', '4']]
].map((panels) => new Set(panels));

const TARGET_PANEL_INTENSITY = 100;
const PANEL_OFF_INTENSITY = 0;

export default class MoleGameLogic {
  // These are automatically added to the sculpture store
  static trackedProperties = {
    targetIndex: 0
  };

  constructor(store) {
    this.store = store;
    
    this._complete = false;
    this._currentTarget = null;
  }

  get data() {
    return this.store.data.get('mole');
  }

  start() {
    this.data.set("targetIndex", 0);
    this._enableCurrentTarget();
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

    if (stripId === targetStripId && panelId === targetPanelId && pressed) {
      this.data.set("targetIndex", targetIndex + 1);
      this._enableCurrentTarget();
    }
  }

  _enableCurrentTarget() {
    const targetIndex = this.data.get("targetIndex");
    if (targetIndex > 0) {
      this._disableTarget(targetIndex - 1);
    }

    if (targetIndex >= TARGET_PANELS.length) {
      this._winGame();
      return;
    }

    const targetPanels = this._getTargetPanels(targetIndex);
    this._currentTarget = targetPanels;
    this._enablePanels(targetPanels);
  }

  _enablePanels(panels) {
    const lightArray = this.store.data.get('lights');
    for (let [stripId, panelId] of panels) {
      lightArray.setIntensity(stripId, panelId, TARGET_PANEL_INTENSITY);
    }
  }

  _disableTarget(index) {
    const targetPanels = this._getTargetPanels(index);
    this._disablePanels(targetPanels);
  }

  _disablePanels(panels) {
    const lightArray = this.store.data.get('lights');
    for (let [stripId, panelId] of panels) {
      lightArray.setIntensity(stripId, panelId, PANEL_OFF_INTENSITY);
    }
  }

  _getTargetPanels(index) {
    // Make sure this gets copied so the constant never gets overwritten
    return new Set(TARGET_PANELS[index]);
  }

  _winGame() {
    this._complete = true;
    this.store.data.get('lights').deactivateAll();
    this.store.setSuccessStatus();
  }
}

