const BaseActionCreator = require('./base-action-creator');

export default class SculptureActionCreator extends BaseActionCreator {
  // Action types
  static MERGE_STATE = "merge-state";
  static START_GAME = "start-game";

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

  sendGame(game) {
    this._dispatch(SculptureActionCreator.START_GAME, {
      game: game
    });
  }

  sendStartMoleGame() {
    this.sendGame(SculptureActionCreator.GAME_MOLE);
  }

  sendStartDiskGame() {
    this.sendGame(SculptureActionCreator.GAME_DISK);
  }

  sendStartSimonGame() {
    this.sendGame(SculptureActionCreator.GAME_SIMON);
  }
}

