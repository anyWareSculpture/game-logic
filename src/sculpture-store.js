const events = require('events');

const GAMES = require('./constants/games');
const HandshakeGameLogic = require('./logic/handshake-game-logic');
const MoleGameLogic = require('./logic/mole-game-logic');
const DiskGameLogic = require('./logic/disk-game-logic');
const SimonGameLogic = require('./logic/simon-game-logic');
const SculptureActionCreator = require('./actions/sculpture-action-creator');
const PanelsActionCreator = require('./actions/panels-action-creator');
const DisksActionCreator = require('./actions/disks-action-creator');
const TrackedData = require('./utils/tracked-data');
const TrackedSet = require('./utils/tracked-set');
const LightArray = require('./utils/light-array');
const Disk = require('./utils/disk');

export default class SculptureStore extends events.EventEmitter {
  static EVENT_CHANGE = "change";

  static STATUS_READY = "ready";
  static STATUS_LOCKED = "locked";
  static STATUS_SUCCESS = "success";
  static STATUS_FAILURE = "failure";

  constructor(dispatcher, config) {
    super();

    this.data = new TrackedData({
      status: SculptureStore.STATUS_READY,
      panelAnimation: null,
      currentGame: null,
      handshakes: new TrackedSet(),
      lights: new LightArray({
        // stripId : number of panels
        '0': 10,
        '1': 10,
        '2': 10
      }),
      disks: new TrackedData({
        disk0: new Disk(),
        disk1: new Disk(),
        disk2: new Disk()
      }),
      handshake: new TrackedData(HandshakeGameLogic.trackedProperties),
      mole: new TrackedData(MoleGameLogic.trackedProperties),
      disk: new TrackedData(DiskGameLogic.trackedProperties),
      simon: new TrackedData(SimonGameLogic.trackedProperties)
    });

    this.config = config;
    this.currentGameLogic = null;
    this.dispatcher = dispatcher;
    this.dispatchToken = this._registerDispatcher(this.dispatcher);
    this.sculptureActionCreator = new SculptureActionCreator(this.dispatcher);
  }

  /**
   * @returns {Boolean} Returns whether the handshake game is currently being played
   */
  get isPlayingHandshakeGame() {
    return this.currentGameLogic instanceof HandshakeGameLogic;
  }

  /**
   * @returns {Boolean} Returns whether the mole game is currently being played
   */
  get isPlayingMoleGame() {
    return this.currentGameLogic instanceof MoleGameLogic;
  }

  /**
   * @returns {Boolean} Returns whether the disk game is currently being played
   */
  get isPlayingDiskGame() {
    return this.currentGameLogic instanceof DiskGameLogic;
  }

  /**
   * @returns {Boolean} Returns whether the simon game is currently being played
   */
  get isPlayingSimonGame() {
    return this.currentGameLogic instanceof SimonGameLogic;
  }

  /**
   * @returns {Boolean} Returns true if no game is currently being played
   */
  get isPlayingNoGame() {
    return !this.currentGame;
  }

  /**
   * @returns {String} Returns the current user's username
   */
  get username() {
    return this.config.username;
  }

  /**
   * 
   */
  get userColor() {
    return this.config.USER_COLORS[this.config.username];
  }

  /**
   * @returns {Boolean} Returns whether a panel animation is running
   */
  get isPanelAnimationRunning() {
    const panelAnimation = this.data.get('panelAnimation');
    return panelAnimation ? panelAnimation.isRunning : false;
  }

  /**
   * Restores the sculpture's status back to ready
   * Make sure to publish changes after calling this -- not necessary if an action is currently being handled already
   */
  restoreStatus() {
    this.data.set('status', SculptureStore.STATUS_READY);
  }

  /**
   * Locks the sculpture from any input
   * Make sure to publish changes after calling this -- not necessary if an action is currently being handled already
   */
  lock() {
    this.data.set('status', SculptureStore.STATUS_LOCKED);
  }

  /**
   * Sets the sculpture's status to success
   */
  setSuccessStatus() {
    this.data.set('status', SculptureStore.STATUS_SUCCESS);
  }

  /**
   * Sets the sculpture's status to failure
   */
  setFailureStatus() {
    this.data.set('status', SculptureStore.STATUS_FAILURE);
  }

