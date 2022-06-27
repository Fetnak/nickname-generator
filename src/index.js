import yargs from "yargs";
import xmlToTxtConverter from "./tools/xml-to-txt-converter/index.js";
import wordCounter from "./tools/word-counter/index.js";
import uuidv4Generator from "./tools/uuidv4-generator/index.js";
import readDir from "./functions/read-dir.js";

const argv = yargs(process.argv.slice(2));

argv.command({
  command: "xmlToTxtConverter",
  describe: "Removes all xml tags from file",
  builder: {
    help: {
      alias: "h",
      describe: "Show help",
    },
    input: {
      alias: "i",
      describe: "Path to the xml which needs to be converted",
      demandOption: true,
      type: "string",
      normalize: true,
    },
    output: {
      alias: "o",
      describe: "Path to save the converted xml file",
      type: "string",
      normalize: true,
    },
    chunk: {
      alias: "c",
      describe: "Size of the processed chunk at a time (in MB)",
      type: "number",
      choices: [1, 2, 4, 8, 16, 32, 64, 128, 256],
      default: 16,
    },
  },
  handler(argv) {
    argv.chunk *= 1024 * 1024;
    xmlToTxtConverter.convert(argv);
  },
});

argv.command({
  command: "wordCounter",
  describe: "Counts all words in text file and places the result into the data file and the information file",
  builder: {
    help: {
      alias: "h",
      describe: "Show help",
    },
    input: {
      alias: "i",
      describe: "Path to the text file which needs to be analyzed",
      demandOption: true,
      type: "string",
      normalize: true,
    },
    output: {
      alias: "o",
      describe: "Path to the folder where you want to save the result into the data file and the information file",
      type: "string",
      normalize: true,
      default: "./resources/words",
    },
    chunk: {
      alias: "c",
      describe: "Size of the processed chunk at a time (in MB)",
      type: "number",
      choices: [1, 2, 4, 8, 16, 32, 64, 128, 256],
      default: 16,
    },
    language: {
      alias: "l",
      describe: "Language of the text",
      type: "string",
      choices: ["eng", "lat", "rus", "bel", "ukr"],
      default: "eng",
    },
    sort: {
      alias: "s",
      describe: "Sort words by count in result file",
      type: "string",
      choices: ["none", "asc", "desc"],
      default: "none",
    },
    guid: {
      alias: "g",
      describe: "Select your own guid",
      type: "string",
    },
  },
  handler(argv) {
    argv.chunk *= 1024 * 1024;
    wordCounter.countWords(argv);
  },
});

argv.command({
  command: "modelCreator",
  describe: "Use files from a word counter tool to create a model to create nicknames for nickname generator",
  builder: {
    help: {
      alias: "h",
      describe: "Show help",
    },
    input: {
      alias: "i",
      describe: "Path to the folder with files from a word counter tool",
      demandOption: true,
      type: "string",
      normalize: true,
    },
    output: {
      alias: "o",
      describe: "Path to the folder where you want to save the model",
      type: "string",
      normalize: true,
      default: "./resources/models",
    },
    sequence: {
      alias: "s",
      describe: "Size of the character sequence to be processed to create the model",
      type: "number",
      default: 3,
    },
    parameters: {
      alias: "p",
      describe: "Path to parameters file, which will be applied during creating model",
      type: "string",
    },
  },
  handler(argv) {
    argv.chunk *= 1024 * 1024;
    wordsCounter.countWords(argv);
  },
});

argv.command({
  command: "uuidv4Generator",
  describe: "Generates multiple UUIDs",
  builder: {
    help: {
      alias: "h",
      describe: "Show help",
    },
    count: {
      alias: "c",
      describe: "How many uuid should be generated",
      type: "number",
      default: 10,
    },
    form: {
      alias: "f",
      describe: "In what form to provide uuid",
      type: "string",
      default: "console",
      choices: ["console", "json", "text"],
    },
    output: {
      alias: "o",
      describe: "Path to save file with UUIDs",
      type: "string",
      default: "./resources/UUIDs/<filename>",
    },
  },
  handler(argv) {
    uuidv4Generator.generateUUIDs(argv);
  },
});

argv.wrap(argv.terminalWidth()).version(false).parse();

console.log("Use option --help to see commands")