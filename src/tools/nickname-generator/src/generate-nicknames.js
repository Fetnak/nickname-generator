import fs from "fs";
import path from "path";
import sizeof from "object-sizeof";
import { log } from "../../../functions/log.js";
import { random } from "../../../functions/random.js";

export const generateNicknames = (preNicknames, foldersPath, modelInfo, args, lengths) => {
  let nicknames = [];
  let pointers = {};
  let weights = {
    info: [],
  };

  const folders = fs.readdirSync(foldersPath).filter((name) => name !== "info.json");
  const padStartNumber = folders[0].length;
  for (let i = 0; i <= modelInfo.maxSequenceLength; i++) pointers[folders[i]] = JSON.parse(fs.readFileSync(path.join(foldersPath, folders[i], "pointers.json")));

  const pushNickname = (nickname, indexDelete) => {
    nicknames.push(firstCharCapital(nickname));
    if (lengths[nickname.length] === 1) delete lengths[nickname.length];
    else lengths[nickname.length]--;
    deleteElementFromArray(preNicknames, indexDelete--);
    return indexDelete;
  };

  let preNicknameToFind = preNicknames[0];
  let previousProgress = 0;
  let currentProgress;
  let dropCounter = 0;
  console.log(lengths);
  while (Object.keys(lengths).length !== 0) {
    loadWeights(weights, pointers, padStartNumber, foldersPath, modelInfo, preNicknameToFind);

    for (let i = 0, tempNickname; i < preNicknames.length; i++) {
      addCharacterIfAvailable(preNicknames[i], weights, modelInfo);
      if (preNicknames[i].name.slice(-1) == modelInfo.dummy) {
        tempNickname = preNicknames[i].name.substring(0, preNicknames[i].name.length - modelInfo.dummy.length);
        if (lengths[tempNickname.length] > 0 && !isDuplicate(firstCharCapital(tempNickname), nicknames)) {
          i = pushNickname(tempNickname, i);
        } else {
          deleteElementFromArray(preNicknames, i);
          addBlankNicknames(1, args.start, modelInfo, preNicknames);
        }
        continue;
      } else if (preNicknames[i].name.length > args.maximum) {
        deleteElementFromArray(preNicknames, i);
        addBlankNicknames(1, args.start, modelInfo, preNicknames);
        continue;
      } else if (!args.endedByModel) {
        if (preNicknames[i].name.length >= args.minimum && preNicknames[i].name.length <= args.maximum) {
          if (lengths[preNicknames[i].name.length] > 0 && !isDuplicate(firstCharCapital(preNicknames[i].name), nicknames)) {
            i = pushNickname(preNicknames[i].name, i);
          }
        }
      }
    }

    preNicknameToFind = choosePreNickname(preNicknames, preNicknameToFind);

    deleteOldestWeights(weights, args.cacheSize);

    currentProgress = getProgress(nicknames, args.count);
    if (currentProgress === previousProgress) dropCounter++;
    else dropCounter = 0;
    if (currentProgress > previousProgress) log(`Progress ${(previousProgress = currentProgress)}%.`);

    if (dropCounter >= args.generateAttempts) {
      console.log(`Nicknames have been created for too long! Generated ${nicknames.length} nicknames.`);
      break;
    }
  }
  return nicknames;
};

const getProgress = (nicknames, count) => {
  return Math.round((nicknames.length / count) * 10000) / 100;
};

const choosePreNickname = (preNicknames, choosenPreNickname) => {
  const sequenceToFind = choosenPreNickname.sequence;
  const filteredPreNicknames = preNicknames.filter((a) => a.sequence <= sequenceToFind);
  if (filteredPreNicknames.length === 0) return preNicknames.sort((a, b) => b.sequence - a.sequence)[0];
  else return filteredPreNicknames.sort((a, b) => b.sequence - a.sequence)[0];
};

