const BaseActionCreator = require('./base-action-creator');

export default class MoleGameActionCreator extends BaseActionCreator {
  // Action types
  static ANIMATION_FINISH = "animation-finish";

  static enabledWhileSculptureLocked() {
    return [
      MoleGameActionCreator.ANIMATION_FINISH
    ];
  }

  /**
   * Sends an action telling the mole game to finish off any
   * animation being played and restore the sculpture to a responsive
   * state
   */
  sendFinishAnimation() {
    this._dispatch(MoleGameActionCreator.ANIMATION_FINISH);
  }
}
