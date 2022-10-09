import { log } from "../../../functions/log.js";
import firstCharToCapital from "../functions/first-char-to-capital.js";
import PreNickname from "./pre-nickname.js";
import Lengths from "./lengths.js";

export default class Nicknames {
  constructor(args, cache) {
    this.cache = cache;
    this.lengths = new Lengths(args);
    this.preNicknames = [];
    this.preNicknameForLoadWeights;
    this.nicknames = new Set();
    this.preNicknameParam = {
      beginning: args.beginning,
      minimum: args.minimum,
      maximum: args.maximum,
      minAccuracy: args.minAccuracy,
      maxAccuracy: args.maxAccuracy,
      dummy: args.dummy,
    };
    this.param = {
      count: args.count,
      counterMultiplier: args.counterMultiplier,
      generateAttempts: args.generateAttempts,
      progressAccuracy: args.progressAccuracy,
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
        `Nicknames have been created for too long! Generated only ${this.nicknames.size} nicknames from ${this.param.count} planned.`
      );
      return true;
    }
    return false;
  }

  calculateAndWriteProgress() {
    const current = this.param.deleteDuplicates
      ? this.param.count - this.preNicknames.length
      : this.nicknames.size;

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
      ); // 4 is 3 integer numbers of progress(100), 1 is "." between integer and decimal numbers of progress.
      this.progress.counterUntilDrop = 0;
    }
  }

  movePreNicknameToNicknames(preNickname, preNicknameIndex) {
    if (!this.nicknames.has(preNickname.name)) {
      this.nicknames.add(preNickname.name);
      this.lengths.decreaseLength(preNickname.name);
    }
    this.deletePreNickname(preNicknameIndex);
  }

  areNicknamesGenerated() {
    return this.param.deleteDuplicates
      ? this.preNicknames.length > 0
      : this.nicknames.size < this.param.count;
  }

  generateNicknames() {
    this.cache.loadWeights(this.choosePreNicknameForLoadWeights());
    while (this.areNicknamesGenerated()) {
      for (let i = this.preNicknames.length; i--; )
        this.processPreNickname(this.preNicknames[i], i);
      this.calculateAndWriteProgress();
      if (this.needToDrop()) break;

      this.checkPreNicknamesCount();

      this.cache.deleteOldestWeights();
    }
    return Array.from(this.nicknames).map((x) => firstCharToCapital(x));
  }

  processPreNickname(preNickname, index) {
    this.cache.addCharacterIfAvailable(preNickname);
    if (preNickname.isEnded()) {
      preNickname.removeEnding();
      if (this.lengths.isStringFits(preNickname.name))
        this.movePreNicknameToNicknames(preNickname, index);
      else preNickname.reset();
    } else if (this.param.endSuddenly) {
      if (this.isNicknameAlreadyExists(preNickname.name)) {
        if (!preNickname.isLengthFits()) preNickname.reset();
      } else if (this.lengths.isStringFits(preNickname.name))
        this.movePreNicknameToNicknames(preNickname, index);
    }
  }

  isNicknameAlreadyExists(nickname) {
    return this.nicknames[nickname];
  }

  checkPreNicknamesCount() {
    if (!this.param.deleteDuplicates)
      this.addPreNicknames(
        this.param.count * this.param.counterMultiplier -
          (this.preNicknames.length + this.nicknames.size)
      );
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
