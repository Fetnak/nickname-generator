import fs from "fs";
import path from "path";
import sizeof from "../../../functions/sizeof.js";

export default class Cache {
  constructor(args) {
    this.weights = {};
    this.info = {};
    this.pointers = {};
    this.chancesCache = {};
    this.size = 0;
		this.random = args.random;
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

    const randomNumber = this.random(1, chancesCache.sum);

    let counter = 0,
      nextChar;
    for (let i = chars.length; i--; ) {
      if (
        randomNumber > counter &&
        randomNumber <= counter + chances[chars[i]]
      ) {
        nextChar = chars[i];
        break;
      } else counter += chances[chars[i]];
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
            if (
              !Object.values(foundedWeightsPart[foundedWeightsPartArray[i]])
                .length
            )
              delete foundedWeightsPart[foundedWeightsPartArray[i]];
          }
        }
        this.addChances(
          foundedWeightsPart,
          preNickname.sequence,
          pointersForSequence[i],
          pointersForSequence[i + 1]
        );
        break;
      }
    }
  }

  addChances(chances, sequence, from, to) {
    this.weights[sequence][from] = chances;

    if (!this.info[sequence]) this.info[sequence] = [];

    this.info[sequence].push({
      from,
      to,
      lastUsed: Date.now(),
    });
    this.size += sizeof(chances);
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
    let oldestWeights = [];
    while (this.size > this.param.cacheSize) {
      if (oldestWeights.length === 0) oldestWeights = this.getOldestWeights();
      this.deleteWeight(oldestWeights[oldestWeights.length - 1]);
      oldestWeights.pop();
    }
  }

  deleteWeight(weightInfo) {
    this.size -= sizeof(this.weights[weightInfo.sequence][weightInfo.from]);
    delete this.weights[weightInfo.sequence][weightInfo.from];
    if (this.chancesCache[weightInfo.sequence])
      delete this.chancesCache[weightInfo.sequence][weightInfo.from];
    this.info[weightInfo.sequence].splice(weightInfo.index, 1);
  }

  getOldestWeights() {
    let lastUsed = Date.now();
    const oldestWeights = [];

    for (const key in this.info)
      for (let i = 0; i < this.info[key].length; i++)
        if (lastUsed > this.info[key][i].lastUsed) {
          oldestWeights.push({ ...this.info[key][i], index: i, sequence: key });
          lastUsed = oldestWeights[oldestWeights.length - 1].lastUsed;
        }

    return oldestWeights;
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
