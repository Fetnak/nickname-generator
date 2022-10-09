import { log } from "../../../functions/log.js";
import firstCharToCapital from "../functions/first-char-to-capital.js";
import PreNicknames from "./pre-nicknames.js";
import Nicknames from "./nicknames.js";
import Lengths from "./lengths.js";

export default class Generator {
  constructor(args, cache) {
    this.cache = cache;
    this.lengths = new Lengths(args);
    this.preNicknameForLoadWeights;
    this.nicknames = new Nicknames();
    this.preNicknames = new PreNicknames(
      {
        beginning: args.beginning,
        minimum: args.minimum,
        maximum: args.maximum,
        minAccuracy: args.minAccuracy,
        maxAccuracy: args.maxAccuracy,
        dummy: args.dummy,
      },
      args.count * args.counterMultiplier
    );
    this.param = {
      count: args.count,
      counterMultiplier: args.counterMultiplier,
      generateAttempts: args.generateAttempts,
      progressAccuracy: args.progressAccuracy,
      endSuddenly: args.endSuddenly,
    };
    this.progress = {
      previous: -1,
      current: -1,
      counterUntilDrop: 0,
    };
  }

  needToDrop() {
    if (this.progress.counterUntilDrop > this.param.generateAttempts) {
      console.log(
        `Nicknames have been created for too long! Generated only ${this.nicknames.length} nicknames from ${this.param.count} planned.`
      );
      return true;
    }
    return false;
  }

  calculateAndWriteProgress() {
    const current = this.nicknames.length;

    this.progress.current =
      Math.round(
        (current / this.param.count) *
          Math.pow(10, this.param.progressAccuracy + 2)
      ) / Math.pow(10, this.param.progressAccuracy);

    if (this.progress.current <= this.progress.previous) {
      if (this.preNicknames.length > 0)
        this.cache.loadWeights(this.preNicknames.getForChances());
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

  movePreNicknameToNicknames(preNickname) {
    if (!this.nicknames.has(preNickname.name)) {
      this.nicknames.add(preNickname.name);
      this.lengths.decreaseLength(preNickname.name);
    }
    this.preNicknames.delete();
  }

  areNicknamesGenerated() {
    return this.nicknames.length < this.param.count;
  }

  generateNicknames() {
    this.cache.loadWeights(this.preNicknames.getForChances());
    while (this.areNicknamesGenerated()) {
      for (const preNickname of this.preNicknames)
        this.processPreNickname(preNickname);
      this.calculateAndWriteProgress();
      if (this.needToDrop()) break;

      this.checkPreNicknamesCount();

      this.cache.deleteOldestWeights();
    }
    return this.nicknames.toArray().map((x) => firstCharToCapital(x));
  }

  processPreNickname(preNickname) {
    this.cache.addCharacterIfAvailable(preNickname);
    if (preNickname.isEnded()) {
      preNickname.removeEnding();
      if (this.lengths.isStringFits(preNickname.name))
        this.movePreNicknameToNicknames(preNickname);
      else preNickname.reset();
    } else if (this.param.endSuddenly) {
      if (this.nicknames.has(preNickname.name)) {
        if (!preNickname.isLengthFits()) preNickname.reset();
      } else if (this.lengths.isStringFits(preNickname.name))
        this.movePreNicknameToNicknames(preNickname);
    }
  }

  checkPreNicknamesCount() {
    this.preNicknames.add(
      this.param.count * this.param.counterMultiplier -
        (this.preNicknames.length + this.nicknames.length)
    );
  }
}
