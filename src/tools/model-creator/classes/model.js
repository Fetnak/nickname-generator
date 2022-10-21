import fs from "fs";
import path from "path";
import Collection from "./collection.js";

export default class Model {
  constructor(output, dummy, sequence) {
    this.output = output;
    this.dummy = dummy;
    this.sequence = sequence;
    this.model = {};
    this.fileParts = {};

    for (let i = 0; i <= this.sequence; i++) this.fileParts[i] = 0;
  }
  addWord(word, count = 1) {
    for (let i = 1, n = Math.min(this.sequence, word.length - 1); i <= n; i++)
      this.separateAndAdd(word, i, count);
  }
  separateAndAdd(word, sequence, count = 1) {
    this.add("", word[0], count);
    for (let i = 0, n = word.length - sequence; i < n; i++)
      this.add(word.slice(i, i + sequence), word[i + sequence], count);
    this.add(word.slice(-sequence), this.dummy, count);
  }
  add(word, char, count = 1) {
    const length = word.length;
    if (this.has(length))
      this.model[length].add(this.dummy + word, char, count);
    else {
      this.model[length] = new Collection();
      this.model[length].add(this.dummy + word, char, count);
    }
  }
  has(length) {
    return this.model[length] !== undefined;
  }
  collection(length) {
    return this.model[length];
  }
  delete(length) {
    this.collections(length).clear();
  }
  save(length, newFormat = false) {
    const folderpath = path.join(
      this.output,
      length.toString().padStart(this.sequence.length, "0")
    );
    this.checkFolder(folderpath);
    const filepath = path.join(
      folderpath,
      this.fileParts[length].toString().padStart(6, "0") + "-data.json"
    );
    this.fileParts[length]++;
    const data = newFormat
      ? this.collection(length).newFormat()
      : this.collection(length).toSave();
    fs.writeFileSync(filepath, JSON.stringify(data));
  }
  checkSizeAndClear(size = -1, fullSize = 0) {
    let previousSize = 0;
    let currentSizes = {};
    const currentSize = () =>
      Object.values(currentSizes).reduce((a, b) => a + b, 0);
    for (let length in this.model) {
      const collectionSize = this.collection(length).size;
      previousSize += collectionSize;
      if (collectionSize > size) {
        this.save(length);
        this.collection(length).clear();
      } else currentSizes[length] = collectionSize;
    }
    if (currentSize() > fullSize) {
      const lengths = Object.keys(currentSizes);
      while (currentSize() > fullSize && lengths.length > 0) {
        const length = lengths[lengths.length - 1];
        this.save(length);
        this.collection(length).clear();
        delete currentSizes[length];
        lengths.pop();
      }
    }
    return previousSize - currentSize();
  }
  getSize() {
    let size = 0;
    for (let length in this.model) size += this.collection(length).size;
    return size;
  }
  checkFolder(path) {
    try {
      fs.mkdirSync(path, { recursive: true });
    } catch (error) {
      console.log("Unable to create output folder!");
      console.log(error);
    }
  }
}
