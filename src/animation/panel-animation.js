export default class Animation {
  static STOPPED = "stopped";
  static RUNNING = "running";

  constructor(frames, completeCallback) {
    this.frames = frames;
    this.completeCallback = completeCallback;

    this.currentFrame = -1;
    this.state = Animation.STOPPED;
  }

  /**
   * @returns {Boolean} If the animation is currently running
   */
  get running() {
    return this.state === Animation.RUNNING;
  }

  /**
   * @returns {Boolean} If the animation is currently stopped
   */
  get stopped() {
    return this.state === Animation.STOPPED;
  }

  /**
   * Stops the animation wherever it is
   */
  stop() {
    this.state = Animation.STOPPED;
  }

  /**
   * Any setup work before the animation begins
   */
  before() {
  }

  /**
   * Goes through each frame and asynchronously plays each frame
   * The default behaviour is usually sufficient for most cases
   */
  play() {
    this.before();
    this.state = Animation.RUNNING;
    
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
    this.currentFrame++;
    
    if (this.currentFrame > frames.length) {
      
    }
  }
}
