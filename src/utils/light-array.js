const TrackedData = require('./tracked-data');

const DEFAULT_INTENSITY = 0.0;

const COLOR_DEFAULT = "default";

export default class LightArray extends TrackedData {
  constructor(rowLengths, defaultIntensity=DEFAULT_INTENSITY, defaultColor=COLOR_DEFAULT) {
    const properties = {};
    for (let row = 0; row < rowLengths.length; row++) {
      const rowValues = [];
      for (let i = 0; i < rowLengths[row]; i++) {
        rowValues.push({
          intensity: defaultIntensity,
          color: defaultColor
        });
      }
      properties[row] = {
        maxIntensity: 1.0,
        values: rowValues
      };
    }
    super(properties);

    this.rowCount = rowLengths.length;
  }

  setMaxIntensity(intensity, row=null) {
    let rows_to_modify;
    if (row === null) {
      rows_to_modify = [];
      for (let i = 0; i < this.rowCount; i++) {
        rows_to_modify.push(i);
      }
    }
    else {
      rows_to_modify = [row];
    }

    
  }

  getMaxIntensity(row) {
    
  }

  setColor(row, col, color) {
    
  }

  getColor(row, col) {
    
  }

  isActive(row, col) {

  }

  getIntensity(row, col) {

  }

  activate(row, col, intensity=1.0) {

  }

  deactivate(row, col) {

  }

  activateAll(row=null, intensity=1.0) {

  }

  deactivateAll(row=null) {

  }
}
