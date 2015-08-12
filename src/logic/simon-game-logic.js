const PanelsActionCreator = require('../actions/panels-action-creator');
const PanelAnimation = require('../animation/panel-animation');
const NormalizeStripFrame = require('../animation/normalize-strip-frame');

const PATTERN_LEVELS = [
  // level 0 sequence
  {
    stripId: '0',
    panelSequence: [['3'], ['4'], ['5']]
  },
  // level 1 sequence
  {
    stripId: '1',
    panelSequence: [['3'], ['5'], ['4']]
  },
  // level 2 sequence
  {
    stripId: '2',
    panelSequence: [['3'], ['5'], ['4'], ['6']]
  }
];

const TARGET_PANEL_INTENSITY = 100;
const AVAILABLE_PANEL_INTENSITY = 100;
const SEQUENCE_ANIMATION_FRAME_DELAY = 500;
const DEFAULT_SIMON_PANEL_COLOR = "white";

export default class SimonGameLogic {
  // These are automatically added to the sculpture store
  static trackedProperties = {
    level: 0
  };

  constructor(store) {
    this.store = store;
  }

  get data() {
    return this.store.data.get('simon');
  }

  get _lights() {
    return this.store.data.get('lights');
  }

  start() {
    this.data.set('level', 0);
    this._playCurrentSequence();
  }

  handleActionPayload(payload) {
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
    //TODO
  }

  _playCurrentSequence() {
    const level = this.data.get('level');
    const {stripId, panelSequence} = PATTERN_LEVELS[level];

    this._playSequence(stripId, panelSequence);
  }

  _playSequence(stripId, panelSequence) {
    const frames = [for (panelIds of panelSequence) this._makeFrame(stripId, panelIds)];
    frames.push(this._makeLastFrame(stripId));
    const animation = new PanelAnimation(frames, this._finishPlaySequence.bind(this));

    this.store.playAnimation(animation);
  }

  _makeFrame(stripId, panelIds) {
    return this._createFrame(stripId, () => {
      for (let panelId of panelIds) {
        this._lights.setIntensity(stripId, panelId, TARGET_PANEL_INTENSITY);
        //TODO: this._lights.setColor(stripId, panelId, some user color);
      }
    });
  }

  _makeLastFrame(stripId) {
    return this._createFrame(stripId, () => {});
  }

  _createFrame(stripId, callback) {
    return new NormalizeStripFrame(this._lights, stripId, DEFAULT_SIMON_PANEL_COLOR, AVAILABLE_PANEL_INTENSITY, callback, SEQUENCE_ANIMATION_FRAME_DELAY);
  }

  _finishPlaySequence() {
  }
}

