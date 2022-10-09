import fs from "fs";
import path from "path";
import Words from "./words.js";
import { log } from "../../../functions/log.js";

export default class Cleaner {
  constructor(output, partsToLoad, sizeLimit) {
    this.output = output;
    this.partsToLoad = partsToLoad;
		this.sizeLimit = sizeLimit;
    this.words = {};
    this.filenames = [];
  }

  clean(wordsFolder) {
    this.filenames = this.getFilenames();
    while (this.filenames.length > 0) {
			const words1name = this.filenames[0];
      const words1 = this.loadWords(words1name);
      for (let i = 1, words2; i < this.filenames.length; i++) {
        words2 = this.loadWords(this.filenames[i]);
        Words.merge(words1, words2, this.sizeLimit);
        this.unloadCache();
      }
      this.completeWords(words1name);
    }
  }
  loadWords(filename) {
    if (this.words[filename] === undefined) {
      const filepath = path.join(this.output, filename);
      this.words[filename] = new Words(filepath);
      log(`"${filename}" Loaded`);
    }
    return this.words[filename];
  }
  unloadCache() {
    const loaded = Object.keys(this.words);
    while (loaded.length > this.partsToLoad) {
      this.unloadWords(loaded[loaded.length - 1], true);
      loaded.pop();
    }
  }
  unloadWords(filename, msg = false, deleteEmpty = false) {
    const filepath = path.join(this.output, filename);
    if (deleteEmpty && this.words[filename].isEmpty()) {
      fs.unlinkSync(filepath);
      this.deleteFilename(filename);
    } else this.words[filename].save(filepath);
    if (msg) log(`"${filename}" Unloaded`);
    delete this.words[filename];
  }
  deleteFilename(filename) {
    this.filenames = this.filenames.filter((name) => name !== filename);
  }
  completeWords(filename) {
    if (this.words[filename]) {
      this.unloadWords(filename, false, true);
      this.deleteFilename(filename);
      log(`Completed "${filename}"`);
    }
  }
  getFilenames() {
    return fs
      .readdirSync(this.output)
      .filter((filename) => filename.includes("data.json"));
  }
}
