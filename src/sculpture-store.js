const events = require('events');

const MoleGameLogic = require('./logic/mole-game-logic');
const LightArray = require('./utils/light-array');
const TrackedData = require('./utils/tracked-data');

const STATE_READY = "ready";
const STATE_ERROR = "error";
const STATE_SUCCESS = "success";
const STATE_SUCCESS = "locked";

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

    this._registerDispatcher(dispatcher);
  }

  _registerDispatcher(dispatcher) {
    dispatcher.register(this._handleActionPayload.bind(this));
  }

  _handleActionPayload(payload) {
    console.log(payload);
  }
}
