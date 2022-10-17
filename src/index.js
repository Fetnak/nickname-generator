import yargs from "yargs";
import { convertXmlToTxt } from "./tools/xml-to-txt-converter/index.js";
import wordCounter from "./tools/word-counter/index.js";
import { generateUUIDs } from "./tools/uuidv4-generator/index.js";
import modelCreator from "./tools/model-creator/index.js";
import nicknameGenerator from "./tools/nickname-generator/index.js";

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
argv.command(wordCounter);

// modelCreator
argv.command(modelCreator);


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
argv.command(nicknameGenerator);

argv.wrap(argv.terminalWidth()).version(false).parse();

if (process.argv.slice(2) === [])
  console.log("Use option --help to see commands.");
