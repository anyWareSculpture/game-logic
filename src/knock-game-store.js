const events = require('events');

const GameConstants = require('./game-constants');
const DataChangeTracker = require('./data-change-tracker');

const KNOCK_PATTERNS = {
  shaveAndHaircut: [0, 447, 318, 152, 450]
};
const KNOCK_PATTERNS_SOLUTION_THRESHOLDS = {
  shaveAndHaircut: [[800, 1600], [400, 600]]
};
const KNOCK_PATTERN = KNOCK_PATTERNS.shaveAndHaircut;
const KNOCK_PATTERN_SOLUTION_THRESHOLDS = KNOCK_PATTERNS_SOLUTION_THRESHOLDS.shaveAndHaircut;

export default class KnockGameStore extends events.EventEmitter {
  /**
   * Creates a store to be used with a flux dispatcher
   * Emits a change event whenever one or more properties change
   * so that view-controllers can update
   * @param {Dispatcher} dispatcher - A dispatcher that implements flux's dispatcher API
   */
  constructor(dispatcher) {
    super();

    this.data = new DataChangeTracker({
      complete: false,
      pattern: null
    });
    this.dispatchToken = null;

    this.registerDispatcherCallbacks(dispatcher);
  }

  /**
   * Sends the initial knock pattern to the provided dispatcher
   * @param {Dispatcher} dispatcher - A dispatcher that implements flux's dispatcher API
   */
  static sendInitialKnockPattern(dispatcher) {
    dispatcher.dispatch({
      actionType: GameConstants.ACTION_TYPE_CHANGE_KNOCK_PATTERN,
      pattern: KNOCK_PATTERN
    });
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
      default:
        break;
    }

    this._emitChanges();
  }

  _actionChangeKnockPattern(payload) {
    this.data.set("pattern", payload.pattern);
  }

  _actionDetectKnockPattern(payload) {
    const pattern = payload.pattern;
    const patternSolution = KNOCK_PATTERN_SOLUTION_THRESHOLDS;

    const patternAccepted = this._checkPattern(pattern, patternSolution);

    if (patternAccepted) {
      this.data.set("complete", true);
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
    const changes = this.data.getChangedCurrentValues();
    if (!Object.keys(changes).length) {
      return;
    }
    this.data.clearChanges();

    this.emit(GameConstants.EVENT_CHANGE, changes);
  }
}