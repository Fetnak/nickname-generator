import Args from "./classes/args.js";
import Counter from "./classes/counter.js";
import Cleaner from "./classes/cleaner.js";
import { log } from "../../functions/log.js";

export default {
  command: "wordCounter",
  describe:
    "Counts all words in text file and places the result into the data file and the information file.",
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
      describe:
        "Path to the folder where you want to save the result into the data file and the information file.",
      type: "string",
      normalize: true,
      default: "./resources/words",
      hidden: true,
    },
    chunk: {
      alias: "c",
      describe: "Size of the processed chunk at a time (in MB).",
      type: "number",
      default: 16,
    },
    sizeLimit: {
      alias: "sl",
      describe: "Limit for each file with words (in MB).",
      type: "number",
      default: 4,
    },
    partsToLoad: {
      alias: "p",
      describe: "How many word files are stored in RAM during processing.",
      type: "number",
      default: 5,
    },
    language: {
      alias: "l",
      describe: "Language of the text.",
      type: "string",
      choices: [
        "eng",
        "rus",
        "bel",
        "ukr",
        "ita",
        "swe",
        "fre",
        "deu",
        "spa",
      ],
      default: "eng",
    },
    alphabet: {
      alias: "a",
      describe: "Custom alphabet.",
      type: "string",
    },
    uuid: {
      alias: "u",
      describe: "Select your own uuid instead of random.",
      type: "string",
    },
    description: {
      describe: "Description. Just description.",
      type: "string",
    },
  },
  handler(argv) {
    const pargs = new Args(argv);
    const counter = new Counter(pargs);
    counter.count();
    const cleaner = new Cleaner(
      pargs.output,
      pargs.partsToLoad,
      pargs.sizeLimit
    );
    log("Started clearing files.");
    cleaner.clean();
  },
};
