export default class AsyncDelay {
  /**
   * Creates a new asynchronous delay with the given length
   * @constructor
   * @param {Number} delayLength - The length of the delay in milliseconds
   */
  constructor(delayLength) {
    this._delayActive = true;

    setTimeout(() => this._endDelay(), delayLength);
  }

  get isActive() {
    return this._delayActive;
  }

  _endDelay() {
    this._delayActive = false;
  }
}
