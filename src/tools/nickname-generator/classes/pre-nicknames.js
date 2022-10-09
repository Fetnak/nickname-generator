import PreNickname from "./pre-nickname.js";

export default class PreNicknames {
  constructor(param, count = 0) {
    this.preNicknames = [];
    this.param = param;
    this.length = 0;
    this.i = 0;
    this.forChances = 0;
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
  getForChances(getNew = false) {
    if (getNew) {
      let sequenceToFind = this.getForChances()
        ? this.getForChances().sequence
        : -1;
      while (sequenceToFind >= 0) {
        for (let i = this.length; i--; )
          if (this.preNicknames[i].sequence === sequenceToFind) {
            this.forChances = i;
            return this.getForChances();
          }
        sequenceToFind--;
      }
      this.forChances = 0;
    }
    return this.preNicknames[this.forChances];
  }
  *[Symbol.iterator]() {
    for (this.i = this.preNicknames.length; this.i--; )
      yield this.preNicknames[this.i];
  }
}
