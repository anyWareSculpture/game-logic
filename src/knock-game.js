const events = require('events');

const VersionedStore = require('./versioned-store');
const AsyncDelay = require('./async-delay');

const KNOCK_PATTERNS = {
  shaveAndHaircut: [0, 447, 318, 152, 450]
};
const KNOCK_PATTERN = KNOCK_PATTERNS.shaveAndHaircut;

const TIME_OFFSET_BETWEEN_CYCLES = 5000; // ms

export default class KnockGame extends events.EventEmitter {
  constructor() {
    super();

    this._targetPattern = KNOCK_PATTERN;
    this._targetPatternPosition = 0;

    this._delay = null;

    this.store = new VersionedStore([]);
  }

  onFrame() {
    if (this._delay && this._delay.is_active) {
      return;
    }

    this.produceKnock();
    this._targetPatternPosition += 1;

    let delay;
    if (this._targetPatternPosition < this._targetPattern.length) {
      delay = this._targetPattern[this._targetPatternPosition];
    }
    else {
      delay = TIME_OFFSET_BETWEEN_CYCLES;
      this._targetPatternPosition = 0;
    }

    this._delay = new AsyncDelay(delay);
  }

  mergeUpdate(update) {

  }

  receiveKnock() {
    
  }

  produceKnock() {
    console.log(`knock ${this._targetPatternPosition}`);
  }
}
