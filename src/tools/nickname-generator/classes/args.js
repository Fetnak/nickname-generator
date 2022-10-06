import fs from "fs";
import path from "path";
import dayjs from "dayjs";

export default class Args {
  constructor(args) {
    this.args = args;
    this.modelPath = this.parseModelPath();
    this.modelInfo = this.loadModelInfo();
    this.dummy = this.modelInfo.dummy;
    this.beginning = this.parseBeginning();
    this.count = this.args.count;
    this.columns = this.args.columns;
    this.sort = this.args.sort;
    this.minimum = this.parseMinimum();
    this.maximum = this.parseMaximum();
    this.endSuddenly = this.parseEndSuddenly();
    this.minAccuracy = this.parseMinAccuracy();
    this.maxAccuracy = this.parseMaxAccuracy();
    this.generateAttempts = this.parseGenerateAttempts();
    this.progressAccuracy = this.parseProgressAccuracy();
    this.lengthsMultiplier = this.parseLengthsMultiplier();
    this.counterMultiplier = this.parseCounterMultiplier();
    this.sort = args.sort;
    this.form = args.form;
    this.output = args.output;
    this.outputFilePath = this.parseOutputFilePath();
    this.cacheSize = this.parseCacheSize();
  }
  outputArgs() {
    delete this.args;
    delete this.modelInfo;
    for (const key in this) console.log(`${key}: ${this[key]}`);
  }
  parseModelPath() {
    return path.join(this.args.input, "model-" + this.args.uuid);
  }
  loadModelInfo() {
    return JSON.parse(fs.readFileSync(path.join(this.modelPath, "info.json")));
  }
  parseBeginning() {
    const regex = new RegExp("[" + this.modelInfo.alphabet + "]");
    let name = "";
    const beginning = this.args.beginning.toLowerCase();
    for (const char of beginning) if (char.match(regex)) name += char;
    return name;
  }
  parseMinimum() {
    return this.beginning.length + Math.max(1, this.args.minimum);
  }
  parseMaximum() {
    return Math.max(this.minimum, this.beginning.length + this.args.maximum);
  }
  parseEndSuddenly() {
    return !(!this.args.endSuddenly && this.modelInfo.calculatedEndings);
  }
  parseMinAccuracy() {
    return Math.max(1, this.args.minAccuracy);
  }
  parseMaxAccuracy() {
    const maxModelAccuracy =
      fs.readdirSync(this.modelPath).filter((name) => name !== "info.json")
        .length - 1;
    return Math.min(
      Math.max(this.minAccuracy, this.args.maxAccuracy),
      maxModelAccuracy
    );
  }
  parseGenerateAttempts() {
    return this.args.generateAttempts
      ? this.args.generateAttempts
      : this.endSuddenly
      ? this.minimum + this.maxAccuracy
      : this.minimum * this.maxAccuracy;
  }
  parseProgressAccuracy() {
    return Math.max(
      this.args.progressAccuracy
        ? this.args.progressAccuracy
        : this.count.toString().length - 2,
      0
    );
  }
  parseLengthsMultiplier() {
    return this.args.lengthsMultiplier === 0
      ? this.maximum - this.minimum + 1
      : this.args.lengthsMultiplier;
  }
  parseCacheSize() {
    return Math.max(this.args.cacheSize, 1) * 1024 * 1024;
  }
  parseCounterMultiplier() {
    return Math.max(1, this.args.counterMultiplier);
  }
  parseOutputFilePath() {
    let extension;
    switch (this.form) {
      case "json":
        extension = ".json";
        break;
      case "text":
        extension = ".txt";
        break;
      default:
        return undefined;
    }
    return path.join(
      this.output,
      dayjs(Date.now()).format("YYYY-MM-DD_HH-mm-ss") + extension
    );
  }
  parseCacheSize() {
    return this.args.cacheSize * 1024 * 1024;
  }
}
