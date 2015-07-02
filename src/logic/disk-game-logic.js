const PanelsActionCreator = require('../actions/panels-action-creator');

const TARGET_POSITIONS_LEVELS = [
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
  }
}
