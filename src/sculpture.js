const events = require('events');

const GameConstants = require('./game-constants');
const KnockGame = require('./knock-game');
const VersionedStore = require('./versioned-store');

const STATE_UPDATE_CURRENT_GAME = "game";

const STATUS_RUNNING = "running";
const STATUS_LOCKED = "locked";

export default class Sculpture extends events.EventEmitter {
  constructor() {
    super();

    this._currentGame = null;

    // Temporarily here to make the knock game work
    this.currentGame = new KnockGame();

    this.store = new VersionedStore({
      status: STATUS_RUNNING
    });
  }

  // Store properties
  get status() {
    return this.store.get("status");
  }

  // Store Methods
  lockSculpture() {
    this.store.set("status", STATUS_LOCKED);
  }

  unlockSculpture() {
    this.store.set("status", STATUS_RUNNING);
  }

  // Current Game

  get currentGame() {
    return this._currentGame;
  }

  set currentGame(game) {
    this._currentGame = game;
  }

  get isPlayingKnockGame() {
    return this.currentGame instanceof KnockGame;
  }

  /**
   * Event handler to be called every frame for updates
   */
  onFrame() {
    if (this.status === STATUS_LOCKED) {
      return;
    }

    if (this.currentGame) {
      this.currentGame.onFrame();
    }

    this.emitStateUpdate();
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

  emitStateUpdate() {
    const thisUpdate = this.store.getChangedCurrentValues();
    this.store.clearChanges();

    if (this.currentGame) {
      const gameUpdate = this.currentGame.store.getChangedCurrentValues();
      this.currentGame.store.clearChanges();
      
      if (Object.keys(gameUpdate).length) {
        thisUpdate[STATE_UPDATE_CURRENT_GAME] = gameUpdate;
      }
    }
    
    if (Object.keys(thisUpdate).length) {
      this.emit(GameConstants.EVENT_UPDATE, thisUpdate);
    }
  }
}
