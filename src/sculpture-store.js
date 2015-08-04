const events = require('events');

const MoleGameLogic = require('./logic/mole-game-logic');
const DiskGameLogic = require('./logic/disk-game-logic');
const SimonGameLogic = require('./logic/simon-game-logic');
const SculptureActionCreator = require('./actions/sculpture-action-creator');
const PanelsActionCreator = require('./actions/panels-action-creator');
const DisksActionCreator = require('./actions/disks-action-creator');
const MoleGameActionCreator = require('./actions/mole-game-action-creator');
const TrackedData = require('./utils/tracked-data');
const LightArray = require('./utils/light-array');
const Disk = require('./utils/disk');

export default class SculptureStore extends events.EventEmitter {
  static EVENT_CHANGE = "change";

  static STATUS_READY = "ready";
  static STATUS_LOCKED = "locked";
  static STATUS_SUCCESS = "success";
  static STATUS_FAILURE = "failure";

  static GAME_MOLE = "mole";
  static GAME_DISK = "disk";
  static GAME_SIMON = "simon";

  constructor(dispatcher) {
    super();

    this.data = new TrackedData({
      status: SculptureStore.STATUS_READY,
      panelAnimation: null,
      currentGame: null,
      lights: new LightArray({
        // stripId : number of panels
        '0': 10,
        '1': 10,
        '2': 10
      }, 0, "user0"), //TODO: Proper default color based on user
      disks: new TrackedData({
        disk0: new Disk(),
        disk1: new Disk(),
        disk2: new Disk()
      }),
      mole: new TrackedData(MoleGameLogic.trackedProperties),
      disk: new TrackedData(DiskGameLogic.trackedProperties),
      simon: new TrackedData(SimonGameLogic.trackedProperties)
    });

    this.currentGame = null;
    this.dispatchToken = this._registerDispatcher(dispatcher);
    this.sculptureActionCreator = new SculptureActionCreator(dispatcher);
  }

  /**
   * @returns {Boolean} Returns whether the mole game is currently being played
   */
  get isPlayingMoleGame() {
    return this.currentGame instanceof MoleGameLogic;
  }

  /**
   * @returns {Boolean} Returns whether the disk game is currently being played
   */
  get isPlayingDiskGame() {
    return this.currentGame instanceof DiskGameLogic;
  }

  /**
   * @returns {Boolean} Returns whether the simon game is currently being played
   */
  get isPlayingSimonGame() {
    return this.currentGame instanceof SimonGameLogic;
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

  get isLocked() {
    return this.data.get('status') === SculptureStore.STATUS_LOCKED;
  }

  _startGame(game, gameLogic) {
    this.data.set('currentGame', game);
    this.currentGame = gameLogic;
    this.currentGame.start();
  }

  _publishChanges() {
    const changes = this.data.getChangedCurrentValues();

    if (Object.keys(changes).length) {
      this.emit(SculptureStore.EVENT_CHANGE, changes);
    }

    this.data.clearChanges();
  }

  _registerDispatcher(dispatcher) {
    return dispatcher.register(this._handleActionPayload.bind(this));
  }

  _handleActionPayload(payload) {
    if (this.isLocked && !this._actionCanRunWhenLocked(payload.actionType)) {
      return;
    }

    this._delegateAction(payload);

    if (this.currentGame !== null) {
      this.currentGame.handleActionPayload(payload);
    }

    this._publishChanges();
  }

  _actionCanRunWhenLocked(actionType) {
    const enabledActions = new Set([
      SculptureActionCreator.MERGE_STATE,
      MoleGameActionCreator.ANIMATION_FINISH
    ]);
    return enabledActions.has(actionType);
  }

  _delegateAction(payload) {
    const actionHandlers = {
      [SculptureActionCreator.START_GAME]: this._actionStartGame.bind(this),
      [SculptureActionCreator.MERGE_STATE]: this._actionMergeState.bind(this),
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
      [DisksActionCreator.DISK_UPDATE]: this._actionDiskUpdate.bind(this)
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) {
      actionHandler(payload);
    }
  }

  _actionStartGame(payload) {
    const game_logic_classes = {
      [SculptureActionCreator.GAME_MOLE]: MoleGameLogic,
      [SculptureActionCreator.GAME_DISK]: DiskGameLogic,
      [SculptureActionCreator.GAME_SIMON]: SimonGameLogic
    };
    const games = {
      [SculptureActionCreator.GAME_MOLE]: SculptureStore.GAME_MOLE,
      [SculptureActionCreator.GAME_DISK]: SculptureStore.GAME_DISK,
      [SculptureActionCreator.GAME_SIMON]: SculptureStore.GAME_SIMON
    };

    const game = games[payload.game];
    const GameLogic = game_logic_classes[payload.game];
    if (!game || !GameLogic) {
      throw new Error(`Unrecognized game: ${payload.game}`);
    }

    this._startGame(game, new GameLogic(this));
  }

  _actionMergeState(payload) {
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

  _actionPanelPressed(payload) {
    const {stripId, panelId, pressed} = payload;
    this.data.get('lights').activate(stripId, panelId, pressed);
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

  _mergeStatus(newStatus) {
    this.data.set('status', newStatus);
  }

  _mergeLights(lightChanges) {
    for (let stripId of Object.keys(lightChanges)) {
      const panels = lightChanges[stripId].panels;
      for (let panelId of Object.keys(panels)) {
        const panelChanges = panels[panelId];
        if (panelChanges.hasOwnProperty("intensity")) {
          this.data.get('lights').setIntensity(stripId, panelId, panelChanges.intensity);
        }
        if (panelChanges.hasOwnProperty("active")) {
          //TODO: Set color based on metadata
          this.data.get('lights').activate(stripId, panelId, panelChanges.active);
        }
      }
    }
  }

  _mergeDisks(diskChanges) {
    //TODO
    console.log(diskChanges);
  }

  _mergeMole(moleChanges) {
    for (let propName of Object.keys(moleChanges)) {
      this.data.get('mole').set(propName, moleChanges[propName]);
    }
  }
}
