const events = require('events');

const GameConstants = require('./game-constants');
const DataChangeTracker = require('./data-change-tracker');

const KNOCK_PATTERNS = {
  shaveAndHaircut: [0, 447, 318, 152, 450]
};
const KNOCK_PATTERNS_SOLUTION_THRESHOLDS = {
  shaveAndHaircut: [[800, 1600], [400, 600]]
};

export default class KnockGameStore extends events.EventEmitter {
  /**
   * Creates a store to be used with a flux dispatcher
   * Emits a change event whenever one or more properties change
   * so that view-controllers can update
   * @param {Dispatcher} dispatcher - A dispatcher that implements flux's dispatcher API
   */
  constructor(dispatcher) {
    super();

    this._data = new DataChangeTracker({
      complete: false,
      patternId: null
    });
    this.dispatchToken = null;

    this.registerDispatcherCallbacks(dispatcher);
  }

  /**
   * @returns {Boolean} Whether the game has been completed or not
   */
  get isComplete() {
    return this._data.get('complete');
  }

  /**
   * @returns {String} The pattern ID from KNOCK_PATTERNS currently being played or null if no pattern ID has been set
   */
  get knockPatternId() {
    return this._data.get('patternId');
  }

  /**
   * @returns {Number[]} The knock pattern being played or null if no pattern has been set yet
   */
  get knockPattern() {
    return KNOCK_PATTERNS[this.knockPatternId] || null;
  }

  /**
   * @returns {Number[][]} The knock pattern solution thresholds ([min, max]) for the knock pattern that was played or null
   */
  get knockPatternSolutionThresholds() {
    return KNOCK_PATTERNS_SOLUTION_THRESHOLDS[this.knockPatternId] || null;
  }

  /**
   * Registers dispatcher callbacks on the provided dispatcher.
   * Automatically called by the constructor.
   * @param {Dispatcher} dispatcher - A dispatcher that implements flux's dispatcher API
   */
  registerDispatcherCallbacks(dispatcher) {
    this.dispatchToken = dispatcher.register(this._handleDispatcherPayload.bind(this));
  }

  _handleDispatcherPayload(payload) {
    switch (payload.actionType) {
      case GameConstants.ACTION_TYPE_CHANGE_KNOCK_PATTERN:
        this._actionChangeKnockPattern(payload);
        break;
      case GameConstants.ACTION_TYPE_DETECT_KNOCK_PATTERN:
        this._actionDetectKnockPattern(payload);
        break;
      case GameConstants.ACTION_TYPE_MERGE_GAME_STATE:
        this._actionMergeGameState(payload);
        break;
      default:
        break;
    }

    this._emitChanges();
  }

  _actionChangeKnockPattern(payload) {
    this._data.set("patternId", payload.pattern);
    this._data.set("complete", false);
  }

  _actionDetectKnockPattern(payload) {
    const receivedPattern = payload.pattern;
    const patternSolution = this.knockPatternSolutionThresholds;

    const patternAccepted = this._checkPattern(receivedPattern, patternSolution);

    if (patternAccepted) {
      this._data.set("complete", true);
    }
  }

  _actionMergeGameState(payload) {
    const stateUpdate = payload.stateUpdate;
    if (stateUpdate.complete) {
      this._data.set("complete", true);
    }
  }

  _checkPattern(pattern, patternSolution) {
    if (pattern.length !== patternSolution.length) {
      return false;
    }

    let patternAccepted = true;
    let i = 0;
    for (let [minThreshold, maxThreshold] of patternSolution) {
      if (pattern[i] < minThreshold || pattern[i] > maxThreshold) {
        patternAccepted = false;
        break;
      }
      i++;
    }

    return patternAccepted;
  }

  _emitChanges() {
    const changes = this._data.getChangedCurrentValues();
    if (!Object.keys(changes).length) {
      return;
    }
    this._data.clearChanges();

    this.emit(GameConstants.EVENT_CHANGE, changes);
  }
}
