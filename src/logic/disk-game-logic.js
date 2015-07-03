const PanelsActionCreator = require('../actions/panels-action-creator');
const Disk = require('../utils/disk');

const LEVEL_TARGET_POSITIONS = [
  {
    disk1: 10,
    disk2: 15,
    disk3: 20
  },
  {
    disk1: 5,
    disk2: 10,
    disk3: 15
  },
  {
    disk1: 2,
    disk2: 3,
    disk3: 5
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
  // These are automatically added to the sculpture store
  static trackedProperties = {
    level: 0
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
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this)
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

  get _targetPositions() {
    const level = this.data.get("level");
    return LEVEL_TARGET_POSITIONS[level];
  }
}
