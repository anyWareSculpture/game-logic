const events = require('events');

const KnockGame = require('./knock-game');

const STATE_UPDATE_CURRENT_GAME = "game";

export default class Sculpture extends events.EventEmitter {
  constructor() {
    this._currentGame = null;

    // Temporarily here to make the knock game work
    this.currentGame = new KnockGame();
  }

  get currentGame() {
    return this._currentGame;
  }

  set currentGame(game) {
    this._currentGame = game;

    if (this._currentGame) {
      this._currentGame.on(GameConstants.EVENT_UPDATE, this._handleGameUpdate);
    }
  }

  get isPlayingKnockGame() {
    return this.currentGame instanceof KnockGame;
  }

  /**
   * Event handler to be called every frame for updates
   */
  onFrame() {
    if (this.currentGame) {
      this.currentGame.onFrame();
    }
  }

  mergeUpdate(update) {
    //TODO: Merge top-level properties
    if (update[STATE_UPDATE_CURRENT_GAME]) {
      if (!this.currentGame) {
        //TODO
        throw new Error("");
      }

      this.currentGame.mergeUpdate(update[STATE_UPDATE_CURRENT_GAME]);
    }
  }

  _handleGameUpdate() {
    
  }
}
