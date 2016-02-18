const TrackedData = require('./tracked-data');

/**
 * Implements a sub-set of the JavaScript Set API including adding,
 * removing and checking for item existence.
 *
 * Tracks changes made to the set
 */
export default class TrackedSet extends TrackedData {
  constructor() {
    super();
  }

  add(value) {
    this.set(value, true);
  }

  clear() {
    for (let value of this) {
      this.delete(value);
    }
  }

  delete(value) {
    this.set(value, false);
  }
}

