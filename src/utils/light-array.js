const TrackedData = require('./tracked-data');

const DEFAULT_INTENSITY = 0.0;

const COLOR_DEFAULT = "default";

export default class LightArray extends TrackedData {
  constructor(stripLengths, defaultIntensity=DEFAULT_INTENSITY, defaultColor=COLOR_DEFAULT) {
    const properties = {};
    for (let stripId of Object.keys(stripLengths)) {
      const strip = {};
      for (let panelId = 0; panelId < stripLengths[stripId]; panelId++) {
        strip[panelId] = new TrackedData({
          intensity: defaultIntensity,
          color: defaultColor,
          active: false
        });
      }
      properties[stripId] = new TrackedData({
        maxIntensity: 1.0,
        panels: new TrackedData(strip)
      });
    }
    super(properties);

    this.stripIds = Object.keys(stripLengths);
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

  setColor(stripId, panelId, color) {
    const panel = this.getPanel(stripId, panelId);

    panel.set("color", color);
  }

  getColor(stripId, panelId) {
    const panel = this.getPanel(stripId, panelId);

    return panel.get("color");
  }

  getIntensity(stripId, panelId) {
    const panel = this.getPanel(stripId, panelId);

    return panel.get("intensity");
  }

  setIntensity(stripId, panelId, intensity) {
    const panel = this.getPanel(stripId, panelId);

    panel.set("intensity", intensity);
  }

  isActive(stripId, panelId) {
    const panel = this.getPanel(stripId, panelId);

    return panel.get("active");
  }

  activate(stripId, panelId) {
    const panel = this.getPanel(stripId, panelId);

    panel.set("active", true);
  }

  deactivate(stripId, panelId) {
    const panel = this.getPanel(stripId, panelId);

    panel.set("active", false);
  }
}
