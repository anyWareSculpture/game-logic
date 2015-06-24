const events = require('events');

const MoleGameLogic = require('./logic/mole-game-logic');
const SculptureActionCreator = require('./actions/sculpture-action-creator');
const PanelsActionCreator = require('./actions/panels-action-creator');
const MoleGameActionCreator = require('./actions/mole-game-action-creator');
const LightArray = require('./utils/light-array');
const TrackedData = require('./utils/tracked-data');

export default class SculptureStore extends events.EventEmitter {
  static EVENT_CHANGE = "change";

  static STATUS_READY = "ready";
  static STATUS_LOCKED = "locked";

  constructor(dispatcher) {
    super();

    this.data = new TrackedData({
      'status': SculptureStore.STATUS_READY,
      'lights': new LightArray({
        // stripId : number of panels
        '0': 10,
        '1': 10,
        '2': 10
      }),
      'mole': new TrackedData(MoleGameLogic.trackedProperties)
    });

    this.currentGame = null;
    this.dispatchToken = this._registerDispatcher(dispatcher);
    this.sculptureActionCreator = new SculptureActionCreator(dispatcher);
  }

  /**
   * Starts playing the mole game and does any necessary initialization work
   */
  startMoleGame() {
    this._startGame(new MoleGameLogic(this));
  }

  /**
   * @returns {Boolean} Returns whether the mole game is currently being played
   */
  get isPlayingMoleGame() {
    return this.currentGame instanceof MoleGameLogic;
  }

  /**
   * Restores the sculpture's status back to ready
   * Make sure to publish changes after calling this -- not necessary if an action is currently being handled already
   */
  restoreStatus() {
    this.data.set('status', SculptureStore.STATUS_READY);
  }

  /**
   * Locks the sculpture from any input
   * Make sure to publish changes after calling this -- not necessary if an action is currently being handled already
   */
  lock() {
    this.data.set('status', SculptureStore.STATUS_LOCKED);
  }

  get isLocked() {
    return this.data.get('status') === SculptureStore.STATUS_LOCKED;
  }

  _startGame(gameLogic) {
    this.currentGame = gameLogic;
    this.currentGame.start();

    this._publishChanges();
  }

  _publishChanges() {
    const changes = this.data.getChangedCurrentValues();

    if (Object.keys(changes).length) {
      this.emit(SculptureStore.EVENT_CHANGE, changes);
    }

    this.data.clearChanges();
  }

  _registerDispatcher(dispatcher) {
    return dispatcher.register(this._handleActionPayload.bind(this));
  }

  _handleActionPayload(payload) {
    if (this.isLocked && !this._actionCanRunWhenLocked(payload.actionType)) {
      return;
    }

    this._delegateAction(payload);

    if (this.currentGame !== null) {
      this.currentGame.handleActionPayload(payload);
    }

    this._publishChanges();
  }

  _actionCanRunWhenLocked(actionType) {
    const enabledActions = new Set([
        ...SculptureActionCreator.enabledWhileSculptureLocked(),
        ...PanelsActionCreator.enabledWhileSculptureLocked(),
        ...MoleGameActionCreator.enabledWhileSculptureLocked()
    ]);
    return enabledActions.has(actionType);
  }

  _delegateAction(payload) {
    const actionHandlers = {
      [SculptureActionCreator.MERGE_STATE]: this._actionMergeState.bind(this),
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this)
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) {
      actionHandler(payload);
    }
  }

  _actionMergeState(payload) {
    const mergeFunctions = {
      status: this._mergeStatus.bind(this),
      lights: this._mergeLights.bind(this),
      mole: this._mergeMole.bind(this)
    };

    for (let propName of Object.keys(payload)) {
      const mergeFunction = mergeFunctions[propName];
      if (mergeFunction) {
        mergeFunction(payload[propName]);
      }
    }
  }

  _actionPanelPressed(payload) {
    const {stripId, panelId, pressed} = payload;
    this.data.get('lights').activate(stripId, panelId, pressed);
  }

  _mergeStatus(newStatus) {
    this.data.set('status', newStatus);
  }

  _mergeLights(lightChanges) {
    //TODO
  }

  _mergeMole(moleChanges) {
    for (let propName of Object.keys(moleChanges)) {
      this.data.get('mole').set(propName, moleChanges[propName]);
    }
  }
}