  /**
   * Returns whether the sculpture's current status is ready
   */
  get isReady() {
    return this.data.get('status') === SculptureStore.STATUS_READY;
  }

  /**
   * Returns whether the sculpture's current status is locked
   */
  get isLocked() {
    return this.data.get('status') === SculptureStore.STATUS_LOCKED;
  }

  /**
   * Returns whether the sculpture's current status is success
   */
  get isStatusSuccess() {
    return this.data.get('status') === SculptureStore.STATUS_SUCCESS;
  }

  /**
   * Plays the given animation
   */
  playAnimation(animation) {
    this.data.set('panelAnimation', animation);
    animation.play(this.dispatcher);
  }

  /**
   * Starts the next game in the game sequence
   */
  moveToNextGame() {
    const nextGame = this._getNextGame();

    this._startGame(nextGame);
  }

  _startGame(game) {
    const gameLogicClasses = {
      [GAMES.HANDSHAKE]: HandshakeGameLogic,
      [GAMES.MOLE]: MoleGameLogic,
      [GAMES.DISK]: DiskGameLogic,
      [GAMES.SIMON]: SimonGameLogic
    };
    const GameLogic = gameLogicClasses[game];
    if (!GameLogic) {
      throw new Error(`Unrecognized game: ${game}`);
    }

    this.data.set('currentGame', game);
    this.currentGameLogic = new GameLogic(this, this.config);
    this.currentGameLogic.start();
  }

  _registerDispatcher(dispatcher) {
    return dispatcher.register(this._handleActionPayload.bind(this));
  }

  _handleActionPayload(payload) {
    // Protects against accidentally modifying the store outside of an action
    this._assertNoChanges();

    if (this.isLocked && !this._actionCanRunWhenLocked(payload.actionType)) {
      return;
    }

    this._delegateAction(payload);

    if (this.currentGameLogic !== null) {
      this.currentGameLogic.handleActionPayload(payload);
    }

    this._publishChanges();
  }

  _assertNoChanges() {
    if (this.data.hasChanges()) {
      throw new Error("Store was changed outside of an action");
    }
  }

  _publishChanges() {
    const changes = this.data.getChangedCurrentValues();

    if (Object.keys(changes).length) {
      this.emit(SculptureStore.EVENT_CHANGE, changes);
    }

    this.data.clearChanges();
  }

  _actionCanRunWhenLocked(actionType) {
    const enabledActions = new Set([
      SculptureActionCreator.MERGE_STATE
    ]);
    return enabledActions.has(actionType);
  }

  _delegateAction(payload) {
    const actionHandlers = {
      [SculptureActionCreator.START_GAME]: this._actionStartGame.bind(this),
      [SculptureActionCreator.MERGE_STATE]: this._actionMergeState.bind(this),
      [SculptureActionCreator.RESTORE_STATUS]: this._actionRestoreStatus.bind(this),
      [SculptureActionCreator.ANIMATION_FRAME]: this._actionAnimationFrame.bind(this),
      [SculptureActionCreator.FINISH_STATUS_ANIMATION]: this._actionFinishStatusAnimation.bind(this),
      [SculptureActionCreator.HANDSHAKE_ACTIVATE]: this._actionHandshakeActivate.bind(this),
      [SculptureActionCreator.HANDSHAKE_DEACTIVATE]: this._actionHandshakeDeactivate.bind(this),
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
      [DisksActionCreator.DISK_UPDATE]: this._actionDiskUpdate.bind(this)
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) {
      actionHandler(payload);
    }
  }

  _actionStartGame(payload) {
    const game = payload.game;
    if (!game) {
      throw new Error(`Unrecognized game: ${payload.game}`);
    }

    this._startGame(game);
  }

  _actionMergeState(payload) {
    if (payload.metadata.from === this.username) {
      return;
    }

    const mergeFunctions = {
      status: this._mergeStatus.bind(this),
      lights: this._mergeLights.bind(this),
      disks: this._mergeDisks.bind(this),
      mole: this._mergeMole.bind(this)
    };

    for (let propName of Object.keys(payload)) {
      const mergeFunction = mergeFunctions[propName];
      if (mergeFunction) {
        mergeFunction(payload[propName]);
      }
    }
  }

  _actionRestoreStatus(payload) {
    this.restoreStatus();
  }

