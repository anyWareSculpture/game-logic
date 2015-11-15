const SculptureActionCreator = require('../actions/sculpture-action-creator');

export default class HandshakeGameLogic {
  // These are automatically added to the sculpture store
  static trackedProperties = {
  };

  constructor(store, config) {
    this.store = store;
    this.config = config;

    this._complete = false;
  }

  get data() {
    return this.store.data.get('handshake');
  }

  start() {
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
    if (payload.user === this.store.username) {
      this._winGame();
    }
  }

  _winGame() {
    this.store.data.get('lights').deactivateAll();
    this.store.setSuccessStatus();
  }
}

