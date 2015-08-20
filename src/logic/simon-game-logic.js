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
const DELAY_BETWEEN_PLAYS = 5000;
const INPUT_TIMEOUT = 5000;
const DEFAULT_SIMON_PANEL_COLOR = "white";

export default class SimonGameLogic {
  // These are automatically added to the sculpture store
  static trackedProperties = {
    level: 0
  };

  constructor(store) {
    this.store = store;

    this._receivedInput = false;
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
    const {stripId, panelId, pressed} = payload;
    const {stripId: targetStripId, panelSequence} = this._currentLevel();

    if (!pressed && targetStripId === stripId) {
      //TODO
    }
  }

  _playCurrentSequence() {
    const {stripId, panelSequence} = this._currentLevel();

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
        this._lights.setColor(stripId, panelId, this.store.userColor);
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
    setTimeout(() => {
      if (!this._receivedInput) {
        this._playCurrentSequence();
      }
    }, DELAY_BETWEEN_PLAYS);
  }

  _currentLevel() {
    const level = this.data.get('level');
    return PATTERN_LEVELS[level];
  }
}

