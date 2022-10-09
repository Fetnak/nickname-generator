import fs from "fs";
import path from "path";
import dayjs from "dayjs";

export default class Info {
  constructor(args) {
    this.args = args;
    this.start = Date.now();
    this.uuid = args.uuid;
    this.name = path.basename(args.input, ".txt");
    this.description = args.description;
    this.createdAt = undefined;
    this.alphabet = args.alphabet;
    this.sourceSize = args.sourceSize.toString() + " bytes";
    this.toWordsProcessingTime = undefined;
    this.language = this.parseLanguage();
    this.version = process.env.npm_package_version;
  }
  save(filepath) {
    this.finish();
    const info = {
      uuid: this.uuid,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      alphabet: this.alphabet,
      sourceSize: this.sourceSize,
      toWordsProcessingTime: this.toWordsProcessingTime,
      language: this.language,
      version: this.version,
    };
    fs.writeFileSync(path.join(filepath, "info.json"), JSON.stringify(info));
  }
  parseLanguage() {
    const languages = {
      rus: "Russian",
      bel: "Belarusian",
      urk: "Ukrainian",
      lat: "Latin",
      eng: "English",
      ita: "Italian",
      swe: "Swedish",
      fre: "French",
      deu: "German",
      spa: "Spanish",
    };
    return languages[this.args.language];
  }
  finish() {
    this.createdAt = dayjs(Date.now()).format("YYYY-MM-DD HH-mm-ss");
    this.toWordsProcessingTime = (Date.now() - this.start).toString() + " ms";
  }
}
