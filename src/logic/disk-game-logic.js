const PanelsActionCreator = require('../actions/panels-action-creator');
const DisksActionCreator = require('../actions/disks-action-creator');
const SculptureActionCreator = require('../actions/sculpture-action-creator');

const Disk = require('../utils/disk');

const DEFAULT_LEVEL = 0;

export default class DiskGameLogic {
  // These are automatically added to the sculpture store
  static trackedProperties = {
    level: DEFAULT_LEVEL
  };

  constructor(store, config) {
    this.store = store;
    this.config = config;
    this.gameConfig = config.DISK_GAME;

    this._complete = false;
  }

  get data() {
    return this.store.data.get('disk');
  }

  start() {
    this._level = DEFAULT_LEVEL;
  }

  end() {
    let lights = this.store.data.get('lights');
    lights.deactivateAll();
    lights.stripIds.forEach((id) => lights.setIntensity(id, null, 0));
  }

  handleActionPayload(payload) {
    const actionHandlers = {
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
      [DisksActionCreator.DISK_UPDATE]: this._actionDiskUpdate.bind(this),
      [SculptureActionCreator.FINISH_STATUS_ANIMATION]: this._actionFinishStatusAnimation.bind(this)
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) {
      actionHandler(payload);
    }
  }

  _actionPanelPressed(payload) {
    let {stripId, panelId, pressed} = payload;

    const controlMappings = this.gameConfig.CONTROL_MAPPINGS;
    if (this._complete || !controlMappings.hasOwnProperty(stripId) || !controlMappings[stripId].hasOwnProperty(panelId)) {
      return;
    }

    const disks = this.store.data.get('disks');
    const targetDisks = controlMappings[stripId][panelId];
    
    for (let diskId of Object.keys(targetDisks)) {
      const direction = targetDisks[diskId];
      const disk = disks.get(diskId);
      if (pressed) {
        disk.setDirection(direction);
      }
      else if (!disk.isStopped) {
        disk.unsetDirection(direction);
      }
    }
  }

  _actionDiskUpdate(payload) {
    const {diskId, position, direction, state} = payload;

    const disks = this.store.data.get('disks');
    const disk = disks.get(diskId);

    if (typeof position !== 'undefined') {
      disk.rotateTo(position);
    }
    if (typeof direction !== 'undefined') {
      disk.setDirection(direction);
    }
    if (typeof state !== 'undefined') {
      disk.setState(state);
    }

    if (!this.store.isStatusSuccess) {
      this._checkWinConditions(disks);
    }
  }

  _actionFinishStatusAnimation(payload) {
    if (this._complete) {
      this.store.moveToNextGame();
    }
  }

  _checkWinConditions(disks) {
    for (let diskId of Object.keys(this._targetPositions)) {
      const targetPosition = this._targetPositions[diskId];
      if (disks.get(diskId).getPosition() !== targetPosition) {
        return false;
      }
    }

    this._winGame();
  }

  _winGame() {
    this.store.data.get('lights').deactivateAll();
    this._stopAllDisks();

    this.store.setSuccessStatus();

    let level = this._level + 1;
    if (level >= this._levels) {
      this._complete = true;
    }

    this._level = level;
  }

  _stopAllDisks() {
    const disks = this.store.data.get('disks');

    for (let diskId of disks) {
      disks.get(diskId).stop();
    }
  }

  get _targetPositions() {
    const level = this._level;
    return this.gameConfig.TARGET_POSITIONS_LEVELS[level];
  }

  get _levels() {
    return this.gameConfig.TARGET_POSITIONS_LEVELS.length;
  }

  get _level() {
    return this.data.get('level');
  }

  set _level(value) {
    return this.data.set('level', value);
  }
}