  _actionAnimationFrame(payload) {
    const {callback} = payload;
    
    callback();
  }

  _actionFinishStatusAnimation(payload) {
    this.restoreStatus();
  }

  _actionHandshakeActivate(payload) {
    this.data.get('handshakes').add(payload.user);
  }

  _actionHandshakeDeactivate(payload) {
    this.data.get('handshakes').delete(payload.user);
  }

  _actionPanelPressed(payload) {
    if (!this.isReady) {
      return;
    }

    const {stripId, panelId, pressed} = payload;

    const lightArray = this.data.get('lights');
    lightArray.activate(stripId, panelId, pressed);
    // This is a reasonable default behaviour that can be overridden in
    // a game logic class if necessary
    if (pressed) {
      lightArray.setColor(stripId, panelId, this.userColor);
    }
    else {
      lightArray.setDefaultColor(stripId, panelId);
    }
  }

  _actionDiskUpdate(payload) {
    let {diskId, position, direction, user} = payload;

    if (typeof diskId === 'undefined') {
      return;
    }

    const disk = this.data.get('disks').get(diskId);

    if (typeof position !== 'undefined') {
      disk.rotateTo(position);
    }

    if (typeof direction !== 'undefined') {
      disk.setDirection(direction);
    }

    if (typeof user !== 'undefined' && user !== null) {
      disk.setUser(user);
    }
  }

  _actionMergeState(payload) {
    const metadata = payload.metadata;
    if (metadata.from === this.username) {
      return;
    }

    const mergeFunctions = {
      status: this._mergeStatus.bind(this),
      currentGame: this._mergeCurrentGame.bind(this),
      handshakes: this._mergeHandshakes.bind(this),
      lights: this._mergeLights.bind(this),
      disks: this._mergeDisks.bind(this),
      mole: this._mergeMole.bind(this),
      disk: this._mergeDisk.bind(this),
      simon: this._mergeSimon.bind(this),
    };

    for (let propName of Object.keys(payload)) {
      const mergeFunction = mergeFunctions[propName];
      if (mergeFunction) {
        mergeFunction(payload[propName], metadata);
      }
    }
  }

  _mergeStatus(newStatus, metadata) {
    this.data.set('status', newStatus);
  }

  _mergeCurrentGame(newCurrentGame, metadata) {
    this._startGame(newCurrentGame);
  }

  _mergeHandshakes(handshakesChanges) {
    const handshakes = this.data.get('handshakes');

    for (let username of Object.keys(handshakesChanges)) {
      const value = handshakesChanges[username];
      if (value) {
        handshakes.add(username);
      }
      else {
        handshakes.delete(username);
      }
    }
  }

  _mergeLights(lightChanges, metadata) {
    const lightArray = this.data.get('lights');

    for (let stripId of Object.keys(lightChanges)) {
      const panels = lightChanges[stripId].panels;
      for (let panelId of Object.keys(panels)) {
        const panelChanges = panels[panelId];
        if (panelChanges.hasOwnProperty("intensity")) {
          lightArray.setIntensity(stripId, panelId, panelChanges.intensity);
        }
        if (panelChanges.hasOwnProperty("color")) {
          lightArray.setColor(stripId, panelId, panelChanges.color);
        }
        if (panelChanges.hasOwnProperty("active")) {
          lightArray.activate(stripId, panelId, panelChanges.active);
          const color = this.config.USER_COLORS[metadata.from];
          lightArray.setColor(stripId, panelId, color);
        }
      }
    }
  }

  _mergeDisks(disksChanges, metadata) {
    //TODO
    console.log(disksChanges);
  }

  _mergeMole(moleChanges, metadata) {
    for (let propName of Object.keys(moleChanges)) {
      this.data.get('mole').set(propName, moleChanges[propName]);
    }
  }

  _mergeDisk(diskChanges, metadata) {
    //TODO
  }

  _mergeSimon(simonChanges, metadata) {
    //TODO
  }

  _getNextGame() {
    const currentGame = this.data.get("currentGame");
    let index = this.config.GAMES_SEQUENCE.indexOf(currentGame);
    index = (index + 1) % this.config.GAMES_SEQUENCE.length;

    return this.config.GAMES_SEQUENCE[index];
  }
}

