export default class BaseActionCreator {
  /**
   * Creates an action creator that sends all of its messages
   * to the provided dispatcher
   */
  constructor(dispatcher) {
    this._dispatcher = dispatcher;
  }

  _dispatch(actionType, data={}) {
    this._dispatcher.dispatch(Object.assign({
      actionType: actionType
    }, data));
  }
}
