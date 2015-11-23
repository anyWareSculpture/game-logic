const PanelsActionCreator = require('../actions/panels-action-creator');
const SculptureActionCreator = require('../actions/sculpture-action-creator');
const SimonGameActionCreator = require('../actions/simon-game-action-creator');
const PanelAnimation = require('../animation/panel-animation');
const NormalizeStripFrame = require('../animation/normalize-strip-frame');

const DEFAULT_LEVEL = 0;

export default class SimonGameLogic {
  // These are automatically added to the sculpture store
  static trackedProperties = {
    level: DEFAULT_LEVEL
  };

  constructor(store, config) {
    this.store = store;
    this.config = config;
    this.gameConfig = this.config.SIMON_GAME;

    this.simonGameActionCreator = new SimonGameActionCreator(this.store.dispatcher);

    this._targetSequenceIndex = 0;
    this._targetSequence = null;
    this._receivedInput = false;

    this._inputTimeout = null;
    this._replayTimeout = null;
  }

  get data() {
    return this.store.data.get('simon');
  }

  get _lights() {
    return this.store.data.get('lights');
  }

  start() {
    this.data.set('level', DEFAULT_LEVEL);
    this._playCurrentSequence();
  }

  handleActionPayload(payload) {
    const actionHandlers = {
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
      [SculptureActionCreator.FINISH_STATUS_ANIMATION]: this._actionFinishStatusAnimation.bind(this),
      [SimonGameActionCreator.REPLAY_SIMON_PATTERN]: this._actionReplaySimonPattern.bind(this)
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) {
      actionHandler(payload);
    }
  }

  _actionReplaySimonPattern(payload) {
    if (!this._complete) {
      this._playCurrentSequence();
    }
  }

  _actionFinishStatusAnimation(payload) {
    if (this._complete) {
      this.store.moveToNextGame();
    }
    else {
      this._playCurrentSequence();
    }
  }

  _actionPanelPressed(payload) {
    if (this._complete || !this.isReadyAndNotAnimating) {
      return;
    }

    const {stripId, panelId, pressed} = payload;
    const {stripId: targetStripId, panelSequence} = this._currentLevelData;

    const panelUp = !pressed;
    if (!panelUp || targetStripId !== stripId) {
      return;
    }

    if (!this._receivedInput) {
      this._receivedInput = true;
      this._targetSequence = new Set(panelSequence[this._targetSequenceIndex]);

      this._setInputTimeout();
    }

    if (!this._targetSequence.has(panelId)) {
      this.store.setFailureStatus();
      return;
    }

    this._targetSequence.delete(panelId);

    if (!this._targetSequence.length) {
      this._targetSequenceIndex += 1;
    }

    if (this._targetSequenceIndex >= panelSequence.length) {
      this._winLevel();
    }
    else {
      this._targetSequence = new Set(panelSequence[this._targetSequenceIndex]);
    }
  }

  _setInputTimeout() {
    clearTimeout(this._inputTimeout);

    const level = this._level;
    this._inputTimeout = setTimeout(() => {
      if (this.isReadyAndNotAnimating && this._receivedInput && this._level === level) {
        this.simonGameActionCreator.sendReplaySimonPattern();
      }
    }, this.gameConfig.INPUT_TIMEOUT);
  }

  _discardInput() {
    this._targetSequenceIndex = 0;
    this._targetSequence = null;
    this._receivedInput = false;
  }

  _winLevel() {
    this.store.data.get('lights').deactivateAll();
    this._lights.setIntensity(this._currentLevelData.stripId, null, 0);
    
    this.store.setSuccessStatus();

    let level = this._level + 1;
    if (level >= this._levels) {
      this._complete = true;
    }

    this._level = level;
  }

  _playCurrentSequence() {
    const {stripId, panelSequence} = this._currentLevelData;

    this._playSequence(stripId, panelSequence);
  }

  _playSequence(stripId, panelSequence) {
    this._discardInput();

    const frames = panelSequence.map((panelIds) => this._createSequenceFrame(stripId, panelIds));
    frames.push(this._createLastSequenceFrame(stripId));
    const animation = new PanelAnimation(frames, this._finishPlaySequence.bind(this));

    this.store.playAnimation(animation);
  }

  _createSequenceFrame(stripId, panelIds) {
    return this._createFrame(stripId, () => {
      for (let panelId of panelIds) {
        this._lights.setIntensity(stripId, panelId, this.gameConfig.TARGET_PANEL_INTENSITY);
        this._lights.setColor(stripId, panelId, this.store.userColor);
      }
    });
  }

  _createLastSequenceFrame(stripId) {
    return this._createFrame(stripId, () => {});
  }

  _createFrame(stripId, callback) {
    return new NormalizeStripFrame(this._lights, stripId,
      this.gameConfig.DEFAULT_SIMON_PANEL_COLOR,
      this.gameConfig.AVAILABLE_PANEL_INTENSITY,
      callback,
      this.gameConfig.SEQUENCE_ANIMATION_FRAME_DELAY);
  }

  _finishPlaySequence() {
    clearTimeout(this._replayTimeout);

    const level = this._level;
    this._replayTimeout = setTimeout(() => {
      if (this.isReadyAndNotAnimating && !this._receivedInput && this._level === level) {
        this.simonGameActionCreator.sendReplaySimonPattern();
      }
    }, this.gameConfig.DELAY_BETWEEN_PLAYS);
  }

  get _levels() {
    return this.gameConfig.PATTERN_LEVELS.length;
  }

  get _currentLevelData() {
    const level = this._level;
    return this.gameConfig.PATTERN_LEVELS[level];
  }

  get _level() {
    return this.data.get('level');
  }

  set _level(value) {
    return this.data.set('level', value);
  }

  get isReadyAndNotAnimating() {
    return this.store.isReady && !this.store.isPanelAnimationRunning;
  }
}

