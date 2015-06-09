const KnockGameActions = require('./game-constants').knockGame.actions;

export default class KnockGameActionCreators {
  constructor(dispatcher) {
    this._dispatcher = dispatcher;
  }

  _dispatch(...args) {
    this._dispatcher.dispatch.apply(this._dispatcher, args);
  }

  sendPattern(pattern) {
    this._dispatch({
      actionType: KnockGameActions.SET_KNOCK_PATTERN,
      pattern: pattern
    });
  }
};
