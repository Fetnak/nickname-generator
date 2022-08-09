import yargs from "yargs";
import { convertXmlToTxt } from "./tools/xml-to-txt-converter/index.js";
import { countWords } from "./tools/word-counter/index.js";
import { generateUUIDs } from "./tools/uuidv4-generator/index.js";
import { createModel } from "./tools/model-creator/index.js";
import { generateNickname } from "./tools/nickname-generator/index.js";
import { displayWordsInfo, displayModelInfo } from "./functions/read-dir.js";

const argv = yargs(process.argv.slice(2));

// xmlToTxtConverter
argv.command({
  command: "xmlToTxtConverter",
  describe: "Removes all xml tags from file.",
  builder: {
    help: {
      alias: "h",
      describe: "Show help.",
    },
    input: {
      alias: "i",
      describe: "Path to the xml which needs to be converted.",
      demandOption: true,
      type: "string",
      normalize: true,
    },
    output: {
      alias: "o",
      describe: "Path to save the converted xml file.",
      type: "string",
      normalize: true,
    },
    chunk: {
      alias: "c",
      describe: "Size of the processed chunk at a time (in MB).",
      type: "number",
      choices: [1, 2, 4, 8, 16, 32, 64, 128, 256],
      default: 16,
    },
  },
  handler(argv) {
    argv.chunk *= 1024 * 1024;
    convertXmlToTxt(argv);
  },
});

// wordCounter
argv.command({
  command: "wordCounter",
  describe: "Counts all words in text file and places the result into the data file and the information file.",
  builder: {
    help: {
      alias: "h",
      describe: "Show help",
    },
    input: {
      alias: "i",
      describe: "Path to the text file which needs to be analyzed.",
      demandOption: true,
      type: "string",
      normalize: true,
    },
    output: {
      alias: "o",
      describe: "Path to the folder where you want to save the result into the data file and the information file.",
      type: "string",
      normalize: true,
      default: "./resources/words",
      hidden: true,
    },
    chunk: {
      alias: "c",
      describe: "Size of the processed chunk at a time (in MB).",
      type: "number",
      choices: [1, 2, 4, 8, 16, 32, 64, 128, 256],
      default: 16,
    },
    language: {
      alias: "l",
      describe: "Language of the text.",
      type: "string",
      choices: ["eng", "engr", "lat", "rus", "bel", "ukr", "ita", "swe", "fre", "deu", "spa"],
      default: "eng",
    },
    sort: {
      alias: "s",
      describe: "Sort words by count in result file.",
      type: "string",
      choices: ["none", "asc", "desc"],
      default: "none",
    },
    uuid: {
      alias: "u",
      describe: "Select your own uuid instead of random.",
      type: "string",
    },
    describtion: {
      describe: "Description. Just description.",
      type: "string",
    },
  },
  handler(argv) {
    argv.chunk *= 1024 * 1024;
    countWords(argv);
  },
});

// modelCreator
argv.command({
  command: "modelCreator",
  describe: "Use files from a word counter tool to create a model to create nicknames for nickname generator.",
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
      describe: "Size of the character sequence to be processed to create the model.",
      type: "number",
      default: 3,
    },
    parameters: {
      alias: "p",
      describe: "Path to parameters file, which will be applied during creating model.",
      type: "string",
    },
    list: {
      alias: "l",
      describe: "Display all available files from word counter tool.",
      type: "boolean",
    },
    tempFileLimit: {
      describe: "Limit for temporary weight files (in MB).",
      type: "number",
      default: 8,
    },
    fileLimit: {
      describe: "Limit for output weight files (in MB).",
      type: "number",
      default: 8,
    },
    checkStep: {
      describe: "Step for check size of model data in RAM and logging.",
      type: "number",
      default: 10000,
    },
    lengthOfProcessedWord: {
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
  },
  handler(argv) {
    if (argv.list) {
      displayWordsInfo(argv.input);
      process.exit();
    }
    if (argv.inputUuid === undefined) {
      console.log("Option --inputUuid is empty!");
      process.exit();
    }
    argv.tempFileLimit *= 1024 * 1024;
    argv.fileLimit *= 1024 * 1024;
    createModel(argv);
  },
});

