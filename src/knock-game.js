const VersionedStore = require('./versioned-store');
const AsyncDelay = require('./async-delay');

const KNOCK_PATTERNS = {
  shaveAndHaircut: [0, 447, 318, 152, 450]
};
const KNOCK_PATTERN = KNOCK_PATTERNS.shaveAndHaircut;

const TIME_OFFSET_BETWEEN_CYCLES = 5000; // ms

export default class KnockGame {
  constructor() {
    this._targetPattern = KNOCK_PATTERN;
    this._targetPatternPosition = 0;

    this._delay = null;

    this.store = new VersionedStore({
      knocking: false
    });
  }

  // Store properties
  get isKnocking() {
    return this.store.get("knocking");
  }

  onFrame() {
    this.store.set("knocking", false);

    if (!(this._delay && this._delay.isActive)) {
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
  }

  mergeUpdate(update) {
    //TODO
  }

  userKnock() {
    //TODO: Process a knock from the user
  }
  
  /**
   * Output a knock to the user
   */
  produceKnock() {
    this.store.set("knocking", true);
  }
}
