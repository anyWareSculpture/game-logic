const BaseActionCreator = require('./base-action-creator');
const {SculptureStore} = require('../sculpture-store');

export default class SculptureActionCreator extends BaseActionCreator {
  // Action types
  static MERGE_STATE = "merge-state";

  /**
   * Sends an action asking the sculpture to merge some state
   * @param {Object} state - The state update to merge
   */
  sendMergeState(state) {
    this._dispatch(SculptureActionCreator.MERGE_STATE, state);
  }

  sendEndMoleGameAnimation() {
    this.sendMergeState({
      status: SculptureStore.STATUS_READY,
      mole: {
        animation: false
      }
    });
  }
}
