export default class PanelGroup extends Set {
  constructor(iterable) {
    super();
    this.addAll(iterable || []);
  }

  addAll(iterable) {
    for (let [stripId, panelId] of iterable) {
      this.add(stripId, panelId);
    }
  }

  add(stripId, panelId) {
    Set.add.call(this, this._hash(stripId, panelId));
  }

  has(stripId, panelId) {
    this._panels.has(this._hash(stripId, panelId));
  }

  _hash(stripId, panelId) {
    return `${stripId},${panelId}`;
  }

  [Symbol.iterator]() {
    return this._panels[Symbol.iterator]();
  }
}
