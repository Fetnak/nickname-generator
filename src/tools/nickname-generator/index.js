import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import { generateNicknames, addBlankNicknames } from "./src/generate-nicknames.js";
import { outputArrayAsTable } from "./src/output-array-as-table.js";
import { shuffleArray } from "./src/shuffle-array.js";

export const generateNickname = (args) => {
  const start = (args) => {
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

    args.beginning = checkBeginningOfNickname(args.beginning, modelInfo.alphabet);
    args.minimum = args.beginning.length + args.minimum;
    args.maximum = args.beginning.length + args.maximum;
    args.endedByModel = args.endedByModel && modelInfo.calculatedEndings;
    const maxSequenceLength = fs.readdirSync(foldersPath).filter((name) => name !== "info.json").length - 1;
    args.maxAccuracy = args.maxAccuracy > 0 && args.maxAccuracy < maxSequenceLength ? args.maxAccuracy : maxSequenceLength;
    const preNicknames = [];
    addBlankNicknames(args.count, args.beginning, args, preNicknames);
    const lengths = initializeLengths(args.minimum, args.maximum, args.withoutLengths ? args.count * 4 : args.count);
    let nicknames = generateNicknames(preNicknames, foldersPath, modelInfo, args, lengths);

    if (args.removeDuplicates === "after") nicknames = deleteDuplicates(nicknames);

    switch (args.sort) {
      case "random":
        shuffleArray(nicknames);
        break;
      case "asc":
        nicknames.sort((a, b) => a.localeCompare(b)).sort((a, b) => a.length - b.length);
        break;
      case "desc":
        nicknames.sort((a, b) => b.localeCompare(a)).sort((a, b) => b.length - a.length);
        break;
      case "asc2":
        nicknames.sort((a, b) => a.localeCompare(b));
        break;
      case "desc2":
        nicknames.sort((a, b) => b.localeCompare(a));
        break;
      default:
        break;
    }

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

  const checkBeginningOfNickname = (beginning, alphabet) => {
    const regex = new RegExp("[" + alphabet + "]");
    let name = "";
    for (let i = 0; i < beginning.length; i++) if (beginning[i].match(regex)) name += beginning[i];
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

  const deleteDuplicates = (array) => {
    return array.filter((elem, pos) => array.indexOf(elem) == pos);
  };

  start(args);
};
