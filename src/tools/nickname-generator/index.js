import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import { log } from "../../functions/log.js";
import { generateNicknames, addBlankNicknames } from "./src/generate-nicknames.js";
import { outputArrayAsTable } from "./src/output-array-as-table.js";
import { shuffleArray } from "./src/shuffle-array.js";

export const generateNickname = (args) => {
  const start = (args) => {
    log("Start.");

    switch (args.form) {
      case "json":
        fs.writeFileSync(path.join(args.output, dayjs(Date.now()).format("YYYY-MM-DD_HH-mm-ss") + ".json"), "");
        break;
      case "text":
        fs.writeFileSync(path.join(args.output, dayjs(Date.now()).format("YYYY-MM-DD_HH-mm-ss") + ".txt"), "");
        break;
    }

    const foldersPath = path.join(args.input, "model-" + args.uuid);
    const modelInfo = JSON.parse(fs.readFileSync(path.join(foldersPath, "info.json")));
    console.log(modelInfo);

    args.start = checkBeginningOfNickname(args.start, modelInfo.alphabet);
    args.minimum = args.start.length + args.minimum;
    args.maximum = args.start.length + args.maximum;
    const maxSequenceLength = fs.readdirSync(foldersPath).filter((name) => name !== "info.json").length - 1;
    modelInfo.maxSequenceLength = args.accuracy > 0 && args.accuracy < maxSequenceLength ? args.accuracy : maxSequenceLength;
    const preNicknames = addBlankNicknames(args.count, args.start, modelInfo);
    const lengths = initializeLengths(args.minimum, args.maximum, args.count);
    let nicknames = generateNicknames(preNicknames, foldersPath, modelInfo, args, lengths);

    shuffleArray(nicknames);

    switch (args.form) {
      case "console":
        outputArrayAsTable(nicknames, args.maximum, args.columns);
        break;
      case "json":
        fs.writeFileSync(path.join(args.output, dayjs(Date.now()).format("YYYY-MM-DD_HH-mm-ss") + ".json"), JSON.stringify(nicknames));
        break;
      case "text":
        fs.writeFileSync(path.join(args.output, dayjs(Date.now()).format("YYYY-MM-DD_HH-mm-ss") + ".txt"), nicknames.toString().replace(/,/g, "\n"));
        break;
    }
  };

  const checkBeginningOfNickname = (start, alphabet) => {
    const regex = new RegExp("[" + alphabet + "]");
    let name = "";
    for (let i = 0; i < start.length; i++) if (start[i].match(regex)) name += start[i];
    return name;
  };

  const initializeLengths = (min, max, count) => {
    const lengths = {};
    let maxCount = count;
    for (let difference = max - min + 1; min <= max - 1; min++) {
      lengths[min] = Math.round(count / difference);
      maxCount -= Math.round(count / difference);
    }
    if (maxCount != 0) lengths[max] = maxCount;
    return lengths;
  };

  start(args);
};
