import fs from "fs";
import Chances from "./chances.js";
import sizeof from "../../../functions/sizeof.js";

export default class Collection {
  constructor(path) {
    this.collection = {};
    this.size = 0;
    this.isSorted = false;
    this.pointer = undefined;

    if (path !== undefined) this.load(path);
  }
  clear() {
    this.collection = {};
    this.size = 0;
    this.isSorted = false;
    this.pointer = undefined;
  }
  add(word, char, count = 1) {
    this.create(word);
    this.size += this.collection[word].add(char, count);
  }
  create(word, chancesObject) {
    if (!this.has(word)) {
      this.collection[word] = new Chances(chancesObject);
      this.size += sizeof(word) + this.chances(word).size;
      if (this.isSorted) this.isSorted = false;
      return true;
    }
    return false;
  }
  delete(word) {
    if (this.has(word)) {
      this.size -= sizeof(word) + this.chances(word).size;
      delete this.collection[word];
    }
  }
  has(word) {
    return this.collection[word];
  }
  chances(word) {
    return this.collection[word];
  }
  isEmpty() {
    return this.size === 0;
  }
  sort() {
    if (!this.isSorted) {
      const keys = Object.keys(this.collection);
      const sortedKeys = keys.sort((a, b) => a.localeCompare(b));
      this.pointer = sortedKeys[0];
      this.collection = sortedKeys.reduce((result, key) => {
        result[key] = this.collection[key];
        return result;
      }, {});
    }
  }
  getPointer() {
    if (!this.isSorted) this.sort();
    if (this.has(this.pointer)) return this.pointer;
    return Object.keys(this.collection)[0];
  }
  newFormat() {
    const format = {};
    for (let word in this.collection)
      format[word] = this.chances(word).newFormat();
    return format;
  }
  toSave() {
    const save = {};
    for (let word in this.collection) save[word] = this.chances(word).toSave();
    return save;
  }
  save(path) {
    fs.writeFileSync(path, JSON.stringify(this.toSave()));
  }
  load(path) {
    const data = JSON.parse(fs.readFileSync(path));
    this.clear();
    this.fromObject(data);
  }
  updateSize() {
    this.size = 0;
    for (let word in this.collection) {
      this.size += sizeof(word) + this.chances(word).size;
    }
  }
  getSize() {
    let size = 0;
    for (let word in this.collection)
      size += sizeof(word) + this.chances(word).size;
    return size;
  }
  fromObject(object) {
    for (let word in object) this.create(word, object[word]);
  }
  static move(to, from, word) {
    if (!to.create(word)) to.size -= to.chances(word).size;
    if (from.has(word)) {
      from.size -= from.chances(word).size;
      Chances.merge(to.chances(word), from.chances(word));
      from.delete(word);
    }
    to.size += to.chances(word).size;
  }
  static merge(to, from, size = -1) {
    if (to instanceof this && from instanceof this) {
      if (size === -1) {
        for (let word in from.collection) this.move(to, from, word);
        return;
      }

      this.compact(to, from);

      if (to.size < size && from.isEmpty()) return;
      const words = [
        ...Object.keys(to.collection),
        ...Object.keys(from.collection),
      ].sort((a, b) => a.localeCompare(b));
      let start = 0;
      let end = words.length;
      let previousSize = to.size;
      for (; start < end && to.size - previousSize < size; start++)
        this.move(to, from, words[start]);
      for (; start < end; start++) this.move(from, to, words[start]);
    }
  }
  static compact(to, from) {
    if (to.isEmpty() || from.isEmpty()) return;
    for (let word in from.collection)
      if (to.has(word)) this.move(to, from, word);
  }
  static separate(collection, size, needToSort = false) {
    const newcol = new this();
    if (needToSort) {
      collection.sort();
      newcol.pointer = collection.pointer;
    }
    for (let word in collection.collection)
      if (newcol.size >= size) break;
      else this.move(newcol, collection, word);
    if (needToSort) newcol.isSorted = true;
    return newcol;
  }
}
