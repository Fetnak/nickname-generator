export default class Lengths {
  constructor(args) {
    this.data = {};
    this.param = {
      minimum: args.minimum,
      maximum: args.maximum,
      count: args.count,
      lengthsMultiplier:
        args.lengthsMultiplier === 0
          ? args.maximum - args.minimum + 1
          : args.lengthsMultiplier,
    };

    this.initializeLengths();
  }

  initializeLengths() {
    let count = this.param.count * this.param.lengthsMultiplier;
    for (let i = this.param.minimum, temp; i <= this.param.maximum; i++) {
      temp = Math.round(count / (this.param.maximum - i + 1));
      this.data[i] = temp;
      count -= temp;
    }
    this.checkLengths();
  }

  checkLengths() {
    for (const key in this.data) if (this.data[key] <= 0) delete this.data[key];
  }

  isStringFits(str) {
    if (this.data[str.length]) return true;
    return false;
  }

  isStringStillUsable(str) {
    if (str.length < Object.keys(this.data)[0]) return true;
    return false;
  }

  decreaseLength(str) {
    if (this.data[str.length] === 1) delete this.data[str.length];
    else this.data[str.length]--;
  }

  lengthsIsEmpty() {
    return Object.values(this.data).length === 0;
  }
}
