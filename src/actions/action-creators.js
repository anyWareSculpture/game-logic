const KnockGameActionCreators = require("./knock-game-actions");

export default class ActionCreators {
  /**
   * Creates all 
   */
  constructor(dispatcher) {
    const dispatchFunction = dispatcher.dispatch;
    this.knockGame = new KnockGameActionCreators(dispatchFunction);
  }
};
