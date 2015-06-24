const events = require('events');

const MoleGameLogic = require('./logic/mole-game-logic');
const SculptureActionCreator = require('./actions/sculpture-action-creator');
const PanelsActionCreator = require('./actions/panels-action-creator');
const LightArray = require('./utils/light-array');
const TrackedData = require('./utils/tracked-data');

const STATE_READY = "ready";

export default class SculptureStore extends events.EventEmitter {
  static EVENT_CHANGE = "change";

  constructor(dispatcher) {
    super();

    this.data = new TrackedData({
      'state': STATE_READY,
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
  }

  startMoleGame() {
    this._startGame(new MoleGameLogic(this));
  }

  get isPlayingMoleGame() {
    return this.currentGame instanceof MoleGameLogic;
  }

  _startGame(gameLogic) {
    this.currentGame = gameLogic;
    this.currentGame.start();

    this._publishChanges();
  }

  _registerDispatcher(dispatcher) {
    return dispatcher.register(this._handleActionPayload.bind(this));
  }

  _handleActionPayload(payload) {
    switch (payload.actionType) {
      case SculptureActionCreator.MERGE_STATE:
        this._actionMergeState(payload);
        break;
      case PanelsActionCreator.PANEL_PRESSED:
        this._actionPanelPressed(payload);
        break;
      default:
        // Do nothing for unrecognized actions
        break;
    }

    if (this.currentGame !== null) {
      this.currentGame.handleActionPayload(payload);
    }

    this._publishChanges();
  }

  _publishChanges() {
    const changes = this.data.getChangedCurrentValues();
    
    if (Object.keys(changes).length) {
      this.emit(SculptureStore.EVENT_CHANGE, changes);
    }
  }

  _actionMergeState(state) {
    //TODO: Merge state only if properties have actually changed
  }

  _actionPanelPressed(payload) {
    const {stripId, panelId, pressed} = payload;
    this.data.get('lights').activate(stripId, panelId, pressed);
  }
}
