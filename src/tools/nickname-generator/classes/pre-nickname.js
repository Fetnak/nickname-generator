import { random } from "../functions/random.js";

export default class PreNickname {
  constructor(param) {
    this.name = param.beginning;
    this.sequence;
    this.param = param;
    /* param keys: beginning, minimum. maximum, minAccuracy, maxAccuracy, dummy */
    this.randomizeSequence();
  }

  addCharacters(str) {
    this.name += str;
  }
  isEnded() {
    if (this.name.slice(-this.param.dummy.length) === this.param.dummy)
      return true;
    return false;
  }

  withoutEnding() {
    if (this.isEnded())
      return this.name.substring(0, this.name.length - this.param.dummy.length);
    return this.name;
  }

  removeEnding() {
    this.name = this.withoutEnding();
  }

  randomizeSequence() {
    this.sequence = Math.min(
      random(this.param.minAccuracy, this.param.maxAccuracy),
      this.withoutEnding().length
    );
  }

  decreaseSequence() {
    this.sequence = Math.max(this.param.minAccuracy, this.sequence - 1);
  }

  getStringToWeights() {
    return this.param.dummy + this.name.slice(-this.sequence);
  }

  isLengthFits() {
    return (
      this.name.length >= this.param.minimum &&
      this.name.length <= this.param.maximum
    );
  }

  firstCharToCapital() {
    return (
      this.name.substring(0, 1).toUpperCase() +
      this.name.substring(1, this.name.length).toLowerCase()
    );
  }

  reset() {
    this.name = this.param.beginning;
    this.randomizeSequence();
  }
}
