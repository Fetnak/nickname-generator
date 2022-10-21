import Args from "./classes/args.js";
import Cache from "./classes/cache.js";
import Generator from "./classes/generator.js";
import Output from "./classes/output.js";
import listModelInfo from "./list-model-info.js";

export default {
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
      describe:
        "Min number of previous characters, which will be used to generate next character.",
      type: "number",
      default: 1,
    },
    maxAccuracy: {
      alias: "maxa",
      describe:
        "Max number of previous characters, which will be used to generate next character.",
      type: "number",
      default: 3,
    },
    progressAccuracy: {
      alias: "pa",
      describe: "Accuracy of progress percent.",
      type: "number",
    },
    count: {
      alias: "c",
      describe: "How many nicknames should be generated.",
      type: "number",
      default: 240,
    },
    counterMultiplier: {
      alias: "cm",
      describe:
        "Multiplier for the count of nicknames to speed up generation. Increases memory usage.",
      type: "number",
      default: 1,
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
      describe: "Size of cache of model.",
      type: "number",
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
    endSuddenly: {
      alias: "e",
      describe: "Don't use the model to determine the end of nicknames.",
      type: "boolean",
    },
    generateAttempts: {
      alias: "ga",
      describe:
        "How many attempts to generate nicknames (effective for small models).",
      type: "number",
    },
    seed: {
      descrive: "Seed for random function.",
      type: "number",
    },
    lengthsMultiplier: {
      alias: "m",
      describe:
        "Multiplier to initialization of lengths. 0 to disable initialization of lengths for the generator.",
      type: "number",
      default: 1,
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
      listModelInfo(argv.input);
      process.exit();
    }
    if (argv.uuid === undefined) {
      console.log("Option --uuid is empty!");
      process.exit();
    }
    const args = new Args(argv);
    args.outputArgs();
    const cache = new Cache(args);
    const output = new Output(args);
    output.checkFilePath();
    const generator = new Generator(args, cache);
    const nicknames = generator.generateNicknames();
    output.sortArray(nicknames);
    output.outputArray(nicknames);
  },
};
