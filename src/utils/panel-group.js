export default class PanelGroup {
  constructor(iterable) {
    this._panels = new Set();

    this.addAll(iterable || []);
  }

  get size() {
    return this._panels.size;
  }

  addAll(iterable) {
    for (let [stripId, panelId] of iterable) {
      this.add(stripId, panelId);
    }
  }

  add(stripId, panelId) {
    this._panels.add(this._hash(stripId, panelId));
  }

  has(stripId, panelId) {
    return this._panels.has(this._hash(stripId, panelId));
  }

  delete(stripId, panelId) {
    this._panels.delete(this._hash(stripId, panelId));
  }

  clear() {
    return this._panels.clear();
  }

  *entries() {
    for (let value of this.values()) {
      yield [value, value];
    }
  }

  *values() {
    for (let hashedValue of this._panels.values()) {
      yield this._parseHash(hashedValue);
    }
  }

  keys() {
    return this.values();
  }

  forEach(callback, thisArg) {
    for (let value of this.values()) {
      callback.call(thisArg, value);
    }
  }

  _hash(stripId, panelId) {
    return `${stripId},${panelId}`;
  }

  _parseHash(hash) {
    return hash.split(',', 2);
  }

  [Symbol.iterator]() {
    return this.values();
  }
}

