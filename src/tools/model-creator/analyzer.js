import fs from "fs";
import path from "path";
import Model from "./classes/model.js";
import Words from "../../tools/word-counter/classes/words.js";
import { log } from "../../functions/log.js";

const analyze = (
  output,
  dummy,
  sequence,
  input,
  lengthOfWord,
  checkStep,
  tempSizeLimit,
  fullSizeLimit,
  info
) => {
  const model = new Model(output, dummy, sequence);
  const paths = getWordsPaths(input);
  let checker = 1;
  let fileCounter = 0;
  for (let filepath of paths) {
    log(`${++fileCounter}/${paths.length} file started`);
    const words = new Words(filepath);
    for (let word of words)
      if (word.length >= lengthOfWord) {
        model.addWord(word, words.count(word));
        if (checker++ % checkStep === 0) {
          const size = model.checkSizeAndClear(tempSizeLimit, fullSizeLimit);
          if (size > 0) log(`${size} bytes was written to the drive`);
          checker = 1;
        }
      }
    global.gc();
  }
  model.checkSizeAndClear();
  info.save(output);
};

const getWordsPaths = (input) => {
  return fs
    .readdirSync(input)
    .filter((name) => name.includes("data.json"))
    .map((name) => path.join(input, name));
};

export default analyze;
