const PanelsActionCreator = require('../actions/panels-action-creator');
const DisksActionCreator = require('../actions/disks-action-creator');

const Disk = require('../utils/disk');

const ANIMATION_NONE = false;

const LEVEL_TARGET_POSITIONS = [
  {
    disk0: 10,
    disk1: 15,
    disk2: 20
  },
  {
    disk0: 5,
    disk1: 10,
    disk2: 15
  },
  {
    disk0: 2,
    disk1: 3,
    disk2: 5
  }
];

const CONTROL_MAPPINGS = {
  // stripId
  '0': {
    // panelId
    '3': {
      // diskId
      disk0: Disk.CLOCKWISE
    },
    '4': {
      disk1: Disk.CLOCKWISE
    },
    '5': {
      disk2: Disk.CLOCKWISE
    }
  },
  '1': {
    // panelId
    '3': {
      // diskId
      disk0: Disk.COUNTERCLOCKWISE
    },
    '4': {
      disk1: Disk.COUNTERCLOCKWISE
    },
    '5': {
      disk2: Disk.COUNTERCLOCKWISE
    }
  }
};

export default class DiskGameLogic {
  static ANIMATION_SUCCESS = "success";

  // These are automatically added to the sculpture store
  static trackedProperties = {
    level: 0,
    animation: ANIMATION_NONE
  };

  constructor(store) {
    this.store = store;
  }

  get data() {
    return this.store.data.get('disk');
  }

  start() {
    this._enableCurrentTargetPanel();
  }

  handleActionPayload(payload) {
    const actionHandlers = {
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
      [DisksActionCreator.DISK_UPDATE]: this._actionDiskUpdate.bind(this)
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) {
      actionHandler(payload);
    }
  }

  _actionPanelPressed(payload) {
    let {stripId, panelId, pressed} = payload;

    if (!CONTROL_MAPPINGS.hasOwnProperty(stripId) || !CONTROL_MAPPINGS[stripId].hasOwnProperty(panelId)) {
      return;
    }

    const disks = this.store.data.get('disks');
    const targetDisks = CONTROL_MAPPINGS[stripId][panelId];
    for (let diskId of Object.keys(targetDisks)) {
      const direction = targetDisks[diskId];
      disks.get(diskId).setDirection(direction);
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

    this._checkWinConditions(disks);
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
    this.store.lock();

    this.data.set("animation", DiskGameLogic.ANIMATION_SUCCESS);
  }

  get _targetPositions() {
    const level = this.data.get("level");
    return LEVEL_TARGET_POSITIONS[level];
  }
}