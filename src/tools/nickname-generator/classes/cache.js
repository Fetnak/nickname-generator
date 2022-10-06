import fs from "fs";
import path from "path";
import sizeof from "object-sizeof";
import { random } from "../functions/random.js";

export default class Cache {
  constructor(args) {
    this.weights = {};
    this.info = {};
    this.pointers = {};
    this.chancesCache = {};
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
    if (!this.info[preNickname.sequence]) return;

    const strToCompare = preNickname.getStringToWeights();

    for (let i = 0, info; i < this.info[preNickname.sequence].length; i++) {
      info = this.info[preNickname.sequence][i];
      if (
        strToCompare.localeCompare(info.from) >= 0 &&
        strToCompare.localeCompare(info.to) === -1
      ) {
        const foundedChances =
          this.weights[preNickname.sequence][info.from][strToCompare];
        const foundedChancesInfo = info;
        if (foundedChances) {
          const chancesCache = this.getChancesCache(
            preNickname.sequence,
            info.from,
            strToCompare,
            foundedChances
          );
          this.addAvailableCharacter(
            preNickname,
            foundedChances,
            foundedChancesInfo,
            chancesCache
          );
        } else preNickname.decreaseSequence();
        break;
      }
    }
  }

  addAvailableCharacter(preNickname, chances, chancesInfo, chancesCache) {
    const chars = chancesCache.chars;
    if (chars.length === 0) return preNickname.randomizeSequence();
    let chancesSum = chancesCache.sum;

    const randomNumber = random(1, chancesSum);

    chancesSum = 0;
    let nextChar;
    for (let i = chars.length; i--; ) {
      if (
        randomNumber > chancesSum &&
        randomNumber <= chancesSum + chances[chars[i]]
      ) {
        nextChar = chars[i];
        break;
      } else chancesSum += chances[chars[i]];
    }
    preNickname.addCharacters(nextChar);
    preNickname.randomizeSequence();
    chancesInfo.lastUsed = Date.now();
  }

  getChancesCache(sequence, chancesFrom, chancesString, chances) {
    if (!this.chancesCache[sequence]) this.chancesCache[sequence] = {};

    if (!this.chancesCache[sequence][chancesFrom])
      this.chancesCache[sequence][chancesFrom] = {};

    if (!this.chancesCache[sequence][chancesFrom][chancesString])
      this.chancesCache[sequence][chancesFrom][chancesString] = {
        sum: Object.values(chances).reduce((acc, val) => acc + val),
        chars: Object.keys(chances),
      };

    return this.chancesCache[sequence][chancesFrom][chancesString];
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

        if (!this.info[preNickname.sequence])
          this.info[preNickname.sequence] = [];

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
      delete this.weightsCounter[oldestWeights.sequence][oldestWeights.from];
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
