const SculptureActionCreator = require('../actions/sculpture-action-creator');

export default class HandshakeGameLogic {
  // These are automatically added to the sculpture store
  static trackedProperties = {
  };

  constructor(store, config) {
    this.store = store;
    this.config = config;
    this.gameConfig = config.HANDSHAKE_GAME;

    this._complete = false;

    this.sculptureActionCreator = new SculptureActionCreator(this.store.dispatcher);
  }

  get data() {
    return this.store.data.get('handshake');
  }

  start() {
  }

  end() {
    this.store.data.get('lights').deactivateAll();
  }

  handleActionPayload(payload) {
    if (this._complete) {
      return;
    }

    const actionHandlers = {
      [SculptureActionCreator.HANDSHAKE_ACTIVATE]: this._actionHandshakeActivate.bind(this)
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) {
      actionHandler(payload);
    }
  }

  _actionHandshakeActivate(payload) {
    this._complete = true;
    // Only the receiving sculpture will manage the transition
    if (payload.user === this.store.username) {
      setTimeout(() => this.sculptureActionCreator.sendStartNextGame(), this.gameConfig.TRANSITION_OUT_TIME);
    }
  }
}
