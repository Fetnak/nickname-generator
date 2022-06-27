import fs from "fs";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

const generateUUIDs = (args) => {
  const start = (args) => {
    args.count = Math.max(1, args.count);
    const UUIDs = generate(args.count);

    if (args.form === "console") {
      UUIDs.forEach((uuid) => console.log(uuid));
    } else {
      if (args.output === "./resources/UUIDs/<filename>") {
        fs.promises.mkdir(args.output.replace("/<filename>", ""), { recursive: true }).catch(console.error);
        args.output = args.output.replace("<filename>", currentDateTime());
      }
      //args.output += args.form === "json" ? ".json" : ".txt";
      if (args.form === "json") {
        console.log("penis");
        fs.writeFileSync(args.output, JSON.stringify(UUIDs));
        console.log("penised");
      } else {
        fs.writeFileSync(args.output, UUIDs.toString().replace(/,/g, "\n"));
      }
    }
  };

  const generate = (count) => {
    let uuids = [];
    for (let i = count + 1; i--; ) {
      uuids.push(uuidv4());
    }
    return uuids;
  };

  const currentDateTime = () => {
    return dayjs(Date.now()).format("YYYY-MM-DD_HH-mm-ss");
  };

  start(args);
};

export default { generateUUIDs };
