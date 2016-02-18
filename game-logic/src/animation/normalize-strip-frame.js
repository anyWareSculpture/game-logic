const DEFAULT_TIME_OFFSET = 1000; // ms

export default class NormalizeStripFrame {
  /**
   * Creates a frame that normalizes the entire strip to a single color and intensity
   * @param {LightArray} lightArray - The store's light array
   * @param {String} stripId - The stripId to normalize
   * @param {String} color - The color to set the entire strip to
   * @param {String} intensity - The intensity to set the entire strip to
   * @param {Function} runMethod - The method to run once the strip has been normalized
   * @param {Number} timeOffset - The time to wait before playing this frame
   * @constructor
   */
  constructor(lightArray, stripId, color, intensity, runMethod, timeOffset=DEFAULT_TIME_OFFSET) {
    this.lightArray = lightArray;
    this.stripId = stripId;
    this.color = color;
    this.intensity = intensity;
    this.runMethod = runMethod;
    this.timeOffset = timeOffset;
  }

  /**
   * Runs the frame
   */
  run() {
    this.lightArray.setColor(this.stripId, null, this.color);
    this.lightArray.setIntensity(this.stripId, null, this.intensity);

    this.runMethod();
  }
}
