const VersionedStore = require('./versioned-store');
const AsyncDelay = require('./async-delay');

const KNOCK_PATTERNS = {
  shaveAndHaircut: [0, 447, 318, 152, 450]
};
const KNOCK_PATTERN = KNOCK_PATTERNS.shaveAndHaircut;

const TIME_OFFSET_BETWEEN_CYCLES = 5000; // ms

export default class KnockGame {
  constructor() {
    this._targetPattern = null;

    this.store = new VersionedStore({
      complete: false
    });
  }

  // Store properties
  get isComplete() {
    return this.store.get("complete");
  }

  onFrame() {
    this.store.set("complete", false);

    if (!this._targetPattern) {
      this._targetPattern = KNOCK_PATTERN;


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
