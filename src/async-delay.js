export default class AsyncDelay {
  /**
   * Creates a new asynchronous delay with the given length
   * @constructor
   * @param {Number} delayLength - The length of the delay in milliseconds
   */
  constructor(delayLength) {
    this._delay_active = true;

    setTimeout(() => this._endDelay(), delayLength);
  }

  get is_active() {
    return this._delay_active;
  }

  _endDelay() {
    this._delay_active = false;
  }
}
