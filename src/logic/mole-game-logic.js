const PanelsActionCreator = require('../actions/panels-action-creator');
const SculptureActionCreator = require('../actions/sculpture-action-creator');
const MoleGameActionCreator = require('../actions/mole-game-action-creator');
const {TrackedPanels} = require('../utils/tracked-panels');

export default class MoleGameLogic {
  // These are automatically added to the sculpture store
  static trackedProperties = {
    panelCount: 0, // Game progress (0..30)
    panels: new TrackedPanels()  // panel -> state
  };

  constructor(store, config) {
    this.store = store;
    this.config = config;
    this.gameConfig = config.MOLE_GAME;

    this._complete = false;

    // _remainingPanels are used to select random panels
    this._panels = {}; // Unique panel objects. These can be used in the _remainingPanels Set
    this._remainingPanels = new Set();
    this.config.LIGHTS.GAME_STRIPS.forEach(stripId => {
      this._lights.get(stripId).panelIds.forEach(panelId => {
        const panel = { stripId, panelId, key: this._hash(stripId, panelId) };
        this._panels[panel.key] = panel;
        this._remainingPanels.add(panel);
      });
    });

    this._activeTimeouts = {};

    this.moleGameActionCreator = new MoleGameActionCreator(this.store.dispatcher);
  }

  get data() {
    return this.store.data.get('mole');
  }

  start() {
    this._complete = false;
    this.data.set('panelCount', 0);
    this.data.set('panels', new TrackedPanels());
    this._registerTimeout(0); // Request a new active panel immediately
  }

  end() {
    this.config.LIGHTS.GAME_STRIPS.forEach(stripId => this._lights.deactivateAll(stripId));
  }

  /**
   * handleActionPayload must _synchronously_ change tracked data in sculpture store.
   * Any asynchronous behavior must happen by dispatching actions.
   * We're _not_ allowed to dispatch actions synchronously.
   */
  handleActionPayload(payload) {
    if (this._complete) return;

    const actionHandlers = {
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
      [MoleGameActionCreator.AVAIL_PANEL]: this._actionAvailPanel.bind(this),
      [MoleGameActionCreator.DEAVAIL_PANEL]: this._actionDeavailPanel.bind(this),
      [SculptureActionCreator.FINISH_STATUS_ANIMATION]: this._actionFinishStatusAnimation.bind(this)
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) actionHandler(payload);
  }

  /**
   * We only have a status animation at the end of the game
   */
  _actionFinishStatusAnimation(payload) {
    this._complete = true;
    // There is currently no transition out, so we can synchronously start the next game
    this.store.moveToNextGame();
  }

  /**
   * Asynchronous panel activation
   */
  _actionAvailPanel(panel) {
    this._availPanel(panel);
  }

  /**
   * Asynchronous panel deactivation
   */
  _actionDeavailPanel(panel) {
    this._deavailPanel(panel);
  }

  /**
   * If an active panel is pressed:
   * 1) Turn panel to location color
   * 2) Wait a short moment
   * 3) Avail the next panel
   * 4) increase/decrease # of simulaneously active panels
   */
  _actionPanelPressed(payload) {
    let {stripId, panelId, pressed} = payload;

    const state = this.data.get('panels').getPanelState(stripId, panelId);
    if (!state || state === TrackedPanels.STATE_OFF) {
      if (pressed) {
        this._lights.setColor(stripId, panelId, this.userColor);
        this._lights.setIntensity(stripId, panelId, this.config.PANEL_DEFAULTS.ACTIVE_INTENSITY);
      }
      else {
        this._lights.setDefaultColor(stripId, panelId);
        this._lights.setIntensity(stripId, panelId, this.config.PANEL_DEFAULTS.INACTIVE_INTENSITY);
      }
      return;
    }

    // If we have a timeout on this panel, kill the timeout
    const key = this._getPanelKey(payload);
    if (this._activeTimeouts.hasOwnProperty(key)) {
      clearTimeout(this._activeTimeouts[key]);
      delete this._activeTimeouts[key];
    }

    // If an active panel was touched
    if (state === TrackedPanels.STATE_ON) {
      this._colorPanel({stripId, panelId});

      // Advance game
      let panelCount = this.data.get("panelCount") + 1;
      if (panelCount === this.gameConfig.GAME_END) {
        this._winGame();
      }
      else {
        this.data.set('panelCount', panelCount);
        // Determine whether to add, remove of keep # of simultaneous panels
        const addPanels = 1 + (this.gameConfig.NUM_ACTIVE_PANELS[panelCount] ? this.gameConfig.NUM_ACTIVE_PANELS[panelCount] : 0);

        for (let i=0; i<addPanels; i++) {
          this._registerTimeout(this.gameConfig.PANEL_SUCCESS_DELAY); // Wait before next panel
        }
      }
    }
  }

