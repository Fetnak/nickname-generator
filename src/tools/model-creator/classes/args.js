import path from "path";
import * as uuid from "uuid";

export default class Args {
  constructor(args) {
    this.inputUuid = this.checkInputUuid(args.inputUuid);
    this.outputUuid = this.checkOutputUuid(args.outputUuid);
    this.input = path.join(args.input, "words-" + args.inputUuid);
    this.output = path.join(args.output, "model-" + this.outputUuid);
    this.dummy = "_";
    this.sequence = Math.max(1, args.sequence);
    this.sizeLimit = Math.max(1, args.sizeLimit) * 1024 * 1024;
    this.tempSizeLimit = Math.max(1, args.tempSizeLimit) * 1024 * 1024;
    this.fullSizeLimit = Math.max(1, args.fullSizeLimit) * 1024 * 1024;
    this.checkStep = Math.max(1, args.checkStep);
    this.lengthOfWord = Math.max(1, args.lengthOfWord);
    this.calculateEnding = args.calculateEnding;
    this.resetMultiplier = args.resetMultiplier;
  }

  checkInputUuid(inputUuid) {
    if (uuid.validate(inputUuid)) return inputUuid;
    else {
      console.log("Wrong --inputUuid option");
      process.exit();
    }
  }
  checkOutputUuid(outputUuid) {
    return uuid.validate(outputUuid) ? outputUuid : uuid.v4();
  }
}
