export default class Nicknames {
  constructor() {
    this.nicknames = new Set();
    this.length = 0;
  }
  add(name) {
    if (this.nicknames.has(name)) return false;
    else {
      this.nicknames.add(name);
      this.length++;
      return true;
    }
  }
  delete(name) {
    if (this.nicknames.has(name)) {
      this.nicknames.delete(name);
      this.length--;
    }
    return this;
  }
  has(name) {
    return this.nicknames.has(name);
  }
  toArray() {
    return Array.from(this.nicknames);
  }
  *[Symbol.iterator]() {
    for (const nickname of this.nicknames) yield nickname;
  }
}
