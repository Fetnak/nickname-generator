import sizeof from "../../../functions/sizeof.js";

export default class Chances {
  constructor(object) {
    this.chances = {};
    this.size = 0;

    if (object !== undefined) this.fromObject(object);
  }
  clear() {
    this.chances = {};
    this.size = 0;
  }
  add(char, count = 1) {
    if (this.has(char)) {
      this.chances[char] += count;
      return 0;
    } else {
      this.chances[char] = count;
      const size = sizeof(char) + sizeof(count);
      this.size += size;
      return size;
    }
  }
  delete(char) {
    if (this.has(char)) {
      this.size -= sizeof(char) + sizeof(1);
      delete this.chances[char];
    }
  }
  reduce(char, count = 1) {
    if (this.has(char)) this.chances[char] -= count;
  }
  has(char) {
    return this.chances[char] !== undefined;
  }
  count(char) {
    return this.chances[char];
  }
  fromObject(object) {
    this.chances = object;
    this.size = sizeof(object);
  }
  newFormat() {
    const chances = [];
    const counts = Object.values(this.chances);
    let count = 0;
    for (let i = 0; i < counts.length; i++) {
      count += counts[i];
      chances.push(count);
    }
    return {
      l: Object.keys(this.chances),
      c: chances,
    };
  }
  toSave() {
    return this.chances;
  }
  static merge(chances1, chances2) {
    for (let char in chances2.chances) chances1.add(char, chances2.count(char));
    chances2.clear();
  }
}
