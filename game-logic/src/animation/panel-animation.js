const SculptureActionCreator = require('../actions/sculpture-action-creator');

export default class PanelAnimation {
  static STOPPED = "stopped";
  static RUNNING = "running";

  constructor(frames, completeCallback) {
    this.frames = frames;
    this.completeCallback = completeCallback;
    this.sculptureActionCreator = null;

    this.currentFrame = -1;
    this.state = PanelAnimation.STOPPED;
  }

  /**
   * @returns {Boolean} If the animation is currently running
   */
  get isRunning() {
    return this.state === PanelAnimation.RUNNING;
  }

  /**
   * @returns {Boolean} If the animation is currently stopped
   */
  get isStopped() {
    return this.state === PanelAnimation.STOPPED;
  }

  /**
   * Stops the animation wherever it is
   */
  stop() {
    this.state = PanelAnimation.STOPPED;
  }

  /**
   * Any setup work before the animation begins
   */
  before() {
  }

  /**
   * Goes through each frame and asynchronously plays each frame
   * The default behaviour is usually sufficient for most cases
   * @param {Dispatcher} dispatcher - The dispatcher instance
   */
  play(dispatcher) {
    this.before();
    this.state = PanelAnimation.RUNNING;
    this.sculptureActionCreator = new SculptureActionCreator(dispatcher);

    this.playNextFrame();
  }

  /**
   * Any teardown work to be done after the animation finishes
   * By default this sets state to stopped and calls the complete callback
   */
  after() {
    this.stop();
    this.completeCallback();
  }

  /**
   * Called by play to run the next frame
   * Usually it isn't necessary to override this
   */
  playNextFrame() {
    this.currentFrame = this.currentFrame + 1;

    if (this.currentFrame >= this.frames.length || this.isStopped) {
      this.executeAsAction(() => this.after());
    }
    else {
      const frame = this.frames[this.currentFrame];
      setTimeout(() => {
        this.executeAsAction(() => frame.run());

        this.playNextFrame();
      }, frame.timeOffset);
    }
  }

  executeAsAction(callback) {
    this.sculptureActionCreator.sendAnimationFrame(callback);
  }
}

