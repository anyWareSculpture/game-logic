const PanelsActionCreator = require('../actions/panels-action-creator');

const TARGET_PANELS = [
  // [stripId, panelId],
  ['0', '0'],
  ['1', '1'],
  ['2', '2'],
  ['1', '2'],
  ['0', '3'],
  ['2', '5'],
  ['0', '0']
];

const TARGET_PANEL_INTENSITY = 100;
const PANEL_OFF_INTENSITY = 0;

export default class MoleGameLogic {
  // These are automatically added to the sculpture store
  static trackedProperties = {
    targetPanelIndex: 0
  };

  constructor(store) {
    this.store = store;
  }

  get data() {
    return this.store.data.get('mole');
  }

  start() {
    this._enableCurrentTargetPanel();
  }

  handleActionPayload(payload) {
    switch (payload.actionType) {
      case PanelsActionCreator.PANEL_PRESSED:
        this._handlePanelPressed(payload);
        break;
      default:
        // Do nothing for unrecognized actions
        break;
    }
  }

  _handlePanelPressed(payload) {
    let {stripId, panelId, pressed} = payload;

    this.store.data.get('lights').activate(stripId, panelId, pressed);

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
      //TODO: Reached end
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
}