const loadWeights = (weights, pointers, padStartNumber, foldersPath, modelInfo, preNickname) => {
  if (checkIfWeightsAdded(weights, preNickname, modelInfo)) return;

  const strToFind = modelInfo.dummy + preNickname.name.slice(-preNickname.sequence);
  const paddedSequence = preNickname.sequence.toString().padStart(padStartNumber, "0");
  const pointersForSequence = pointers[paddedSequence];
  const sequenceWeightsPath = path.join(foldersPath, paddedSequence);
  const weigthsFileNames = fs.readdirSync(sequenceWeightsPath).filter((name) => name !== "pointers.json");

  if (!weights[preNickname.sequence]) weights[preNickname.sequence] = {};

  for (let i = 0; i < pointersForSequence.length - 1; i++) {
    if (strToFind.localeCompare(pointersForSequence[i]) >= 0 && strToFind.localeCompare(pointersForSequence[i + 1]) === -1) {
      const tempWeight = JSON.parse(fs.readFileSync(path.join(sequenceWeightsPath, weigthsFileNames[i])));
      weights[preNickname.sequence][pointersForSequence[i]] = tempWeight;
      weights.info.push({
        sequence: preNickname.sequence,
        from: pointersForSequence[i],
        to: pointersForSequence[i + 1],
        lastUsed: Date.now(),
        size: sizeof(tempWeight),
      });
      break;
    }
  }
};

const checkIfWeightsAdded = (weights, preNickname, modelInfo) => {
  const strToFind = modelInfo.dummy + preNickname.name.slice(-preNickname.sequence);
  for (let i = 0; i < weights.info.length; i++) {
    if (strToFind.localeCompare(weights.info[i].from) >= 0 && strToFind.localeCompare(weights.info[i].to) === -1 && strToFind.length === weights.info[i].from.length) return true;
  }
  return false;
};

const addCharacterIfAvailable = (preNickname, weights, modelInfo) => {
  const strToCompare = modelInfo.dummy + preNickname.name.slice(-preNickname.sequence);
  for (let i = 0; i < weights.info.length; i++)
    if (strToCompare.localeCompare(weights.info[i].from) >= 0 && strToCompare.localeCompare(weights.info[i].to) === -1 && strToCompare.length === weights.info[i].from.length) {
      const foundedWeights = weights[preNickname.sequence][weights.info[i].from][strToCompare];
      const foundedWeightsInfo = weights.info[i];
      if (foundedWeights !== undefined) addAvailableCharacter(preNickname, foundedWeights, foundedWeightsInfo, modelInfo);
      else preNickname.sequence = preNickname.sequence - 1;
      break;
    }
};

const addAvailableCharacter = (preNickname, weights, weightsInfo, modelInfo) => {
  let weightsCounter = 0;
  const words = Object.keys(weights);
  for (let i = words.length; i--; ) weightsCounter += weights[words[i]];

  const randomNumber = random(1, weightsCounter);
  weightsCounter = 0;

  let nextChar;
  for (let i = words.length; i--; ) {
    if (randomNumber > weightsCounter && randomNumber <= weightsCounter + weights[words[i]]) {
      nextChar = words[i];
      break;
    }
    weightsCounter += weights[words[i]];
  }
  preNickname.name += nextChar;
  preNickname.sequence = Math.min(random(1, modelInfo.maxSequenceLength), preNickname.name.length);
  weightsInfo.lastUsed = Date.now();
};

const firstCharCapital = (str) => {
  return str.substring(0, 1).toUpperCase() + str.substring(1, str.length).toLowerCase();
};

const deleteOldestWeights = (weights, cacheSize) => {
  const deleteSmth = (oldestWeight) => {
    delete weights[oldestWeight.sequence][oldestWeight.from];
    weights.info.splice(oldestWeight.index, 1);
  };

  let computedWeight = 0;
  weights.info.forEach((info) => (computedWeight += info.size));
  while (computedWeight > cacheSize) {
    let oldestWeight = weights.info[0];
    oldestWeight.index = 0;
    for (let i = 1; i < weights.info.length; i++) {
      if (oldestWeight.lastUsed > weights.info[i].lastUsed) {
        oldestWeight = weights.info[i];
        oldestWeight.index = i;
      }
    }
    deleteSmth(oldestWeight);
    computedWeight = 0;
    weights.info.forEach((info) => (computedWeight += info.size));
    global.gc();
  }
};

const deleteElementFromArray = (array, index) => {
  array.splice(index, 1);
};

export const addBlankNicknames = (count, start, modelInfo, donePreNicknames) => {
  let preNicknames = donePreNicknames || [];
  for (let i = count; i--; )
    preNicknames.push({
      name: start,
      sequence: Math.min(random(1, modelInfo.maxSequenceLength), start.length),
    });
  return preNicknames;
};

const isDuplicate = (target, array) => {
  if (array.filter((a) => a === target).length === 0) return false;
  return true;
};
