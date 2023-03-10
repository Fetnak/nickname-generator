export default class PreNickname {
  constructor(param) {
    this.param = param;
    /* param keys: part, partPosition, minimum, maximum, minAccuracy, maxAccuracy, dummy, random() */
    this.reset();
  }

  reset() {
    this.name = this.param.part;
    this.beginLength =
      this.param.partPosition === -1
        ? this.param.random(0, this.param.maximum - this.name.length)
        : Math.round(
            (this.param.maximum - this.name.length) * this.param.partPosition
          );
    this.endLength = this.param.maximum - this.beginLength - this.name.length;
    this.begin = this.beginLength > 0 ? false : true;
    this.end = this.endLength > 0 ? false : true;
		this.positive = true;
    this.positive = this.changePositive();
    this.sequence = this.randomSequence();
  }

  getName() {
    return this.name;
  }

  getSequence() {
    return this.positive ? this.sequence : -this.sequence;
  }

  addCharacter(char) {
    if (char === this.param.dummy) {
      if (this.positive) this.setEnd();
      else this.setBegin();
    } else {
      if (this.positive) this.addEndCharacter(char);
      else this.addBeginCharacter(char);
    }
  }

  addBeginCharacter(char) {
    this.name = char + this.name;
    if (!--this.beginLength) this.setBegin();
  }

  addEndCharacter(char) {
    this.name = this.name + char;
    if (!--this.endLength) this.setEnd();
  }

  isDone() {
    return this.end && this.begin;
  }

  setEnd() {
    this.end = true;
  }

  setBegin() {
    this.begin = true;
  }

  randomSequence() {
    return Math.min(
      this.param.random(this.param.minAccuracy, this.param.maxAccuracy),
      this.name.length
    );
  }

  randomizeSequence() {
    this.positive = this.changePositive();
    this.sequence = this.randomSequence();
  }

  changePositive() {
    if (!this.begin && !this.end) return !this.positive;
    else if (!this.begin && this.end) return false;
    else if (this.begin && !this.end) return true;
  }

  decreaseSequence() {
    if (this.sequence > this.param.minAccuracy) this.sequence--;
  }

  forWeights() {
    return (
      this.param.dummy +
      (this.positive
        ? this.name.slice(-this.sequence)
        : this.name.slice(0, this.sequence))
    );
  }

  isLengthFits() {
    return (
      this.name.length >= this.param.minimum &&
      this.name.length <= this.param.maximum
    );
  }
}
