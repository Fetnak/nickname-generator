import fs from "fs";
import path from "path";
import sizeof from "object-sizeof";
import { log } from "../../../functions/log.js";

let DUMMY, sequence;

export const processAllWordsFromText = (result, modelInfo, wordsData, modelFolder, args, currentFile, filesCount) => {
  DUMMY = modelInfo.dummy;
  sequence = args.sequence;
  const words = Object.keys(wordsData);
  const wl = words.length;
  const forLog = Math.floor(wl / args.checkStep) * args.checkStep;
  for (let i = wl, fullSize; i--; ) {
    processOneWord(words[i], wordsData[words[i]], args.sequence, modelInfo, result);
    if (i % args.checkStep == 0) {
      fullSize = sizeof(result);
      log(`Model from ${Math.abs(i - forLog)}/${wl} words from ${currentFile}/${filesCount} file is ${fullSize} bytes.`);
      checkSizes(args, fullSize, result, modelFolder);
    }
  }
};

const checkSizes = (args, fullSize, obj, modelFolder) => {
  if (fullSize <= args.fullLimit) {
    const counters = Object.keys(obj);
    counters.forEach((counter) => {
      if (sizeof(obj[counter]) > args.tempFileLimit) {
        writeToDrive(obj, counter, modelFolder);
      }
    });
  } else writeToDriveAll(1, obj, modelFolder);
};

let modelFileCounter = {};

export const writeToDriveAll = (from, obj, modelFolder) => {
  const counters = Object.keys(obj);
  for (let i = from; i < counters.length; i++) {
    writeToDrive(obj, counters[i], modelFolder);
  }
};

const writeToDrive = (obj, counter, modelFolder) => {
  fs.promises.mkdir(path.join(modelFolder, counter.toString()), { recursive: true }).catch(console.error);
  if (modelFileCounter[counter] == undefined) {
    modelFileCounter[counter] = 0;
  } else {
    modelFileCounter[counter]++;
  }
  fs.writeFileSync(path.join(modelFolder, counter.toString(), modelFileCounter[counter].toString().padStart(6, "0") + "-data.json"), JSON.stringify(obj[counter]));
  delete obj[counter];
};

const processOneWord = (word, multiplier, sequenceLength, modelInfo, result) => {
  for (let maxSequenceLength = 1, wl = word.length, n = sequenceLength; maxSequenceLength <= n; maxSequenceLength++) {
    if (wl > maxSequenceLength) addCharactersToResult(word, maxSequenceLength, multiplier, modelInfo, result);
  }
};

const addCharactersToResult = (word, maxSequenceLength, multiplier, modelInfo, result) => {
  let obj = addCounterToResult(0, modelInfo, result);
  obj = addSequenceToResult(DUMMY, obj);
  addWeightsToResult(word[0], multiplier, obj);

  maxSequenceLength--;
  for (let i = maxSequenceLength; i < word.length - 1; i++) {
    const sequenceFromWord = DUMMY + word.slice(i - maxSequenceLength, i + 1);
    const letterAfterSequence = word[i + 1];
    const counter = sequenceFromWord.length - DUMMY.length;
    obj = addCounterToResult(counter, modelInfo, result);
    obj = addSequenceToResult(sequenceFromWord, obj);
    addWeightsToResult(letterAfterSequence, multiplier, obj);
  }
};

const addCounterToResult = (counter, modelInfo, result) => {
  const newCounter = counter.toString().padStart(sequence.toString().length, "0");
  if (counter > modelInfo.maxSequenceLength) modelInfo.maxSequenceLength = counter;
  if (!result[newCounter]) result[newCounter] = {};
  return result[newCounter];
};

const addSequenceToResult = (sequence, result) => {
  if (!result[sequence]) result[sequence] = {};
  return result[sequence];
};

const addWeightsToResult = (weights, multiplier, result) => {
  if (result[weights]) result[weights] += multiplier;
  else result[weights] = multiplier;
};
