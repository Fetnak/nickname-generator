import fs from "fs";
import path from "path";
import * as uuid from "uuid";

export default class Args {
  constructor(args) {
    this.args = args;
    this.input = args.input;
    this.uuid = uuid.validate(args.uuid) ? args.uuid : uuid.v4();
    this.output = path.join(args.output, "words-" + this.uuid);
    this.chunk = Math.max(Math.floor(args.chunk), 1) * 1024 * 1024;
    this.sourceSize = fs.statSync(args.input).size;
    this.language = args.language;
    this.alphabet = this.parseAlphabet();
    this.description = args.description;
    this.sizeLimit = Math.max(1, Math.floor(args.sizeLimit)) * 1024 * 1024;
    this.partsToLoad = Math.max(2, args.partsToLoad);
    console.log("UUID: " + this.uuid);
  }
  outputArgs() {
    delete this.args;
    for (const key in this) console.log(`${key}: ${this[key]}`);
  }
  parseAlphabet() {
    if (this.args.alphabet) return this.args.alphabet;

    switch (this.args.language) {
      case "eng":
      case "fre":
      case "ita":
        return "abcdefghijklmnopqrstuvwxyz";
        break;
      case "rus":
        return "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
        break;
      case "bel":
        return "абвгдеёжзійклмнопрстуўфхцчшыьэюя";
        break;
      case "ukr":
        return "абвгґдеєжзиіїйклмнопрстуфхцчшщьюя";
        break;
      case "swe":
        return "abcdefghijklmnopqrstuvwxyzåäö";
        break;
      case "deu":
        return "abcdefghijklmnopqrstuvwxyzäöüß";
        break;
      case "spa":
        return "abcdefghijklmnñopqrstuvwxyz";
        break;
    }
  }
}
