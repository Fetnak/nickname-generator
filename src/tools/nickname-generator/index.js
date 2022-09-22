import Args from "./src/classes/args.js";
import Cache from "./src/classes/cache.js";
import Nicknames from "./src/classes/nicknames.js";
import Output from "./src/classes/output.js";

export const generateNickname = (args) => {
  const start = (args) => {
    const checkedArgs = new Args(args);
    checkedArgs.outputArgs();
    const cache = new Cache(checkedArgs);
    const output = new Output(checkedArgs);
    output.checkFilePath();
    const nicknames = new Nicknames(checkedArgs, cache).generateNicknames();
    output.sortArray(nicknames);
    output.outputArray(nicknames);
  };

  start(args);
};
