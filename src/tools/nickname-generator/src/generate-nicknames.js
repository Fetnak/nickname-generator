import fs from "fs";
import path from "path";
import sizeof from "object-sizeof";
import { log } from "../../../functions/log.js";
import { random } from "../../../functions/random.js";
import Cache from "./classes/cache.js"

export const generateNicknames = (preNicknames, foldersPath, modelInfo, args, lengths) => {
  let nicknames = {};
  let pointers = {};
  let weights = {
    info: [],
  };
	let cache = new Cache(args, modelInfo);

  if (!args.generateAttempts) {
    if (args.endSuddenly) args.generateAttempts = args.minimum + args.maxAccuracy - 1;
    else args.generateAttempts = args.minimum * args.maxAccuracy;
  }
  if (!args.progressAccuracy) args.progressAccuracy = Math.max(args.count.toString().length - 2, 0);

  const pushNickname = (nickname, indexDelete) => {
    nicknames[firstCharCapital(nickname)] = 0;
    if (lengths[nickname.length]-- === 1) delete lengths[nickname.length];
    deletePreNickname(preNicknames, indexDelete);
    return indexDelete;
  };

  let preNicknameToFind = preNicknames[0];
  let previousProgress = -1;
  let currentProgress = -1;
  let dropCounter = 0;
  let nicknamesCount = 0;

  cache.loadWeights(preNicknameToFind);
  while (args.deleteDuplicates ? preNicknames.length > 0 : nicknamesCount < args.count) {
    for (let i = preNicknames.length, tempNickname; i--; ) {
      cache.addCharacterIfAvailable(preNicknames[i]);
      if (preNicknames[i].name.slice(-modelInfo.dummy.length) == modelInfo.dummy) {
        tempNickname = preNicknames[i].name.substring(0, preNicknames[i].name.length - modelInfo.dummy.length);
        if (lengths[tempNickname.length] > 0) i = pushNickname(tempNickname, i);
        else deletePreNickname(preNicknames, i);
      } else if (args.endSuddenly) {
        if (preNicknames[i].name.length >= args.minimum && preNicknames[i].name.length <= args.maximum) {
          if (lengths[preNicknames[i].name.length] > 0) {
            i = pushNickname(preNicknames[i].name, i);
          }
        }
      } else if (preNicknames[i].name.length > args.maximum) {
        deletePreNickname(preNicknames, i);
      }
    }

    if (!args.deleteDuplicates) {
      nicknamesCount = Object.values(nicknames).length;
      addBlankNicknames(args.count * args.counterMultiplier - (preNicknames.length + nicknamesCount), args, preNicknames);
    }

    cache.deleteOldestWeights();

    currentProgress = getProgress(args.deleteDuplicates ? args.count - preNicknames.length : nicknamesCount, args.count, args.progressAccuracy);
    if (currentProgress <= previousProgress) {
      if (preNicknames.length > 0) cache.loadWeights(preNicknameToFind = choosePreNickname(preNicknames, preNicknameToFind));
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
      console.log(`Nicknames have been created for too long! Generated only ${nicknamesCount} nicknames from ${args.count} planned.`);
      break;
    }
  }
  return Object.keys(nicknames);
};

const getProgress = (current, count, progressAccuracy) => {
  return Math.round((current / count) * Math.pow(10, progressAccuracy + 2)) / Math.pow(10, progressAccuracy);
};

const choosePreNickname = (preNicknames, choosenPreNickname) => {
  const sequenceToFind = choosenPreNickname.sequence;
  const filteredPreNicknames = preNicknames.filter((a) => a.sequence <= sequenceToFind);
  if (filteredPreNicknames.length === 0) return preNicknames.sort((a, b) => b.sequence - a.sequence)[0];
  else return filteredPreNicknames.sort((a, b) => b.sequence - a.sequence)[0];
};


const firstCharCapital = (str) => {
  return str.substring(0, 1).toUpperCase() + str.substring(1, str.length).toLowerCase();
};

const deletePreNickname = (array, index) => {
  let index2 = array.length - 1;
  let temp = array[index];
  array[index] = array[index2];
  array[index2] = temp;
  array.pop();
};

export const addBlankNicknames = (count, args, preNicknames) => {
  for (let i = count; i--; ) addPreNickname(args.beginning, args, preNicknames);
};

const addPreNickname = (name, args, preNicknames) => {
  preNicknames.push({
    name: name,
    sequence: Math.min(random(args.minAccuracy, args.maxAccuracy), name.length),
  });
};
