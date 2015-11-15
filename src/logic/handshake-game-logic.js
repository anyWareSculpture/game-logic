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
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
      [SculptureActionCreator.FINISH_STATUS_ANIMATION]: this._actionFinishStatusAnimation.bind(this)
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) {
      actionHandler(payload);
    }
  }

  _winGame() {
    this.store.data.get('lights').deactivateAll();
    this.store.setSuccessStatus();
  }
}

