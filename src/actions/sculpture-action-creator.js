const BaseActionCreator = require('./base-action-creator');

export default class SculptureActionCreator extends BaseActionCreator {
  // Action types
  static MERGE_STATE = "merge-state";
  static START_GAME = "start-game";
  static RESTORE_STATUS = "restore-status";
  static ANIMATION_FRAME = "animation-frame";
  static FINISH_STATUS_ANIMATION = "finish-status-animation";

  static GAME_MOLE = "mole";
  static GAME_DISK = "disk";
  static GAME_SIMON = "simon";

  /**
   * Sends an action asking the sculpture to merge some state
   * @param {Object} state - The state update to merge
   */
  sendMergeState(state) {
    this._dispatch(SculptureActionCreator.MERGE_STATE, state);
  }

  sendStartGame(game) {
    this._dispatch(SculptureActionCreator.START_GAME, {
      game: game
    });
  }

  sendStartMoleGame() {
    this.sendStartGame(SculptureActionCreator.GAME_MOLE);
  }

  sendStartDiskGame() {
    this.sendStartGame(SculptureActionCreator.GAME_DISK);
  }

  sendStartSimonGame() {
    this.sendStartGame(SculptureActionCreator.GAME_SIMON);
  }

  sendRestoreStatus() {
    this._dispatch(SculptureActionCreator.RESTORE_STATUS);
  }

  sendAnimationFrame(frameCallback) {
    this._dispatch(SculptureActionCreator.ANIMATION_FRAME, {
      callback: frameCallback
    });
  }

  sendFinishStatusAnimation() {
    this._dispatch(SculptureActionCreator.FINISH_STATUS_ANIMATION);
  }
}

