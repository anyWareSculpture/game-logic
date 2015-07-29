const BaseActionCreator = require('./base-action-creator');

export default class DisksActionCreator extends BaseActionCreator {
  // Action types
  static DISK_UPDATE = "disk-update";

  /**
   * Sends an action to the dispatcher representing when a disk position, direction, or state changes.
   * Only sends action if at least one argument is provided to the object
   * @param {String} diskId - The ID of the disk that was updated
   */
  sendDiskUpdate(diskId, {position=null, direction=null, state=null}) {
    const payloadBody = {};
    if (position !== null) {
      payloadBody.position = position;
    }

    if (direction !== null) {
      payloadBody.direction = direction;
    }

    if (state !== null) {
      payloadBody.state = state;
    }

    if (Object.keys(payloadBody).length > 0) {
      payloadBody.diskId = diskId;

      this._dispatch(DisksActionCreator.DISK_UPDATE, payloadBody);
    }
  }
}
