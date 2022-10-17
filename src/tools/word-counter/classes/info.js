import fs from "fs";
import path from "path";
import dayjs from "dayjs";

export default class Info {
  constructor(args) {
    this.args = args;
    this.start = Date.now();
  }
  save(filepath) {
    this.finish();
    const info = {
      uuid: this.args.uuid,
      name: path.basename(this.args.input, ".txt"),
      description: this.args.description,
      createdAt: dayjs(Date.now()).format("YYYY-MM-DD HH-mm-ss"),
      alphabet: this.args.alphabet,
      sourceSize: this.args.sourceSize.toString() + " bytes",
      toWordsProcessingTime: (Date.now() - this.start).toString() + " ms",
      language: this.parseLanguage(),
      version: process.env.npm_package_version,
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
}
