const events = require('events');

const MoleGameLogic = require('./logic/mole-game-logic');
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
    //TODO: Publish a change event
  }

  _registerDispatcher(dispatcher) {
    return dispatcher.register(this._handleActionPayload.bind(this));
  }

  _handleActionPayload(payload) {
    console.log(payload);
  }
}
