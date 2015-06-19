const events = require('events');

const TrackedData = require('./utils/tracked-data');

export default class SculptureStore extends events.EventEmitter {
  constructor(dispatcher) {
    this.data = new TrackedData({
    });
  }
}
