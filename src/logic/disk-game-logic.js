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

  get _lights() {
    return this.store.data.get('lights');
  }

  start() {
    this._level = DEFAULT_LEVEL;
    this._complete = false;

    // Activate shadow lights
    for (let stripId of Object.keys(this.gameConfig.SHADOW_LIGHTS)) {
      const panels = this.gameConfig.SHADOW_LIGHTS[stripId];
      for (let panelId of Object.keys(panels)) {
        this._lights.setIntensity(stripId, panelId, this.gameConfig.SHADOW_LIGHT_INTENSITY);
      }
    }

    // Indicate start of new level by setting perimeter lights
    this._setPerimeter(this._level, this.gameConfig.PERIMETER_COLOR, this.gameConfig.ACTIVE_PERIMETER_INTENSITY)

    // Activate UI indicators
    for (let stripId of Object.keys(this.gameConfig.CONTROL_MAPPINGS)) {
      const panels = this.gameConfig.CONTROL_MAPPINGS[stripId];
      for (let panelId of Object.keys(panels)) {
        this._lights.setIntensity(stripId, panelId, this.gameConfig.AVAILABLE_PANEL_INTENSITY);
      }
    }
  }

  end() {
    this.config.LIGHTS.GAME_STRIPS.forEach((id) => this._lights.setIntensity(id, null, 0));
    // Deactivate shadow lights
    for (let stripId of Object.keys(this.gameConfig.SHADOW_LIGHTS)) {
      const panels = this.gameConfig.SHADOW_LIGHTS[stripId];
      for (let panelId of Object.keys(panels)) {
        this._lights.setIntensity(stripId, panelId, 0);
      }
    }
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
      // FIXME:
      // Instead of just checking for the win condition, we want to:
      // o If Disk 0 or Disk 2 (the disks with the boundary part of the pattern) is in the 
      //   correct location for a minimum amount of time, we trigger the Single Disk Success event

      // Single Disk Success Event
      // o Play success sounds (AudioView)
      // o UI LEDS and disk LED turns location color
      // o If Disk 1 or 2, turn perimeter LED to location color
      // o Lock this disk in position; disable any future interaction
      // o From now on, allow Disk 1 to trigger a Single Disk Success Event
      this._checkWinConditions(disks);
    }
  }

  _actionFinishStatusAnimation(payload) {
    if (this._complete) {
      this.store.moveToNextGame();
    }
  }

  /**
   * Win conditions:
   * o The three disks needs to be _relatively_ aligned within RELATIVE_TOLERANCE
   * o Any disk must be aligned within ABSOLUTE_TOLERANCE
   */
  _checkWinConditions(disks) {
    let prevDiskId = null;
    for (let diskId of Object.keys(this._targetPositions)) {
      const targetPos = this._targetPositions[diskId];
      const currDisk = disks.get(diskId);
      const diskPos = currDisk.getPosition();

      // Check position relative to neighbor disk
      if (prevDiskId) {
        if (Math.abs((targetPos - this._targetPositions[prevDiskId]) -
                     (diskPos - disks.get(prevDiskId).getPosition())) > 
                     this.gameConfig.RELATIVE_TOLERANCE) {
          return false;
        }
      }
      // Check absolute position
      if (Math.abs(diskPos - targetPos) > this.gameConfig.ABSOLUTE_TOLERANCE) {
        return false;
      }
      prevDiskId = diskId;
    }

    this._winGame();
  }

  /**
   * Current score (the total number of degrees away from solution).
   * For 3 disks, this will be between 0 and 540
   */
  getScore(disks) {
    // We cannot calculate the score of a complete game as we don't have a valid level
    if (this._complete) return 0;

    let distance = 0;
    for (let diskId of Object.keys(this._targetPositions)) {
      let delta = this._targetPositions[diskId] - disks.get(diskId).getPosition();
      while (delta <= -180) delta += 360;
      while (delta > 180) delta -= 360;      
      distance += Math.abs(delta);
    }
    return distance;
  }

  _winGame() {
    this.store.data.get('lights').deactivateAll();
    this._stopAllDisks();

    this.store.setSuccessStatus();

    // Indicate end of level by setting perimeter lights
    this._setPerimeter(this._level, this.store.userColor, this.gameConfig.INACTIVE_PERIMETER_INTENSITY)

    let level = this._level + 1;
    if (level >= this._levels) {
      this._complete = true;
    }

    this._level = level;

    // Indicate start of new level by setting perimeter lights
    if (!this._complete) {
      this._setPerimeter(level, this.gameConfig.PERIMETER_COLOR, this.gameConfig.ACTIVE_PERIMETER_INTENSITY)
    }
}

  /**
   * Set perimeter lights for the given level to the given color and intensity
   */
  _setPerimeter(level, color, intensity) {
    const perimeter = this.gameConfig.LEVELS[level].perimeter;
    for (let stripId of Object.keys(perimeter)) {
      for (let panelId of perimeter[stripId]) {
        this._lights.setColor(stripId, panelId, color);
        this._lights.setIntensity(stripId, panelId, intensity);
      }
    }
  }

  _stopAllDisks() {
    const disks = this.store.data.get('disks');

    for (let diskId of disks) {
      disks.get(diskId).stop();
    }
  }

  get _targetPositions() {
    const level = this._level;
    return this.gameConfig.LEVELS[level].disks;
  }

  get _levels() {
    return this.gameConfig.LEVELS.length;
  }

  get _level() {
    return this.data.get('level');
  }

  set _level(value) {
    return this.data.set('level', value);
  }
}
