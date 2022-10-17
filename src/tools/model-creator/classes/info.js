import fs from "fs";
import path from "path";
import dayjs from "dayjs";

export default class Info {
  constructor(args, wordsInfo) {
    this.start = new Date();
    this.args = args;
    this.wordsInfo = wordsInfo;
  }
  output() {
    const output = {
      uuid: this.args.outputUuid,
      uuidWords: this.wordsInfo.uuid,
      name: this.wordsInfo.name,
      description: this.wordsInfo.description,
      createdAt: dayjs(Date.now()).format("YYYY-MM-DD HH-mm-ss"),
      alphabet: this.wordsInfo.alphabet,
      maxSequenceLength: this.args.sequence,
      sourceSize: this.wordsInfo.sourceSize,
      toWordsProcessingTime: this.wordsInfo.toWordsProcessingTime,
      toModelProcessingTime: (Date.now() - this.start).toString() + " ms",
      language: this.wordsInfo.language,
      version: process.env.npm_package_version,
      dummy: this.args.dummy,
      calculatedEndings: this.args.calculateEnding,
    };
    return output;
  }
  save(output) {
    fs.writeFileSync(
      path.join(output, "info.json"),
      JSON.stringify(this.output())
    );
  }
}
