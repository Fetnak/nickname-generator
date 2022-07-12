import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import sizeof from "object-sizeof";
import { log } from "../../functions/log.js";

export const generateNickname = (args) => {
  const start = (args) => {
    log("Start.");
    const foldersPath = path.join(args.input, "model-" + args.uuid);
    switch (args.form) {
      case "json":
        fs.writeFileSync(path.join(args.output, dayjs(Date.now()).format("YYYY-MM-DD_HH-mm-ss") + ".json"), "");
        break;
      case "text":
        fs.writeFileSync(path.join(args.output, dayjs(Date.now()).format("YYYY-MM-DD_HH-mm-ss") + ".txt"), "");
        break;
    }

    const modelInfo = JSON.parse(fs.readFileSync(path.join(foldersPath, "info.json")));

    args.start = checkStart(args.start, modelInfo.alphabet);
    //args.minimum = Math.max(args.minimum, args.start.length + 1);
    args.minimum = args.start.length + args.minimum;
    args.maximum = args.start.length + args.maximum;

    console.log(modelInfo);
    const maxSequenceLength = fs.readdirSync(foldersPath).filter((name) => name !== "info.json").length - 1;
    modelInfo.maxSequenceLength = args.accuracy > 0 && args.accuracy < maxSequenceLength ? args.accuracy : maxSequenceLength;
    const preNicknames = initializeArray(args.minimum, args.maximum, args.count, args.start, modelInfo);
    const nicknames = generateNicknames(preNicknames, foldersPath, modelInfo, args);

    shuffleArray(nicknames);

    switch (args.form) {
      case "console":
        outputArrayAsTable(nicknames, args.columns);
        break;
      case "json":
        fs.writeFileSync(path.join(args.output, dayjs(Date.now()).format("YYYY-MM-DD_HH-mm-ss") + ".json"), JSON.stringify(nicknames));
        break;
      case "text":
        fs.writeFileSync(path.join(args.output, dayjs(Date.now()).format("YYYY-MM-DD_HH-mm-ss") + ".txt"), nicknames.toString().replace(/,/g, "\n"));
        break;
    }
  };

  const checkStart = (start, alphabet) => {
    const regex = new RegExp("[" + alphabet + "]");
    let name = "";
    for (let i = 0; i < start.length; i++) if (start[i].match(regex)) name += start[i];
    return name;
  };

  const initializeArray = (min, max, count, start, modelInfo) => {
    let preNicknames = [];
    for (let i = count; i--; )
      preNicknames.push({
        name: start,
        sequence: Math.min(random(1, modelInfo.maxSequenceLength), start.length),
        width: random(min, max),
      });
    return preNicknames;
  };

  const generateNicknames = (preNicknames, foldersPath, modelInfo, args) => {
    let nicknames = [];
    let pointers = {};
    let weights = {
      info: [],
    };
    const folders = fs.readdirSync(foldersPath).filter((name) => name !== "info.json");
    const padStartNumber = folders[0].length;
    for (let i = 0; i <= modelInfo.maxSequenceLength; i++) pointers[folders[i]] = JSON.parse(fs.readFileSync(path.join(foldersPath, folders[i], "pointers.json")));
    let preNicknameToFind = preNicknames[0];
    while (preNicknames.length > 0) {
      log(`Progress ${getProgress(nicknames, preNicknames)}%`);

      preNicknameToFind = choosePreNickname(preNicknames, preNicknameToFind);

      loadWeights(weights, pointers, padStartNumber, foldersPath, modelInfo, preNicknameToFind);

      for (let i = 0; i < preNicknames.length; i++) {
        addCharacterIfAvailable(preNicknames[i], weights, modelInfo);
        if (preNicknames[i].name.length == preNicknames[i].width) {
          nicknames.push(preNicknames[i].name);
          deleteElementFromArray(preNicknames, i);
          i--;
        }
      }

      deleteOldestWeights(weights, args.cacheSize);
    }
    return nicknames;
  };

  const getProgress = (nicknames, preNicknames) => {
    let progress = 0;
    preNicknames.forEach((nickname) => {
      progress += nickname.name.length / nickname.width;
    });
    progress += nicknames.length;
    return Math.round((progress / (preNicknames.length + nicknames.length)) * 10000) / 100;
  };

  const choosePreNickname = (preNicknames, choosenPreNickname) => {
    const sequenceToFind = choosenPreNickname.sequence;
    const filteredPreNicknames = preNicknames.filter((a) => a.sequence <= sequenceToFind);
    if (filteredPreNicknames.length === 0) return preNicknames.sort((a, b) => b.sequence - a.sequence)[0];
    else return filteredPreNicknames.sort((a, b) => b.sequence - a.sequence)[0];
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

  const loadWeights = (weights, pointers, padStartNumber, foldersPath, modelInfo, preNickname) => {
    if (checkIfWeightsAdded(weights, preNickname, modelInfo)) return;

    const strToFind = modelInfo.dummy + preNickname.name.slice(-preNickname.sequence);
    const paddedSequence = preNickname.sequence.toString().padStart(padStartNumber, "0");
    const pointersForSequence = pointers[paddedSequence];
    const sequenceWeightsPath = path.join(foldersPath, paddedSequence);
    const weigthsFileNames = fs.readdirSync(sequenceWeightsPath).filter((name) => name !== "pointers.json");

    if (!weights[preNickname.sequence]) weights[preNickname.sequence] = {};

    for (let i = 0; i < pointersForSequence.length - 1; i++)
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
  };

  const checkIfWeightsAdded = (weights, preNickname, modelInfo) => {
    const strToFind = modelInfo.dummy + preNickname.name.slice(-preNickname.sequence);
    for (let i = 0; i < weights.info.length; i++) {
      if (strToFind.localeCompare(weights.info[i].from) >= 0 && strToFind.localeCompare(weights.info[i].to) === -1 && strToFind.length === weights.info[i].from.length) return true;
    }
    return false;
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

  const outputArrayAsTable = (array, columns) => {
    let string = "";
    let padding = args.maximum + 2;
    let columnCount = columns + 1;
    for (let i = 0, n = Math.ceil(array.length / columnCount); i <= n; i++) {
      for (let j = 0, word; j < columns; j++) {
        word = array[j + i * columns];
        if (word) string += word.padEnd(padding);
      }
      console.log(string);
      string = "";
    }
  };

  const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const shuffleArray = (array) => {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
  };

  start(args);
};
