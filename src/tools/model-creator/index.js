import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import * as uuid from "uuid";
import { clearAndSortResult } from "./functions/clear-and-sort.js";
import { processAllWordsFromText, writeToDriveAll } from "./functions/process-all-words-from-text.js";

export const createModel = (args) => {
  const startExecution = Date.now();
  const preparedUuid = uuid.validate(args.outputUuid) ? args.outputUuid : uuid.v4();
  const wordsFolder = path.join(args.input, "words-" + args.inputUuid);
  const wordsInfo = JSON.parse(fs.readFileSync(path.join(wordsFolder, "info.json")));
  const modelFolder = path.join(args.output, "model-" + preparedUuid);
  fs.promises.mkdir(modelFolder, { recursive: true }).catch(console.error);

  let modelInfo = {
    uuid: preparedUuid,
    uuidWords: wordsInfo.uuid,
    name: wordsInfo.name,
    description: wordsInfo.description,
    createdAt: undefined,
    alphabet: wordsInfo.alphabet,
    maxSequenceLength: 0,
    sourceSize: wordsInfo.sourceSize,
    toWordsProcessingTime: wordsInfo.toWordsProcessingTime,
    toModelProcessingTime: undefined,
    language: wordsInfo.language,
    version: process.env.npm_package_version,
    dummy: "_",
  };

  let modelData = {};

  const start = (args) => {
    const files = fs.readdirSync(wordsFolder).filter((filename) => filename.includes("data.json"));
    for (let i = 0; i < files.length; i++) {
      processAllWordsFromText(modelData, modelInfo, JSON.parse(fs.readFileSync(path.join(wordsFolder, files[i]))), modelFolder, args, i + 1, files.length);
    }

    writeToDriveAll(0, modelData, modelFolder);
    clearAndSortResult(modelFolder, args.fileLimit);

    modelInfo.createdAt = dayjs(Date.now()).format("YYYY-MM-DD HH-mm-ss");
    modelInfo.toModelProcessingTime = (Date.now() - startExecution).toString() + " ms";

    fs.writeFileSync(path.join(modelFolder, "info.json"), JSON.stringify(modelInfo));
    console.log(modelInfo);
  };

  start(args);
};
