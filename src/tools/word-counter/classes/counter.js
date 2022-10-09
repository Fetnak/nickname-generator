import fs from "fs";
import path from "path";
import Info from "./info.js";
import Words from "./words.js";
import Text from "./text.js";
import sizeof from "../../../functions/sizeof.js";
import { log } from "../../../functions/log.js";

export default class Counter {
  constructor(args) {
    this.input = args.input;
    this.output = args.output;
    this.chunk = args.chunk;
    this.alphabet = args.alphabet;
    this.sizeLimit = args.sizeLimit;
    this.info = new Info(args);
    this.fileParts = 0;

    this.tempWord = "";
  }

  checkOutputFolderPath() {
    try {
      console.log(this.output);
      fs.mkdirSync(this.output, { recursive: true });
    } catch (error) {
      console.log("Unable to create output file!");
      console.log(error);
    }
  }

  checkAndClean(words, sizeLimit = -1) {
    if (words.size >= sizeLimit) {
      const filepath = path.join(
        this.output,
        this.fileParts.toString().padStart(3, "0") + "-data.json"
      );
      this.fileParts++;
      words.save(filepath);
      log(`${words.length} words was wrote on drive.`);
      words.clear();
    }
  }

  count() {
    this.checkOutputFolderPath();
    const words = new Words();
    const text = new Text(this.input, this.chunk, this.alphabet);
    const separator = text.getSeparatedWords();
    let i = 1;
    for (const word of separator) {
      words.add(word);
      if (i++ % 10000 === 1) {
        log(`Size of ${words.length} words is ${words.size} bytes`);
        this.checkAndClean(words, this.sizeLimit);
      }
    }
    this.checkAndClean(words);
    this.info.save(this.output);
  }

  textToWords(text, words) {
    for (let i = 0, tempLetter, n = text.length - 1; i < n; i++) {
      tempLetter = text[i].toLowerCase();
      if (this.isLetter(tempLetter)) word += tempLetter;
      else {
        if (this.tempWord.length >= 2) words.addWord(this.tempWord);
        this.tempWord = "";
      }
    }
  }
}
