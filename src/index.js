import yargs from "yargs";
import xmlToTxtConverter from "./tools/xml-to-txt-converter/index.js";
import wordsCounter from "./tools/words-counter/index.js";

const argv = yargs(process.argv.slice(2));

argv.command({
  command: "xmlToTxtConverter",
  describe: "Removes all xml tags from file",
  builder: {
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
  command: "wordsCounter",
  describe: "Removes all xml tags from file",
  builder: {
    input: {
      alias: "i",
      describe: "Path to the text file which needs to be analyzed",
      demandOption: true,
      type: "string",
      normalize: true,
    },
    output: {
      alias: "o",
      describe: "Path to the folder where you want to save the result file and the information file",
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
  },
  handler(argv) {
    argv.chunk *= 1024 * 1024;
    wordsCounter.countWords(argv);
  },
});

argv.parse();
