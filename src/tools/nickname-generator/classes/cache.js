import fs from "fs";
import path from "path";
import sizeof from "object-sizeof";
import { random } from "../functions/random.js";

export default class Cache {
  constructor(args) {
    this.weights = {};
    this.info = {};
    this.pointers = {};
    this.size = 0;
    this.param = {
      modelPath: args.modelPath,
      maxAccuracy: args.maxAccuracy,
      dummy: args.dummy,
      padStartCount: undefined,
      endSuddenly: args.endSuddenly,
      cacheSize: args.cacheSize,
    };

    this.getPointersAndPadStartCount();
  }

  addCharacterIfAvailable(preNickname) {
    const strToCompare = preNickname.getStringToWeights();
    if (!this.info[preNickname.sequence]) return;
    for (let i = 0, info; i < this.info[preNickname.sequence].length; i++) {
      info = this.info[preNickname.sequence][i];
      if (
        strToCompare.localeCompare(info.from) >= 0 &&
        strToCompare.localeCompare(info.to) === -1
      ) {
        const foundedWeights =
          this.weights[preNickname.sequence][info.from][strToCompare];
        const foundedWeightsInfo = info;
        if (foundedWeights !== undefined)
          this.addAvailableCharacter(
            preNickname,
            foundedWeights,
            foundedWeightsInfo
          );
        else preNickname.decreaseSequence();
        break;
      }
    }
  }

  addAvailableCharacter(preNickname, chances, chancesInfo) {
    const chars = Object.keys(chances);
		if (chars.length === 0) return preNickname.randomizeSequence();
    let weightsCounter = Object.values(chances).reduce((acc, val) => acc + val);

    const randomNumber = random(1, weightsCounter);

    weightsCounter = 0;
    let nextChar;
    for (let i = chars.length; i--; ) {
      if (
        randomNumber > weightsCounter &&
        randomNumber <= weightsCounter + chances[chars[i]]
      ) {
        nextChar = chars[i];
        break;
      }
      weightsCounter += chances[chars[i]];
    }
    preNickname.addCharacters(nextChar);
    preNickname.randomizeSequence();
    chancesInfo.lastUsed = Date.now();
  }

  loadWeights(preNickname) {
    const strToFind = preNickname.getStringToWeights();

    if (this.checkIfWeightsAdded(strToFind)) return;

    const paddedSequence = preNickname.sequence
      .toString()
      .padStart(this.param.padStartCount, "0");
    const pointersForSequence = this.pointers[paddedSequence];
    const sequenceWeightsPartsPath = path.join(
      this.param.modelPath,
      paddedSequence
    );
    const weigthsPartsFileNames = fs
      .readdirSync(sequenceWeightsPartsPath)
      .filter((name) => name !== "pointers.json");

    if (!this.weights[preNickname.sequence])
      this.weights[preNickname.sequence] = {};

    for (let i = 0; i < pointersForSequence.length - 1; i++) {
      if (
        strToFind.localeCompare(pointersForSequence[i]) >= 0 &&
        strToFind.localeCompare(pointersForSequence[i + 1]) === -1
      ) {
        const foundedWeightsPart = JSON.parse(
          fs.readFileSync(
            path.join(sequenceWeightsPartsPath, weigthsPartsFileNames[i])
          )
        );
        if (this.param.endSuddenly) {
          let foundedWeightsPartArray = Object.keys(foundedWeightsPart);
          for (let i = 0; i < foundedWeightsPartArray.length; i++) {
            delete foundedWeightsPart[foundedWeightsPartArray[i]][
              this.param.dummy
            ];
          }
        }
        this.weights[preNickname.sequence][pointersForSequence[i]] =
          foundedWeightsPart;

        if (!this.info[preNickname.sequence]) this.info[preNickname.sequence] = [];

        this.info[preNickname.sequence].push({
          from: pointersForSequence[i],
          to: pointersForSequence[i + 1],
          lastUsed: Date.now(),
        });
        this.size += sizeof(foundedWeightsPart);
        break;
      }
    }
  }

  checkIfWeightsAdded(strToFind) {
    const infoForSequence = this.info[strToFind.length - 1];
    if (!infoForSequence) return false;
    for (let i = 0; i < infoForSequence.length; i++) {
      if (
        strToFind.localeCompare(infoForSequence[i].from) >= 0 &&
        strToFind.localeCompare(infoForSequence[i].to) === -1
      )
        return true;
    }
    return false;
  }

  deleteOldestWeights() {
    if (this.size < this.param.cacheSize) return;

    while (this.size > this.param.cacheSize) {
      let oldestWeights = { lastUsed: Date.now() };

      for (const key in this.info)
        for (let i = 0; i < this.info[key].length; i++)
          if (oldestWeights.lastUsed > this.info[key][i].lastUsed) {
            oldestWeights = this.info[key][i];
            oldestWeights.index = i;
            oldestWeights.sequence = key;
          }

      this.size -= sizeof(
        this.weights[oldestWeights.sequence][oldestWeights.from]
      );
      this.info[oldestWeights.sequence].splice(oldestWeights.index, 1);
      delete this.weights[oldestWeights.sequence][oldestWeights.from];
      global.gc();
    }
  }

  getPointersAndPadStartCount() {
    const sequenceFolders = fs
      .readdirSync(this.param.modelPath)
      .filter((name) => name !== "info.json");
    for (let i = 0; i <= this.param.maxAccuracy; i++)
      this.pointers[sequenceFolders[i]] = JSON.parse(
        fs.readFileSync(
          path.join(this.param.modelPath, sequenceFolders[i], "pointers.json")
        )
      );

    this.param.padStartCount = sequenceFolders[0].length;
  }
}