  _hash(stripId, panelId) {
    return `${stripId},${panelId}`;
  }

  _getPanelKey({stripId, panelId}) {
    return this._hash(stripId, panelId);
  }

  _getPanel({stripId, panelId}) {
    return this._panels[this._hash(stripId, panelId)];
  }

  /**
   * Request the next active panel, as the game progresses
   * Returns {panel, lifetime}
   */
  _nextActivePanel(count) {
    if (count < this.gameConfig.INITIAL_PANELS.length) {
      const panel = this.gameConfig.INITIAL_PANELS[count];
      return { panel, lifetime: this._getPanelLifetime(count) }; // No timeout
    }
    return { panel: this._getRandomPanel(count), lifetime: this._getPanelLifetime(count)};
  }

  _getRandomPanel(count) {
    const idx = Math.floor(Math.random() * this._remainingPanels.size);
    const iter = this._remainingPanels.values();
    let curr = iter.next();
    for (let i=0; i<idx; i++) curr = iter.next();
    return curr.value;
  }

  _getPanelLifetime(count) {
    // find last and next lifetime values for interpolation
    let last, next;
    for (let elem of this.gameConfig.PANEL_LIFETIME) {
      if (!last || elem.count <= count) last = elem;
      next = elem;
      if (elem.count > count) break;
    }

    let min, max;
    if (last === next) {
      min = last.range[0];
      max = last.range[1];
    }
    else {
      min = last.range[0] + (next.range[0] - last.range[0]) * (count - last.count) / (next.count - last.count);
      max = last.range[1] + (next.range[1] - last.range[1]) * (count - last.count) / (next.count - last.count);
    }
    return 1000 * (Math.random() * (max - min) + min);
  }

  /**
   * If called with a panel, we'll move the panel (deavail+pause+avail).
   * If called without a panel we'll immediately avail a new panel
   */
  _panelTimeout(oldPanel) {
    if (oldPanel) {
      const key = this._getPanelKey(oldPanel);
      delete this._activeTimeouts[key];
      this.moleGameActionCreator.sendDeavailPanel(oldPanel);
      this._registerTimeout(this.gameConfig.PANEL_MOVE_DELAY);
    }
    else {
      const {panel, lifetime} = this._nextActivePanel(this.data.get("panelCount"));
      this.moleGameActionCreator.sendAvailPanel(panel);
      this._registerTimeout(lifetime, panel);
    }
  }

  /**
   * Call without panel to request a new panel after the given timeout
   * Call with panel to turn off the panel after the given timeout
   */
  _registerTimeout(timeout, panel = null) {
    const tid = setTimeout(this._panelTimeout.bind(this, panel), timeout);
    if (panel) this._activeTimeouts[this._getPanelKey(panel)] = tid;
  }

  // FIXME: The panel should also pulse. Should the pulsating state be part of tracked data, or should each view deduce this from the current game and state?
  _availPanel(panel) {
    this._setPanelState(panel, TrackedPanels.STATE_ON);
    this._remainingPanels.delete(this._getPanel(panel));
    this._lights.setIntensity(panel.stripId, panel.panelId, this.gameConfig.ACTIVE_PANEL_INTENSITY);
  }

  _deavailPanel(panel) {
    this._remainingPanels.add(this._getPanel(panel));
    this._setPanelState(panel, TrackedPanels.STATE_OFF);
    this._lights.setIntensity(panel.stripId, panel.panelId, this.gameConfig.INACTIVE_PANEL_INTENSITY);
  }

  _colorPanel(panel) {
    this._setPanelState(panel, TrackedPanels.STATE_IGNORED);
    this._lights.setIntensity(panel.stripId, panel.panelId, this.gameConfig.COLORED_PANEL_INTENSITY);
    this._lights.setColor(panel.stripId, panel.panelId, this.store.userColor);
  }

  _winGame() {
    this._lights.deactivateAll();
    this.store.setSuccessStatus();
  }

  get _lights() {
    return this.store.data.get('lights');
  }

  _setPanelState({stripId, panelId}, state) {
    this.data.get('panels').setPanelState(stripId, panelId, state);
  }

}
