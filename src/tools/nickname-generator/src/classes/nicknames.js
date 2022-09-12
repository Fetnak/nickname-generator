import fs from "fs";
import path from "path";
import sizeof from "object-sizeof";
import { log } from "../../../../functions/log.js";
import { random } from "../../../../functions/random.js";
import PreNickname from "./pre-nickname.js";
import Cache from "./cache.js";
import Lengths from "./lengths.js";

export default class Nicknames {
  constructor(args, modelInfo) {
    this.cache = new Cache(args, modelInfo);
    this.lengths = new Lengths(args);
    this.preNicknames = [];
    this.preNicknameForLoadWeights;
    this.nicknames = {};
    this.nicknamesCount = 0;
    this.preNicknameParam = {
      beginning: args.beginning,
      minimum: args.minimum,
      maximum: args.maximum,
      minAccuracy: args.minAccuracy,
      maxAccuracy: args.maxAccuracy,
      dummy: modelInfo.dummy,
    };
    this.param = {
      count: args.count,
      counterMultiplier: args.counterMultiplier,
      generateAttempts: args.generateAttempts
        ? args.generateAttempts
        : args.endSuddenly
        ? args.minimum + args.maxAccuracy - 1
        : args.minimum * args.maxAccuracy,
      progressAccuracy: args.progressAccuracy
        ? args.progressAccuracy
        : Math.max(args.count.toString().length - 2, 0),
      deleteDuplicates: args.deleteDuplicates,
      endSuddenly: args.endSuddenly,
    };
    this.progress = {
      previous: -1,
      current: -1,
      counterUntilDrop: 0,
    };

    this.addPreNicknames(args.count * args.counterMultiplier);
  }

  needToDrop() {
    if (this.progress.counterUntilDrop > this.param.generateAttempts) {
      console.log(
        `Nicknames have been created for too long! Generated only ${this.nicknamesCount} nicknames from ${this.param.count} planned.`
      );
      return true;
    }
    return false;
  }

  calculateAndWriteProgress() {
    const current = this.param.deleteDuplicates
      ? this.param.count - this.preNicknames.length
      : this.nicknamesCount;

    this.progress.current =
      Math.round(
        (current / this.param.count) *
          Math.pow(10, this.param.progressAccuracy + 2)
      ) / Math.pow(10, this.param.progressAccuracy);

    if (this.progress.current <= this.progress.previous) {
      if (this.preNicknames.length > 0)
        this.cache.loadWeights(this.choosePreNicknameForLoadWeights());
      this.progress.counterUntilDrop++;
    } else {
      log(
        `Progress ${(this.progress.previous = this.progress.current)
          .toFixed(this.param.progressAccuracy)
          .toString()
          .padStart(4 + this.param.progressAccuracy, " ")}%.`
      ); // 4 is 3 integer numbers of progress, 1 is "." between integer and decimal numbers of progress.
      this.progress.counterUntilDrop = 0;
    }
  }

  movePreNicknameToNicknames(preNickname, preNicknameIndex) {
    const firstCapital = preNickname.firstCharToCapital();
    if (!this.nicknames[firstCapital]) {
      this.nicknames[firstCapital] = 1;
      this.nicknamesCount++;
      this.lengths.decreaseLength(firstCapital);
    }
    this.deletePreNickname(preNicknameIndex);
  }

  areNicknamesGenerated() {
    return this.param.deleteDuplicates
      ? this.preNicknames.length > 0
      : this.nicknamesCount < this.param.count;
  }

  generateNicknames() {
    this.cache.loadWeights(this.choosePreNicknameForLoadWeights());
    while (this.areNicknamesGenerated()) {
      for (let i = this.preNicknames.length; i--; ) {
        this.cache.addCharacterIfAvailable(this.preNicknames[i]);
        if (this.preNicknames[i].isEnded()) {
          this.preNicknames[i].removeEnding();
          if (this.lengths.isStringFits(this.preNicknames[i].name))
            this.movePreNicknameToNicknames(this.preNicknames[i], i);
          else if (!this.lengths.isStringStillUsable(this.preNicknames[i].name))
            this.deletePreNickname(i);
        } else if (this.param.endSuddenly)
          if (this.lengths.isStringFits(this.preNicknames[i].name))
            if (this.preNicknames[i].isLengthFits())
              this.movePreNicknameToNicknames(this.preNicknames[i], i);
            else this.deletePreNickname(i);
      }

      this.calculateAndWriteProgress();
      if (this.needToDrop()) break;

      if (!this.param.deleteDuplicates) {
        this.addPreNicknames(
          this.param.count * this.param.counterMultiplier -
            (this.preNicknames.length + this.nicknamesCount)
        );
      }

      this.cache.deleteOldestWeights();
    }
    return Object.keys(this.nicknames);
  }

  choosePreNicknameForLoadWeights() {
    let sequenceToFind = this.preNicknameForLoadWeights
      ? this.preNicknameForLoadWeights.sequence
      : -1;
    while (sequenceToFind >= 0) {
      this.preNicknames.forEach((item) => {
        if (item.sequence === sequenceToFind)
          return (this.preNicknameForLoadWeights = item);
      });
      sequenceToFind--;
    }
    return (this.preNicknameForLoadWeights = this.preNicknames[0]);
  }

  deletePreNickname(index) {
    let indexLast = this.preNicknames.length - 1;
    let temp = this.preNicknames[index];
    this.preNicknames[index] = this.preNicknames[indexLast];
    this.preNicknames[indexLast] = temp;
    this.preNicknames.pop();
  }

  addPreNicknames(count) {
    for (let i = count; i--; )
      this.preNicknames.push(new PreNickname(this.preNicknameParam));
  }
}
