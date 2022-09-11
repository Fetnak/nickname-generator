import { random } from "../../../../functions/random.js";

export default class preNickname {
  constructor(args, modelInfo) {
    this.name = args.beginning;
    this.sequence;
    this.param = {
      minAccuracy: args.minAccuracy,
      maxAccuracy: args.maxAccuracy,
      dummy: modelInfo.dummy,
    };
    this.randomizeSequence();
  }

  addCharacters(str) {
    this.name += str;
  }
  isEnded() {
    if (this.name.slice(-this.param.dummy) === this.param.dummy) return true;
    return false;
  }

  withoutDummy() {
    if (this.isEnded())
      return this.name.substring(0, this.name.length - this.param.dummy.length);
    return this.name;
  }

  removeDummy() {
    this.name = this.withoutDummy();
  }

  randomizeSequence() {
    this.sequence = Math.min(
      random(this.param.minAccuracy, this.param.maxAccuracy),
      this.name.length
    );
  }

  decreaseSequence() {
    this.sequence = Math.max(this.param.minAccuracy, this.sequence - 1);
  }

  getStringToWeights() {
    return this.param.dummy + this.name.slice(-this.sequence);
  }
}
