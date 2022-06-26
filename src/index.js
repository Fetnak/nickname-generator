import yargs from "yargs";
import xmlToTxtConverter from "./tools/xml-to-txt-converter/index.js";

const argv = yargs(process.argv.slice(2));

argv.version("1.1");

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
    }
  },
  handler(argv) {
    xmlToTxtConverter.convert(argv);
  },
});

argv.parse();
