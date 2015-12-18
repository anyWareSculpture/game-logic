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
    this._setPerimeter(this._level, this.gameConfig.PERIMETER_COLOR, this.gameConfig.ACTIVE_PERIMETER_INTENSITY);

    // Activate UI indicators
    const controlMappings = this.gameConfig.CONTROL_MAPPINGS;
    // TODO: Clean this up
    for (let diskId of Object.keys(controlMappings.CLOCKWISE_PANELS)) {
      for (let panelId of controlMappings.CLOCKWISE_PANELS[diskId]) {
        this._lights.setIntensity(controlMappings.CLOCKWISE_STRIP, panelId, this.gameConfig.CONTROL_PANEL_INTENSITY);
      }
    }
    for (let diskId of Object.keys(controlMappings.COUNTERCLOCKWISE_PANELS)) {
      for (let panelId of controlMappings.COUNTERCLOCKWISE_PANELS[diskId]) {
        this._lights.setIntensity(controlMappings.COUNTERCLOCKWISE_STRIP, panelId, this.gameConfig.CONTROL_PANEL_INTENSITY);
      }
    }
  }

  // TODO: These end() methods may be obsolete now since everything is reset before every game anyway
  end() {
    this.config.LIGHTS.GAME_STRIPS.forEach((id) => this._lights.setIntensity(id, null, 0));
    // Deactivate shadow lights
    for (let stripId of Object.keys(this.gameConfig.SHADOW_LIGHTS)) {
      const panels = this.gameConfig.SHADOW_LIGHTS[stripId];
      for (let panelId of Object.keys(panels)) {
        this._lights.setIntensity(stripId, panelId, 0);
      }
    }
    // Deactivate perimeter lights (FIXME: This should be part of the end animation)
    for (let panelId of ['0', '1', '2', '3', '4', '5']) {
      this._lights.setIntensity(this.config.LIGHTS.PERIMETER_STRIP, panelId, 0);
      this._lights.setDefaultColor(this.config.LIGHTS.PERIMETER_STRIP, panelId);
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
    // TODO: Break up this method
    if (this._complete) {
      return;
    }

    const controlMappings = this.gameConfig.CONTROL_MAPPINGS;
    const {stripId, panelId} = payload;

    let panels, direction;
    if (stripId === controlMappings.CLOCKWISE_STRIP) {
      panels = controlMappings.CLOCKWISE_PANELS;
      direction = Disk.CLOCKWISE;
    }
    else if (stripId === controlMappings.COUNTERCLOCKWISE_STRIP) {
      panels = controlMappings.COUNTERCLOCKWISE_PANELS;
      direction = Disk.COUNTERCLOCKWISE;
    }
    else {
      // just go with whatever default behaviour
      return;
    }

    let diskId = null, panelIds;
    for (let panelsDiskId of Object.keys(panels)) {
      panelIds = panels[panelsDiskId];
      if (panelIds.includes(panelId)) {
        diskId = panelsDiskId;
        break;
      }
    }

    const lightArray = this._lights;
    if (diskId === null) {
      // Override the default behaviour and keep this panel off because
      // it is still a special panel
      // It just doesn't do anything
      // TODO: Magic literal
      lightArray.setIntensity(stripId, panelId, 0);
      return;
    }
    const disks = this.store.data.get('disks');
    const disk = disks.get(diskId);

    const activePanels = panelIds.reduce((total, currPanelId) => {
      return total + (lightArray.isActive(stripId, currPanelId) ? 1 : 0);
    }, 0);

    // Only need to activate/deactivate them once
    if (activePanels === 1) {
      this._activateDisk(diskId, direction, stripId, panelIds);
    }
    else if (activePanels === 0) {
      this._deactivateDisk(diskId, direction, stripId, panelIds);
    }

    if (disk.isConflicting) {
      this._setDiskControlsColor(diskId, this.config.COLORS.ERROR);
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
      // - If Disk 0 or Disk 2 (the disks with the boundary part of the pattern) is in the
      //   correct location for a minimum amount of time, we trigger the Single Disk Success event

      // Single Disk Success Event
      // - Play success sounds (AudioView)
      // - UI LEDS and disk LED turns location color
      // - If Disk 1 or 2, turn perimeter LED to location color
      // - Lock this disk in position; disable any future interaction
      // - From now on, allow Disk 1 to trigger a Single Disk Success Event
      this._checkWinConditions(disks);
    }
  }

  _actionFinishStatusAnimation(payload) {
    if (this._complete) {
      this.store.moveToNextGame();
    }
  }

  _activateDisk(diskId, direction, stripId, panelIds) {
    const disks = this.store.data.get('disks');
    const disk = disks.get(diskId);
    disk.setDirection(direction);

    panelIds.forEach((panelId) => {
      this._lights.setIntensity(stripId, panelId, this.gameConfig.ACTIVE_CONTROL_PANEL_INTENSITY);
      this._lights.setColor(stripId, panelId, this.store.userColor);
    });
  }

  _deactivateDisk(diskId, direction, stripId, panelIds) {
    const disks = this.store.data.get('disks');
    const disk = disks.get(diskId);
    if (!disk.isStopped) {
      // This fixes a bug where a user wins the level with their hand on the
      // panel and then takes it off. We stop all the disks between levels so
      // all the disks are already off when they let go. This can cause errors
      // TODO: Determine if this check should actually be in Disk#unsetDirection
      disk.unsetDirection(direction);
    }

    panelIds.forEach((panelId) => {
      // TODO: Only deactivate if both panels are inactive
      this._lights.setIntensity(stripId, panelId, this.gameConfig.CONTROL_PANEL_INTENSITY);
      this._lights.setDefaultColor(stripId, panelId);
    });
  }

  _setDiskControlsColor(diskId, color) {
    const controlMappings = this.gameConfig.CONTROL_MAPPINGS;

    const lightArray = this._lights;
    for (let panelId of controlMappings.CLOCKWISE_PANELS[diskId]) {
      lightArray.setColor(controlMappings.CLOCKWISE_STRIP, panelId, color);
    }
    for (let panelId of controlMappings.COUNTERCLOCKWISE_PANELS[diskId]) {
      lightArray.setColor(controlMappings.COUNTERCLOCKWISE_STRIP, panelId, color);
    }
  }

  /**
   * Win conditions:
   * - The three disks needs to be _relatively_ aligned within RELATIVE_TOLERANCE
   * - Any disk must be aligned within ABSOLUTE_TOLERANCE
   */
  _checkWinConditions(disks) {
    for (let diskId of Object.keys(this._targetPositions)) {
      const targetPos = this._targetPositions[diskId];
      const currDisk = disks.get(diskId);
      const diskPos = currDisk.getPosition();

      // Check position relative to neighbor disk
// FIXME: We disabled this for now, as relative tolerance only makes sense
// if we have better disk precision than the tolerance.
//    let prevDiskId = null;
//      if (prevDiskId) {
//        if (Math.abs((targetPos - this._targetPositions[prevDiskId]) -
//                     (diskPos - disks.get(prevDiskId).getPosition())) >
//                     this.gameConfig.RELATIVE_TOLERANCE) {
//          return false;
//        }
//      }
      // Check absolute position
      const d = Math.abs(diskPos - targetPos) % 360;
      const r = d > 180 ? 360 - d : d;
      console.debug(`${diskId} error: ${r}`);
      if (Math.abs(r) > this.gameConfig.ABSOLUTE_TOLERANCE) {
        return false;
      }
//      prevDiskId = diskId;
    }

    this._winGame();
  }

  // TODO: move these public methods up
  getDiskScore(diskId) {
    // We cannot calculate the score of a complete game as we don't have a valid level
    if (this._complete) return 0;

    const disks = this.store.data.get('disks');
    let delta = this._targetPositions[diskId] - disks.get(diskId).getPosition();
    while (delta <= -180) delta += 360;
    while (delta > 180) delta -= 360;
    return Math.abs(delta);
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
      distance += this.getDiskScore(diskId);
    }
    return distance;
  }

  _winGame() {
    this.store.data.get('lights').deactivateAll();
    this._stopAllDisks();

    this.store.setSuccessStatus();

    // Indicate end of level by setting perimeter lights
    this._setPerimeter(this._level, this.store.userColor, this.gameConfig.INACTIVE_PERIMETER_INTENSITY);

    let level = this._level + 1;
    if (level >= this._levels) {
      this._complete = true;
    }

    this._level = level;

    // Indicate start of new level by setting perimeter lights
    if (!this._complete) {
      this._setPerimeter(level, this.gameConfig.PERIMETER_COLOR, this.gameConfig.ACTIVE_PERIMETER_INTENSITY);
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
