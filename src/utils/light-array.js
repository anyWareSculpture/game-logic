const COLORS = require('../constants/colors');
const TrackedData = require('./tracked-data');

const DEFAULT_INTENSITY = 0;
const DEFAULT_COLOR = COLORS.WHITE;

export default class LightArray extends TrackedData {
  constructor(stripLengths, defaultIntensity=DEFAULT_INTENSITY, defaultColor=DEFAULT_COLOR) {
    const properties = {};
    for (let stripId of Object.keys(stripLengths)) {
      const strip = {};
      const panelIds = [];
      for (let panelId = 0; panelId < stripLengths[stripId]; panelId++) {
        panelId = '' + panelId;

        strip[panelId] = new TrackedData({
          intensity: defaultIntensity,
          color: defaultColor,
          active: false
        });

        panelIds.push(panelId);
      }
      properties[stripId] = new TrackedData({
        maxIntensity: 100,
        panels: new TrackedData(strip)
      });
      properties[stripId].panelIds = panelIds;
    }
    super(properties);

    this.stripIds = Object.keys(stripLengths);

    this.defaultIntensity = defaultIntensity;
    this.defaultColor = defaultColor;
  }

  setMaxIntensity(intensity, stripId=null) {
    const stripsToModify = stripId === null ? this.stripIds : [stripId];

    for (let targetStripId of stripsToModify) {
      const strip = this.get(targetStripId);
      strip.set("maxIntensity", intensity);
    }
  }

  getMaxIntensity(stripId) {
    return this.get(stripId).get("maxIntensity");
  }

  getPanel(stripId, panelId) {
    return this.get(stripId).get("panels").get(panelId);
  }

  setDefaultColor(stripId, panelId) {
    return this.setColor(stripId, panelId, this.defaultColor);
  }

  setColor(stripId, panelId, color) {
    this._applyToOnePanelOrAll((panel) => panel.set("color", color), stripId, panelId);
  }

  getColor(stripId, panelId) {
    const panel = this.getPanel(stripId, panelId);

    return panel.get("color");
  }

  getIntensity(stripId, panelId) {
    const panel = this.getPanel(stripId, panelId);

    return panel.get("intensity");
  }

  setDefaultIntensity(stripId, panelId) {
    return this.setIntensity(stripId, panelId, this.defaultIntensity);
  }

  setIntensity(stripId, panelId, intensity) {
    this._applyToOnePanelOrAll((panel) => panel.set("intensity", intensity), stripId, panelId);
  }

  isActive(stripId, panelId) {
    const panel = this.getPanel(stripId, panelId);

    return panel.get("active");
  }

  activate(stripId, panelId, active=true) {
    const panel = this.getPanel(stripId, panelId);

    panel.set("active", active);
  }

  deactivate(stripId, panelId) {
    this.activate(stripId, panelId, false);
  }

  deactivateAll(stripId=null) {
    const targetStripIds = stripId === null ? this.stripIds : [stripId];

    for (let targetStripId of targetStripIds) {
      for (let panelId of this.get(targetStripId).panelIds) {
        this.deactivate(targetStripId, panelId);
      }
    }
  }

  _applyToOnePanelOrAll(panelFunc, stripId, panelId=null) {
    const panels = this._getOnePanelOrAll(stripId, panelId);

    for (let panel of panels) {
      panelFunc(panel);
    }
  }

  _getOnePanelOrAll(stripId, panelId) {
    if (panelId === null) {
      // this code is necessary because there is no Object.values() function
      const stripPanels = this.get(stripId).get("panels");
      return [for (stripPanelId of stripPanels) stripPanels.get(stripPanelId)];
    }
    else {
      return [this.getPanel(stripId, panelId)];
    }
  }
}
