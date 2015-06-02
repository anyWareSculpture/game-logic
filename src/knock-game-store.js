const events = require('events');

const GameConstants = require('./game-constants');
const DataChangeTracker = require('./data-change-tracker');

const KNOCK_PATTERNS = {
  shaveAndHaircut: [0, 447, 318, 152, 450]
};
const KNOCK_PATTERN = KNOCK_PATTERNS.shaveAndHaircut;

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
      actionType: GameConstants.ACTION_TYPE_CHANGE_KNOCK_GAME,
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
    if (payload.actionType === GameConstants.ACTION_TYPE_CHANGE_KNOCK_GAME) {
      this.data.set("pattern", payload.pattern);
    }

    this._emitChanges();
  }

  _emitChanges() {
    const changes = this.data.getChangedCurrentValues();
    this.data.clearChanges();

    this.emit(GameConstants.EVENT_CHANGE, changes);
  }
}
