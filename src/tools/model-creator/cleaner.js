import fs from "fs";
import path from "path";
import Collection from "./classes/collection.js";
import { log } from "../../functions/log.js";

const clean = (
  output,
  sizeLimit,
  tempSizeLimit,
  fullSizeLimit,
  alphabet,
  dummy
) => {
  const lengths = getLengths(output);
  for (let length of lengths) {
    const lengthPath = path.join(output, length);
    const cols = new Collections(
      lengthPath,
      sizeLimit,
      tempSizeLimit,
      fullSizeLimit,
      alphabet,
      dummy
    );
    while (!cols.isEmpty()) {
      for (let i = 1, n = cols.names.length; i < n; i++) {
        cols.merge(0, i);
        cols.unloadCache();
      }
      cols.finish(0);
    }
    cols.pointers.finish(lengthPath);
    log(`"${length} sequence" processed.`);
  }
};

const getLengths = (output) => {
  return fs.readdirSync(output).filter((length) => length !== "info.json");
};

class Collections {
  constructor(
    lengthPath,
    sizeLimit,
    tempSizeLimit,
    fullSizeLimit,
    alphabet,
    dummy
  ) {
    this.collections = {};
    this.paths = {};
    this.lengthPath = lengthPath;
    this.sizeLimit = sizeLimit;
    this.tempSizeLimit = tempSizeLimit;
    this.fullSizeLimit = fullSizeLimit;
    this.names = fs
      .readdirSync(lengthPath)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((a) => parseInt(a).toString());
    this.last = parseInt(this.names.slice(-1)[0]);
    this.pointers = new Pointers(alphabet, dummy);
  }
  fullPath(name) {
    if (!this.paths[name])
      this.paths[name] = path.join(this.lengthPath, name + "-data.json");
    return this.paths[name];
  }
  has(name) {
    return this.collections[name] !== undefined;
  }
  get(name) {
    if (!this.has(name)) {
      this.collections[name] = new Collection();
      this.collections[name].load(this.fullPath(name));
    }
    return this.collections[name];
  }
  deleteIfEmpty(index) {
    const name = this.names[index];
    if (this.get(name).isEmpty()) {
      const last = this.names[this.names.length - 1];
      const temp = this.collections[name];
      this.collections[name] = this.collections[last];
      this.collections[last] = temp;
      this.unload(last, true);
      this.last = parseInt(last) - 1;
      this.names.pop();
      return true;
    } else return false;
  }
  finish(index) {
    const name = this.names[index];
    this.pointers.add(this.get(name).getPointer());
    this.separate(index, true);
    this.unload(name, true);
    this.names = this.names.filter((Name) => Name !== name);
  }
  separate(index, needToSort = false) {
    const size = needToSort ? this.sizeLimit : this.tempSizeLimit;
    const name = this.names[index];
    if (this.get(name).size >= size) {
      const tempCollection = this.collections[name];
      this.collections[name] = Collection.separate(
        this.get(name),
        size,
        needToSort
      );
      if (tempCollection.isEmpty()) return;
      this.last++;
      const last = this.last.toString();
      this.names.push(last);
      this.collections[last] = tempCollection;
    }
  }
  unload(name, deleteEmpty = false) {
    if (this.has(name)) {
      const _path = this.fullPath(name);
      this.collections[name].save(_path);
      if (deleteEmpty && this.get(name).isEmpty()) fs.unlinkSync(_path);
      delete this.collections[name];
    }
  }
  unloadCache() {
    const names = Object.keys(this.collections).sort((a, b) =>
      a.localeCompare(b)
    );
    let size = names.reduce((a, b) => a + this.get(b).size, 0);
    while (size >= this.fullSizeLimit && names.length > 0) {
      const last = names[names.length - 1];
      size -= this.get(last).size;
      this.unload(last);
      names.pop();
    }
  }
  merge(toIndex, fromIndex) {
    Collection.merge(
      this.get(this.names[toIndex]),
      this.get(this.names[fromIndex]),
      this.tempSizeLimit
    );
  }
  isEmpty() {
    return this.names.length === 0;
  }
}

class Pointers {
  constructor(alphabet, dummy) {
    this.pointers = [];
    this.alphabet = alphabet;
    this.dummy = dummy;
  }
  add(pointer) {
    if (pointer !== undefined) this.pointers.push(pointer);
  }
  save(_path) {
    fs.writeFileSync(
      path.join(_path, "pointers.json"),
      JSON.stringify(this.pointers)
    );
  }
  finish(_path) {
    this.add(this.createLastPointer());
    this.save(_path);
  }
  createLastPointer() {
    const sequence = this.pointers[0].length - this.dummy.length;
    const lastChar = this.alphabet
      .split("")
      .sort((a, b) => b.localeCompare(a))[0];
    let pointer = this.dummy + lastChar.repeat(sequence);
    const biggestPointer = pointer;
    while (biggestPointer.localeCompare(pointer) !== -1)
      pointer =
        pointer.substring(0, pointer.length - 1) +
        String.fromCharCode(pointer.charCodeAt(pointer.length - 1) + 1);
    this.pointers.push(pointer);
  }
}

export default clean;