// uuidv4Generator
argv.command({
  command: "uuidv4Generator",
  describe: "Generates multiple UUIDs.",
  builder: {
    help: {
      alias: "h",
      describe: "Show help.",
    },
    count: {
      alias: "c",
      describe: "How many uuid should be generated.",
      type: "number",
      default: 10,
    },
    form: {
      alias: "f",
      describe: "In what form to provide uuid.",
      type: "string",
      default: "console",
      choices: ["console", "json", "text"],
    },
    output: {
      alias: "o",
      describe: "Path to save file with UUIDs.",
      type: "string",
      default: "./resources/UUIDs/<filename>",
    },
  },
  handler(argv) {
    generateUUIDs(argv);
  },
});

// nicknameGenerator
argv.command({
  command: "nicknameGenerator",
  describe: "Generates multiple nicknames.",
  builder: {
    help: {
      alias: "h",
      describe: "Show help",
    },
    input: {
      describe: "Path to the folder with models.",
      type: "string",
      default: "./resources/models",
      normalize: true,
      hidden: true,
    },
    uuid: {
      alias: "u",
      describe: "UUID of model.",
      type: "string",
    },
    minimum: {
      alias: "min",
      describe: "Minimum number of characters to generate.",
      type: "number",
      default: 4,
    },
    maximum: {
      alias: "max",
      describe: "Maximum number of characters to generate.",
      type: "number",
      default: 8,
    },
    minAccuracy: {
      alias: "mina",
      describe: "Min number of previous characters, which will be used to generate next character.",
      type: "number",
      default: 1,
    },
    maxAccuracy: {
      alias: "maxa",
      describe: "Max number of previous characters, which will be used to generate next character.",
      type: "number",
      default: 3,
    },
    progressAccuracy: {
      alias: "pa",
      describe: "Accuracy of progress percent.",
      type: "number",
      default: 2,
    },
    count: {
      alias: "c",
      describe: "How many nicknames should be generated.",
      type: "number",
      default: 240,
    },
    columns: {
      alias: "col",
      describe: "How many columns will the nicknames be sorted into.",
      type: "number",
      default: 12,
    },
    form: {
      alias: "f",
      describe: "In what form to provide nicknames.",
      type: "string",
      default: "console",
      choices: ["console", "json", "text"],
    },
    output: {
      alias: "o",
      describe: "Path to save file with nicknames.",
      normalize: true,
      type: "string",
      default: "./resources/nicknames/",
    },
    cacheSize: {
      alias: "cs",
      describe: "Size of cache of weights.",
      type: "string",
      default: 128,
    },
    list: {
      alias: "l",
      describe: "Display all available models.",
      type: "boolean",
    },
    beginning: {
      alias: "b",
      describe: "The beginning of every nickname.",
      type: "string",
      default: "",
    },
    endByModel: {
      alias: "e",
      describe: "Generate only nicknames whose end has been defined in the model.",
      type: "boolean",
      default: true,
    },
    generateAttempts: {
      alias: "ga",
      describe: "How many attempts to generate nicknames (effective for small models).",
      type: "number",
      default: 100,
    },
    withoutLengths: {
      alias: "wl",
      describe: "Don't initialize lengths for generator.",
      type: "boolean",
    },
    deleteDuplicates: {
      alias: "dd",
      describe: "Delete duplicates during nicknames generation, not after nicknames generation.",
      type: "boolean",
      default: true,
    },
    sort: {
      alias: "s",
      describe: "Sort output nicknames.",
      type: "string",
      default: "none",
      choices: ["none", "random", "asc", "desc", "asc2", "desc2"],
    },
  },
  handler(argv) {
    if (argv.list) {
      displayModelInfo(argv.input, "-info.json");
      process.exit();
    }
    if (argv.uuid === undefined) {
      console.log("Option --uuid is empty!");
      process.exit();
    }
    argv.cacheSize *= 1024 * 1024;
    argv.beginning = argv.beginning.toLowerCase();
    generateNickname(argv);
  },
});

argv.wrap(argv.terminalWidth()).version(false).parse();

if (process.argv.slice(2) === []) console.log("Use option --help to see commands.");
