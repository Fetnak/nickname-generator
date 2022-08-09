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
  for (let i = 0; i <= args.maxAccuracy; i++) pointers[folders[i]] = JSON.parse(fs.readFileSync(path.join(foldersPath, folders[i], "pointers.json")));

  const pushNickname = (nickname, indexDelete) => {
    nicknames.push(firstCharCapital(nickname));
    if (lengths[nickname.length] === 1) delete lengths[nickname.length];
    else lengths[nickname.length]--;
    deleteElementFromArray(preNicknames, indexDelete--);
    return indexDelete;
  };

  let preNicknameToFind = preNicknames[0];
  let previousProgress = 0;
  let currentProgress = 0;
  let dropCounter = 0;

  loadWeights(weights, pointers, padStartNumber, foldersPath, modelInfo, preNicknameToFind);
  while (Object.keys(lengths).length !== 0 && nicknames.length < args.count) {
    for (let i = 0, tempNickname; i < preNicknames.length; i++) {
      addCharacterIfAvailable(preNicknames[i], weights, modelInfo, args);
      if (preNicknames[i].name.slice(-1) == modelInfo.dummy) {
        tempNickname = preNicknames[i].name.substring(0, preNicknames[i].name.length - modelInfo.dummy.length);
        if (lengths[tempNickname.length] > 0 && (args.removeDuplicates == "during" ? !isDuplicate(firstCharCapital(tempNickname), nicknames) : true)) i = pushNickname(tempNickname, i);
        else deleteElementFromArray(preNicknames, i);
      } else if (preNicknames[i].name.length > args.maximum) {
        deleteElementFromArray(preNicknames, i);
      } else if (!args.endByModel) {
        if (preNicknames[i].name.length >= args.minimum && preNicknames[i].name.length <= args.maximum) {
          if (lengths[preNicknames[i].name.length] > 0 && (args.removeDuplicates == "during" ? !isDuplicate(firstCharCapital(preNicknames[i].name), nicknames) : true)) {
            i = pushNickname(preNicknames[i].name, i);
          }
        }
      }
      addBlankNicknames(args.count - (preNicknames.length + nicknames.length), args.beginning, args, preNicknames);
    }

    deleteOldestWeights(weights, args.cacheSize);

    currentProgress = getProgress(nicknames, args.count, args.progressAccuracy);
    if (currentProgress <= previousProgress) {
      preNicknameToFind = choosePreNickname(preNicknames, preNicknameToFind);
      loadWeights(weights, pointers, padStartNumber, foldersPath, modelInfo, preNicknameToFind);
      dropCounter++;
    } else dropCounter = 0;
    if (currentProgress > previousProgress)
      log(
        `Progress ${(previousProgress = currentProgress)
          .toFixed(args.progressAccuracy)
          .toString()
          .padStart(4 + args.progressAccuracy, " ")}%.`
      ); // 5 is 3 integer numbers of progress, 1 is "." between integer and decimal numbers of progress.

    if (dropCounter >= args.generateAttempts) {
      console.log(`Nicknames have been created for too long! Generated only ${nicknames.length} nicknames from ${args.count} planned.`);
      break;
    }
  }
  return nicknames;
};

const getProgress = (nicknames, count, progressAccuracy) => {
  return Math.round((nicknames.length / count) * Math.pow(10, progressAccuracy + 2)) / Math.pow(10, progressAccuracy);
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

const addCharacterIfAvailable = (preNickname, weights, modelInfo, args) => {
  const strToCompare = modelInfo.dummy + preNickname.name.slice(-preNickname.sequence);
  for (let i = 0; i < weights.info.length; i++)
    if (strToCompare.localeCompare(weights.info[i].from) >= 0 && strToCompare.localeCompare(weights.info[i].to) === -1 && strToCompare.length === weights.info[i].from.length) {
      const foundedWeights = weights[preNickname.sequence][weights.info[i].from][strToCompare];
      const foundedWeightsInfo = weights.info[i];
      if (foundedWeights !== undefined) addAvailableCharacter(preNickname, foundedWeights, foundedWeightsInfo, args);
      else preNickname.sequence = Math.max(args.minAccuracy, preNickname.sequence - 1);
      break;
    }
};

const addAvailableCharacter = (preNickname, weights, weightsInfo, args) => {
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
  preNickname.sequence = Math.min(random(args.minAccuracy, args.maxAccuracy), preNickname.name.length);
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

export const addBlankNicknames = (count, beginning, args, preNicknames) => {
  for (let i = count; i--; )
    preNicknames.push({
      name: beginning,
      sequence: Math.min(random(args.minAccuracy, args.maxAccuracy), beginning.length),
    });
};

const isDuplicate = (target, array) => {
  if (array.includes(target)) return false;
  return true;
};
