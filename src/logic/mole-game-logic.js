const assert = require('assert');
const PanelsActionCreator = require('../actions/panels-action-creator');
const SculptureActionCreator = require('../actions/sculpture-action-creator');
const MoleGameActionCreator = require('../actions/mole-game-action-creator');
const {TrackedPanels, PanelSet} = require('../utils/panel-group');
const TrackedSet = require('../utils/tracked-set');

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

    this._panels = {}; // Unique panel objects. These can be used in a Set

    // _remainingPanels are used to select random panels
    this._remainingPanels = new Set();
    for (let i=0;i<30;i++) {
      const stripId = Math.floor(i/10).toString();
      const panelId = (i%10).toString();
      const panel = { stripId, panelId, id: this._hash(stripId, panelId) };
      this._panels[panel.id] = panel;
      this._remainingPanels.add(panel);
    }
    this._activeTimeouts = {};

    this.moleGameActionCreator = new MoleGameActionCreator(this.store.dispatcher);
  }

  get data() {
    return this.store.data.get('mole');
  }

  start() {
    this.data.set("panelCount", 0);
    // FIXME: Reset panels to empty object
    const {panel, lifetime} = this._nextActivePanel(0);
    this._activatePanel(panel);
  }

  /**
   * handleActionPayload must _synchronously_ change tracked data in sculpture store.
   * Any asynchronous behavior must happen by dispatching actions.
   * We're _not_ allowed to dispatch actions synchronously.
   */
  handleActionPayload(payload) {
    if (this._complete) {
      return;
    }

    const actionHandlers = {
      [PanelsActionCreator.PANEL_PRESSED]: this._actionPanelPressed.bind(this),
      [MoleGameActionCreator.ACTIVATE_PANEL]: this._actionActivatePanel.bind(this),
      [MoleGameActionCreator.DEACTIVATE_PANEL]: this._actionDeactivatePanel.bind(this),
      [SculptureActionCreator.FINISH_STATUS_ANIMATION]: this._actionFinishStatusAnimation.bind(this)
    };

    const actionHandler = actionHandlers[payload.actionType];
    if (actionHandler) {
      actionHandler(payload);
    }
  }

  _actionFinishStatusAnimation(payload) {
    this._complete = true;
    this.store.moveToNextGame();
  }

  _actionActivatePanel(panel) {
    assert(this._remainingPanels.has(this._getPanel(panel)));
    this._activatePanel(this._getPanel(panel));
  }

  _actionDeactivatePanel(panel) {
    assert(!this._remainingPanels.has(this._getPanel(panel)));
    this._deactivatePanel(this._getPanel(panel));
  }

  /**
   * If an active panel is pressed:
   * o Turn panel to location color
   * o Wait a short moment
   * o Turn on the next panel
   * o increase/decrease # of simulaneously active panels
   */
  _actionPanelPressed(payload) {
    let {stripId, panelId, pressed} = payload;
    const panel = this._getPanel(payload);

    // If we have a timeout on this panel, kill the timeout
    if (this._activeTimeouts.hasOwnProperty(panel.id)) {
      clearTimeout(this._activeTimeouts[panel.id]);
      delete this._activeTimeouts[panel.id];
    }

    // If an active panel was touched
    if (this.data.get('panels').getPanelState(stripId, panelId) === TrackedPanels.STATE_ON) {
      this._colorPanel(panel);

      // Next panel
      let panelCount = this.data.get("panelCount") + 1;
      if (panelCount == 30) {
        this._winGame();
      }
      else {
        this.data.set("panelCount", panelCount);
        const addPanels = 1 + (this.gameConfig.NUM_ACTIVE_PANELS[panelCount] ? this.gameConfig.NUM_ACTIVE_PANELS[panelCount] : 0);

        for (let i=0;i<addPanels;i++) {
          this._registerTimeout(1000); // Turn on panel after 1 second. FIXME: Make time configurable
        }
      }
    }
  }

  _hash(stripId, panelId) {
    return `${stripId},${panelId}`;
  }

  _getPanel({stripId, panelId}) {
    return this._panels[this._hash(stripId, panelId)];
  }

  // Returns {panel, lifetime}
  _nextActivePanel(count) {
    if (count < this.gameConfig.INITIAL_PANELS.length) {
      const [stripId, panelId] = this.gameConfig.INITIAL_PANELS[count];
      return { panel: this._getPanel({stripId, panelId}), lifetime: 0 }; // No timeout
    }
    return { panel: this._getRandomPanel(count), lifetime: this._getRandomLifetime(count)};
  }

  _getRandomPanel(count) {
    const idx = Math.floor(Math.random() * this._remainingPanels.size);
    const iter = this._remainingPanels.values();
    let curr = iter.next();
    for (let i=0;i<idx;i++) curr = iter.next();
    return curr.value;
  }

  _getRandomLifetime(count) {
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
      min = last.range[0] + (next.range[0] - last.range[0]) * (count - last.range[0]) / (next.count - last.count);
      max = last.range[1] + (next.range[1] - last.range[1]) * (count - last.range[1]) / (next.count - last.count);
    }
    return 1000 * (Math.random() * (max - min) + min);
  }

  /**
   * If called with a panel, we'll move the panel (deactivate+pause+activate).
   * If called without a panel we'll immediately activate a new panel
   */
  _panelTimeout(oldPanel) {
    if (oldPanel) {
      delete this._activeTimeouts[oldPanel.id];
      this.moleGameActionCreator.sendDeactivatePanel(oldPanel);
      this._registerTimeout(200); // Turn on a new panel after 200ms. FIXME: Make time configurable
    }
    else {
      const {panel, lifetime} = this._nextActivePanel(this.data.get("panelCount"));
      this.moleGameActionCreator.sendActivatePanel(panel);
      this._registerTimeout(lifetime, panel);
    }
  }

  /**
   * Call without panel to request a new panel after the given timeout
   * Call with panel to turn off the panel after the given timeout
   */
  _registerTimeout(timeout, panel = null) {
    if (timeout > 0) {
      const tid = setTimeout(this._panelTimeout.bind(this, panel), timeout);
      if (panel) this._activeTimeouts[panel.id] = tid;
    }
  }

  // FIXME: The panel should also pulse. Should the pulsating state be part of tracked data, or should each view deduce this from the current game and state?
  _activatePanel(panel) {
    this.data.get('panels').setPanelState(panel.stripId, panel.panelId, TrackedPanels.STATE_ON);
    this._remainingPanels.delete(panel);
    const lightArray = this.store.data.get('lights');
    lightArray.setIntensity(panel.stripId, panel.panelId, this.gameConfig.ACTIVE_PANEL_INTENSITY);
  }

  _deactivatePanel(panel) {
    this._remainingPanels.add(panel);
    this.data.get('panels').setPanelState(panel.stripId, panel.panelId, TrackedPanels.STATE_OFF);
    const lightArray = this.store.data.get('lights');
    lightArray.setIntensity(panel.stripId, panel.panelId, this.gameConfig.INACTIVE_PANEL_INTENSITY);
  }
  
  _colorPanel(panel) {
    this.data.get('panels').setPanelState(panel.stripId, panel.panelId, TrackedPanels.STATE_IGNORED);
    const lightArray = this.store.data.get('lights');
    lightArray.setIntensity(panel.stripId, panel.panelId, this.gameConfig.COLORED_PANEL_INTENSITY);
    lightArray.setColor(panel.stripId, panel.panelId, this.config.USER_COLORS[this.config.username]);
  }
  
  _winGame() {
    this.store.data.get('lights').deactivateAll();
    this.store.setSuccessStatus();
  }
}
