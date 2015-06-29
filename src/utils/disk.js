const TrackedData = require('./tracked-data');

export default class Disk extends TrackedData {
  static STOPPED = "stopped";
  static CLOCKWISE = "clockwise";
  static COUNTERCLOCKWISE = "counterclockwise";

  static STATE_HOMING = "homing";
  static STATE_READY = "ready";

  constructor(position=0, direction=Disk.STOPPED) {
    super({
      position: position,
      direction: direction,
      user: "",
      state: Disk.STATE_READY
    });
  }

  rotateTo(position) {
    this.set('position', position);
  }

  getPosition() {
    return this.get('position');
  }

  setDirection(direction) {
    this.set('direction', direction);
  }

  turnClockwise() {
    this.setDirection(Disk.CLOCKWISE);
  }

  turnCounterclockwise() {
    this.setDirection(Disk.COUNTERCLOCKWISE);
  }

  stop() {
    this.setDirection(Disk.STOPPED);
  }

  getDirection() {
    return this.get('direction');
  }

  setUser(user) {
    this.set('user', user);
  }

  getUser() {
    return this.get('user');
  }

  setState(state) {
    this.set('state', state);
  }

  getState() {
    return this.get('state');
  }
}
