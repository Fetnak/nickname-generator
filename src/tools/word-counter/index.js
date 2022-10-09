import Args from "./classes/args.js";
import Counter from "./classes/counter.js";
import Cleaner from "./classes/cleaner.js";
import { log } from "../../functions/log.js";

export const countWords = (args) => {
  const start = (args) => {
    const pargs = new Args(args);
    const counter = new Counter(pargs);
    counter.count();
    const cleaner = new Cleaner(
      pargs.output,
      pargs.partsToLoad,
      pargs.sizeLimit
    );
    log("Started clearing files.");
    cleaner.clean();
  };

  start(args);
};
