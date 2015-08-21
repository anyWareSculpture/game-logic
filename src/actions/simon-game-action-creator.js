const BaseActionCreator = require('./base-action-creator');

export default class SimonGameActionCreator extends BaseActionCreator {
  // Action types
  static REPLAY_SIMON_PATTERN = "replay-simon-pattern";

  /**
   * Signals the simon game to replay the simon pattern
   */
  sendReplaySimonPattern() {
    this._dispatch(SimonGameActionCreator.REPLAY_SIMON_PATTERN);
  }
}

