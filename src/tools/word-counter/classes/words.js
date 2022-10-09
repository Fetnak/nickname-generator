import fs from "fs";
import sizeof from "../../../functions/sizeof.js";

export default class Words {
  constructor(path) {
    this.words = {};
    this.length = 0;
    this.size = 0;

    if (path) this.load(path);
  }

  add(word, count = 1) {
    if (this.has(word)) this.words[word] += count;
    else {
      this.words[word] = count;
      this.length++;
      this.size += sizeof(word) + sizeof(count); // add size of int
    }
  }
  remove(word) {
    if (this.has(word)) {
      this.length--;
      this.size -= sizeof(word) + sizeof(1);
      delete this.words[word];
      return true;
    }
    return false;
  }
  reduce(word, count = 1) {
    if (this.has(word)) {
      this.words[word] -= count;
      return true;
    }
    return false;
  }
  has(word) {
    return this.words[word] !== undefined;
  }
  count(word) {
    return this.words[word];
  }
  save(path) {
    fs.writeFileSync(path, JSON.stringify(this.words));
    return true;
  }
  clear() {
    this.words = {};
    this.length = 0;
    this.size = 0;
  }
  toArray() {
    return Object.keys(this.words);
  }
  updateLength() {
    return (this.length = Object.keys(this.words).length);
  }
  updateSize() {
    return (this.size = sizeof(this.words));
  }
  load(path) {
    this.words = JSON.parse(fs.readFileSync(path));
    this.updateLength();
    this.updateSize();
    return this;
  }
  isEmpty() {
    return this.length === 0;
  }
  static compact(words1, words2) {
    if (words1 instanceof this && words2 instanceof this)
      for (const word in words2.words) {
        if (words1.has(word)) {
          words1.add(word, words2.count(word));
          words2.remove(word);
        }
      }
  }
  static merge(words1, words2, size = -1) {
    if (words1 instanceof this && words2 instanceof this) {
      for (const word in words2.words) {
        if (size !== -1 && words1.size >= size) break;
        words1.add(word, words2.count(word));
        words2.remove(word);
      }
      this.compact(words1, words2);
    }
  }
}
