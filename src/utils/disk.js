const TrackedData = require('./tracked-data');

export default class Disk extends TrackedData {
  static STOPPED = "stopped";
  static CLOCKWISE = "clockwise";
  static COUNTERCLOCKWISE = "counterclockwise";
  static CONFLICT = "conflict"

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

  /**
   * Applies the given direction to the disk, sometimes resulting in a conflict if direction opposes the current direction
   * @param {String} direction - Static direction constant from Disk
   */
  setDirection(direction) {
    const currentDirection = this.getDirection();
    if (Disk.conflictsWith(currentDirection, direction)) {
      this.setDirectionConflict();
    }
    else {
      this.set('direction', direction);
    }
  }

  /**
   * Un-applies a direction (instead of directly setting it)
   * Resolves conflicts when they are present
   * @param {String} direction - Static direction constant from Disk
   *    In general, this function should only be used with the
   *    CLOCKWISE and COUNTERCLOCKWISE directions
   */
  unsetDirection(direction) {
    const currentDirection = this.getDirection();
    if (currentDirection === direction) {
      this.stop();
    }
    else if (currentDirection === Disk.CONFLICT) {
      const opposite = Disk.oppositeDirection(direction);
      this.setDirection(opposite);
    }
    else {
      throw new Error(`Could not reason about how to unset direction '${direction}' from current direction '${currentDirection}'`);
    }
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

  setDirectionConflict() {
    this.setDirection(Disk.CONFLICT);
  }

  get isStopped() {
    return this.getDirection() === Disk.STOPPED;
  }

  get isConflicting() {
    return this.getDirection() === Disk.CONFLICT;
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

  static conflictsWith(direction1, direction2) {
    return (direction1 === Disk.CLOCKWISE && direction2 === Disk.COUNTERCLOCKWISE) || (direction1 === Disk.COUNTERCLOCKWISE && direction2 === Disk.CLOCKWISE);
  }

  static oppositeDirection(direction) {
    if (direction === Disk.CLOCKWISE) {
      return Disk.COUNTERCLOCKWISE;
    }
    else if (direction === Disk.COUNTERCLOCKWISE) {
      return Disk.CLOCKWISE;
    }
    else {
      throw new Error(`Cannot resolve opposite for direction '${direction}'`);
    }
  }
}
