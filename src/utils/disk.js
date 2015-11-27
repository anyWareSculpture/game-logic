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
      // The "pull" to move in either direction
      clockwisePull: 0,
      counterclockwisePull: 0,
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
    if (direction === Disk.STOPPED) {
      this.set("clockwisePull", 0);
      this.set("counterclockwisePull", 0);
    }
    else if (direction === Disk.CLOCKWISE) {
      this.set("clockwisePull", this.clockwisePull + 1);
    }
    else if (direction === Disk.COUNTERCLOCKWISE) {
      this.set("counterclockwisePull", this.counterclockwisePull + 1);
    }
    else {
      throw new Error(`Could not resolve how to set direction ${direction}`);
    }
    this.resolveDirection();
  }

  /**
   * Un-applies a direction (instead of directly setting it)
   * Resolves conflicts when they are present
   * @param {String} direction - Static direction constant from Disk
   *    In general, this function should only be used with the
   *    CLOCKWISE and COUNTERCLOCKWISE directions
   */
  unsetDirection(direction) {
    if (direction === Disk.CLOCKWISE) {
      this.set("clockwisePull", this.clockwisePull - 1);
    }
    else if (direction === Disk.COUNTERCLOCKWISE) {
      this.set("counterclockwisePull", this.counterclockwisePull - 1);
    }
    else {
      throw new Error(`Could not reason about how to unset direction '${direction}' from current direction '${currentDirection}'`);
    }
    this.resolveDirection();
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

  resolveDirection() {
    const clockwisePull = this.clockwisePull;
    const counterclockwisePull = this.counterclockwisePull;

    let direction;
    if (clockwisePull === 0 && counterclockwisePull === 0) {
      direction = Disk.STOPPED;
    }
    else if (clockwisePull === counterclockwisePull) {
      direction = Disk.CONFLICT;
    }
    else if (clockwisePull > counterclockwisePull) {
      direction = Disk.CLOCKWISE;
    }
    else if (clockwisePull < counterclockwisePull) {
      direction = Disk.COUNTERCLOCKWISE;
    }
    else {
      throw new Error("Should never reach this case...");
    }
    this.set('direction', direction);
  }

  get isStopped() {
    return this.getDirection() === Disk.STOPPED;
  }

  get isConflicting() {
    return this.getDirection() === Disk.CONFLICT;
  }

  get isTurningClockwise() {
    return this.getDirection() === Disk.CLOCKWISE;
  }

  get isTurningCounterclockwise() {
    return this.getDirection() === Disk.COUNTERCLOCKWISE;
  }

  get counterclockwisePull() {
    return this.get('counterclockwisePull');
  }

  get clockwisePull() {
    return this.get('clockwisePull');
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
