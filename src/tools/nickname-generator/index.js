import Args from "./classes/args.js";
import Cache from "./classes/cache.js";
import Nicknames from "./classes/nicknames.js";
import Output from "./classes/output.js";

export const generateNickname = (args) => {
  const start = (args) => {
    args = new Args(args);
    args.outputArgs();
    const cache = new Cache(args);
    const output = new Output(args);
    output.checkFilePath();
    const nicknames = new Nicknames(args, cache).generateNicknames();
    output.sortArray(nicknames);
    output.outputArray(nicknames);
  };

  start(args);
};
