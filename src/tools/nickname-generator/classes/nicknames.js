export default class Nicknames {
  constructor() {
    this.nicknames = new Set();
    this.length = 0;
  }
  add(name) {
    this.nicknames.add(name);
    this.length = this.nicknames.size;
    return this;
  }
  delete(name) {
    this.nicknames.delete(name);
    this.length = this.nicknames.size;
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
