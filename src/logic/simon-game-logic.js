const PanelsActionCreator = require('../actions/panels-action-creator');

PATTERN_LEVELS = [
  // level 0 sequence
  [
    // sequence step = {stripId: {panelId: active}}
    // All other panels and strips will be turned inactive
    {'0': {'3': true}},
    {'0': {'4': true}},
    {'0': {'5': true}},
  ],
  // level 1 sequence
  [
    {'1': {'3': true}},
    {'1': {'5': true}},
    {'1': {'4': true}},
  ],
  // level 2 sequence
  [
    {'2': {'3': true}},
    {'2': {'5': true}},
    {'2': {'4': true}},
    {'2': {'6': true}},
  ],
];

const TARGET_PANEL_INTENSITY = 100;
const PANEL_OFF_INTENSITY = 0;
const SEQUENCE_ANIMATION_FRAME_DELAY = 500;

const ANIMATION_NONE = false;

export default class SimonGameLogic {
  static ANIMATION_SUCCESS = "success";

  // These are automatically added to the sculpture store
  static trackedProperties = {
    level: 0,
    levelPosition: 0
  };

  constructor(store) {
    this.store = store;
  }

  get data() {
    return this.store.data.get('simon');
  }

  get _lights() {
    return this.store.data.get('lights');
  }

  start() {
    this._playCurrentSequence();
  }

  handleActionPayload(payload) {
    const actionHandlers = {
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) {
      actionHandler(payload);
    }
  }

  _actionPanelPressed(payload) {
    let {stripId, panelId, pressed} = payload;
  }

  _playCurrentSequence() {
    const level = this.data.get('level');
    const currentSequence = PATTERN_LEVELS[level];

    this._playSequence(currentSequence);
  }

  _playSequence(sequence) {
    let frameIndex = -1;
    const playNextFrame = () => {
      frameIndex += 1;

      const frame = sequence[frame];
    };

    playNextFrame();
  }
}
