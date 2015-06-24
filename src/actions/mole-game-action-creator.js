const BaseActionCreator = require('./base-action-creator');
const {SculptureStore} = require('@anyware/game-logic');

export default class MoleGameActionCreator extends BaseActionCreator {
  // Action types
  static MERGE_STATE = "merge-state";

  /**
   * Sends an action asking the sculpture to merge some state
   * @param {Object} state - The state update to merge
   */
  sendMergeState(state) {
    this._dispatch(SculptureActionCreator.MERGE_STATE, state);
  }

  sendUnlockStatus() {
    this.sendMergeState({
      status: SculptureStore.STATUS_READY
    });
  }
}
