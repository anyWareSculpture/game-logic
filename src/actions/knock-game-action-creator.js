const BaseActionCreator = require('./base-action-creator');
const KnockGameActions = require('./game-constants').knockGame.actions;

export default class KnockGameActionCreator extends BaseActionCreator {
  sendSetPattern(pattern) {
    this._dispatch(KnockGameActions.SET_KNOCK_PATTERN, {
      pattern: pattern
    });
  }
};
