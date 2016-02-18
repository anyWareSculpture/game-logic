const BaseActionCreator = require('./base-action-creator');

const GAMES = require('../constants/games');

export default class SculptureActionCreator extends BaseActionCreator {
  // Action types
  static MERGE_STATE = "merge-state";
  static START_GAME = "start-game";
  static START_NEXT_GAME = "start-next-game";
  static RESTORE_STATUS = "restore-status";
  static ANIMATION_FRAME = "animation-frame";
  static FINISH_STATUS_ANIMATION = "finish-status-animation";
  static HANDSHAKE_ACTIVATE = "handshake-activate";
  static HANDSHAKE_DEACTIVATE = "handshake-deactivate";

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

  sendStartNextGame(game) {
    this._dispatch(SculptureActionCreator.START_NEXT_GAME);
  }

  sendStartMoleGame() {
    this.sendStartGame(GAMES.MOLE);
  }

  sendStartDiskGame() {
    this.sendStartGame(GAMES.DISK);
  }

  sendStartSimonGame() {
    this.sendStartGame(GAMES.SIMON);
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

  sendHandshakeActivate(user) {
    this._dispatch(SculptureActionCreator.HANDSHAKE_ACTIVATE, {
      user: user
    });
  }

  sendHandshakeDeactivate(user) {
    this._dispatch(SculptureActionCreator.HANDSHAKE_DEACTIVATE, {
      user: user
    });
  }
}

