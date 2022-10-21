import PreNickname from "./pre-nickname.js";

export default class PreNicknames {
  constructor(
    beginning,
    minimum,
    maximum,
    minAccuracy,
    maxAccuracy,
    dummy,
    random,
    count = 0
  ) {
    this.preNicknames = [];
    this.param = {
      beginning,
      minimum,
      maximum,
      minAccuracy,
      maxAccuracy,
      dummy,
      random,
    };
    this.length = 0;
    this.i = 0;
    this.chance = 0;
    this.temp = undefined;

    this.add(count);
  }

  add(count) {
    for (let i = count; i--; )
      this.preNicknames.push(new PreNickname(this.param));
    this.length = this.preNicknames.length;
  }
  delete() {
    this.temp = this.preNicknames[this.i];
    this.preNicknames[this.i] = this.preNicknames[--this.length];
    this.preNicknames[this.length] = this.temp;
    this.preNicknames.pop();
  }
  get() {
    return this.preNicknames[this.i];
  }
  next() {
    if (this.i < 0) this.i = this.length - 1;
    return this.preNicknames[this.i--];
  }
  getForChances() {
    let sequenceToFind = this.forChances() ? this.forChances().sequence : -1;
    while (sequenceToFind >= 0) {
      for (let i = this.length; i--; )
        if (this.preNicknames[i].sequence === sequenceToFind) {
          this.chance = i;
          return this.forChances();
        }
      sequenceToFind--;
    }
    this.chance = 0;
    return this.forChances();
  }
  forChances() {
    return this.preNicknames[this.chance];
  }
  *[Symbol.iterator]() {
    for (this.i = this.preNicknames.length; this.i--; )
      yield this.preNicknames[this.i];
  }
}
