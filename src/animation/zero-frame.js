const DEFAULT_TIME_OFFSET = 1000; // ms

export default class ZeroFrame {
  /**
   * Creates a frame which sets ALL strip intensities to zero before running
   * @param {LightArray} lightArray - The store's light array
   * @param {Function} runMethod - The method to run once all itensenties are set to zero
   * @param {Number} timeOffset - The time to wait before playing this frame
   * @constructor
   */
  constructor(lightArray, runMethod, timeOffset=DEFAULT_TIME_OFFSET) {
    this.lightArray = lightArray;
    this.runMethod = runMethod;
    this.timeOffset = timeOffset;
  }

  /**
   * Runs the frame
   */
  run() {
    for (let stripId of this.lightArray.stripIds) {
      this.lightArray.setIntensity(stripId, null, 0);
    }

    this.runMethod();   
  }
}
