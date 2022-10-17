import fs from "fs";
import path from "path";
import Args from "./classes/args.js";
import Info from "./classes/info.js";
import analyze from "./analyzer.js";
import clean from "./cleaner.js";
import listWordsInfo from "./list-words-info.js";

export default {
  command: "modelCreator",
  describe:
    "Use files from a word counter tool to create a model to create nicknames for nickname generator.",
  builder: {
    help: {
      alias: "h",
      describe: "Show help.",
    },
    input: {
      describe: "Path to the folder with files from a word counter tool.",
      type: "string",
      normalize: true,
      default: "./resources/words",
      hidden: true,
    },
    inputUuid: {
      alias: "i",
      describe: "UUID of a file with words.",
    },
    outputUuid: {
      alias: "o",
      describe: "UUID for result model file.",
    },
    output: {
      describe: "Path to the folder where you want to save the model.",
      type: "string",
      normalize: true,
      default: "./resources/models",
      hidden: true,
    },
    sequence: {
      alias: "s",
      describe:
        "Size of the character sequence to be processed to create the model.",
      type: "number",
      default: 3,
    },
    parameters: {
      alias: "p",
      describe:
        "Path to parameters file, which will be applied during creating model.",
      type: "string",
    },
    list: {
      alias: "l",
      describe: "Display all available files from word counter tool.",
      type: "boolean",
    },
    sizeLimit: {
      alias: "sl",
      describe: "Limit for output chances files (in MB).",
      type: "number",
      default: 8,
    },
    tempSizeLimit: {
      alias: "tsl",
      describe: "Limit for each temp file with words (in MB).",
      type: "number",
      default: 16,
    },
    fullSizeLimit: {
      alias: "fsl",
      describe: "Limit for all temp files in RAM (in MB).",
      type: "number",
      default: 512,
    },
    checkStep: {
      describe: "Step for check size of model data in RAM and logging.",
      type: "number",
      default: 10000,
    },
    lengthOfWord: {
      alias: "lpw",
      describe: "Minimum length of the word to be used to create the model.",
      type: "number",
      default: 2,
    },
    calculateEnding: {
      alias: "ce",
      description: "Calculate the chance of ending a word.",
      type: "boolean",
      default: true,
    },
    resetMultiplier: {
      alias: "rm",
      description: "Always take the multiplier as 1.",
      type: "boolean",
      default: false,
    },
  },
  handler(argv) {
    if (argv.list) {
      listWordsInfo(argv.input);
      process.exit();
    }

    const getWordsInfo = (input) => {
      return JSON.parse(fs.readFileSync(path.join(input, "info.json")));
    };
    const args = new Args(argv);
    const info = new Info(args, getWordsInfo(args.input));
    analyze(
      args.output,
      args.dummy,
      args.sequence,
      args.input,
      args.lengthOfWord,
      args.checkStep,
      args.tempSizeLimit,
      args.fullSizeLimit,
      info
    );
    clean(
      args.output,
      args.sizeLimit,
      args.fullSizeLimit,
      info.wordsInfo.alphabet,
      args.dummy
    );
  },
};
