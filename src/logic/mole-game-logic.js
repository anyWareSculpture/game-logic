const PanelsActionCreator = require('../actions/panels-action-creator');
const SculptureActionCreator = require('../actions/sculpture-action-creator');
const PanelGroup = require('../utils/panel-group');

export default class MoleGameLogic {
  // These are automatically added to the sculpture store
  static trackedProperties = {
    targetIndex: 0
  };

  constructor(store, config) {
    this.store = store;
    this.config = config;
    this.gameConfig = config.MOLE_GAME;
    
    // target panel groups are loaded each time when start() is called
    this._targetPanelGroups = null;
    this._complete = false;
    this._currentTarget = null;
  }

  get data() {
    return this.store.data.get('mole');
  }

  start() {
    this._targetPanelGroups = this.gameConfig.TARGET_PANEL_GROUPS.map((panels) => new PanelGroup(panels));
    this.data.set("targetIndex", 0);
    this._enableCurrentTarget();
  }

  handleActionPayload(payload) {
    if (this._complete) {
      return;
    }

    const actionHandlers = {
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
      [SculptureActionCreator.FINISH_STATUS_ANIMATION]: this._actionFinishStatusAnimation.bind(this)
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) {
      actionHandler(payload);
    }
  }

  _actionPanelPressed(payload) {
    let {stripId, panelId, pressed} = payload;

    if (this._currentTarget.has(stripId, panelId)) {
      this._currentTarget.delete(stripId, panelId);
      this._disablePanel(stripId, panelId);
      this._updateTarget();
    }
  }

  _actionFinishStatusAnimation(payload) {
    this._complete = true;
    this.store.moveToNextGame();
  }

  _updateTarget() {
    if (this._currentTarget.size === 0) {
      const targetIndex = this.data.get("targetIndex");
      this.data.set("targetIndex", targetIndex + 1);

      this._enableCurrentTarget();
    }
  }

  _enableCurrentTarget() {
    const targetIndex = this.data.get("targetIndex");

    if (targetIndex >= this._targetPanelGroups.length) {
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
      lightArray.setIntensity(stripId, panelId, this.gameConfig.TARGET_PANEL_INTENSITY);
    }
  }

  _disablePanel(stripId, panelId) {
    const lightArray = this.store.data.get('lights');
    lightArray.setIntensity(stripId, panelId, this.gameConfig.PANEL_OFF_INTENSITY);
  }

  _getTargetPanels(index) {
    // Make sure this gets copied so the constant never gets overwritten
    return new PanelGroup(this._targetPanelGroups[index]);
  }

  _winGame() {
    this.store.data.get('lights').deactivateAll();
    this.store.setSuccessStatus();
  }
}

