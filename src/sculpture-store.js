const events = require('events');

const GameConstants = require('./game-constants');
const MoleGameLogic = require('./logic/mole-game-logic');
const SculptureActionCreator = require('./actions/sculpture-action-creator');
const LightArray = require('./utils/light-array');
const TrackedData = require('./utils/tracked-data');

const STATE_READY = "ready";

export default class SculptureStore extends events.EventEmitter {
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

    // temporarily here to test the mole game
    this.startMoleGame();
  }

  startMoleGame() {
    this._startGame(new MoleGameLogic(this));
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
    if (payload.actionType === SculptureActionCreator.MERGE_STATE) {
      this._mergeState(payload);
    }

    if (this.currentGame !== null) {
      this.currentGame.handleActionPayload(payload);
    }

    this._publishChanges();
  }

  _publishChanges() {
    const changes = this.data.getChangedCurrentValues();
    
    if (Object.keys(changes).length) {
      this.emit(GameConstants.EVENT_CHANGE, changes);
    }
  }

  _mergeState(state) {
    //TODO: Merge state only if properties have actually changed
  }
}
