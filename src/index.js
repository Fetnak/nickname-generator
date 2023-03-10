import yargs from "yargs";
import wordCounter from "./tools/word-counter/index.js";
import modelCreator from "./tools/model-creator/index.js";
import nicknameGenerator from "./tools/nickname-generator/index.js";

const argv = yargs(process.argv.slice(2));

// wordCounter
argv.command(wordCounter);

// modelCreator
argv.command(modelCreator);

// nicknameGenerator
argv.command(nicknameGenerator);

argv.wrap(argv.terminalWidth()).version(false).parse();

if (process.argv.slice(2) === [])
  console.log("Use option --help to see commands.");
