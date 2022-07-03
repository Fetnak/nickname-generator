import fs from "fs";
import { log } from "../../functions/log.js";

export const convertXmlToTxt = (args) => {
  const start = (args) => {
    if (!args.output) args.output = args.input + ".txt";
    try {
      let fileCounter = 1;
      fs.writeFileSync(args.output + "." + fileCounter.toString().padStart(5, "0"), "");
      let xmlWriteStream;
      const xmlReadStream = fs.createReadStream(args.input, {
        highWaterMark: args.chunk,
      });
      log("Starting...");

      let chunkCounter = 1;
      let chunksCount = Math.ceil(fs.statSync(args.input).size / args.chunk);
      const fileCount = chunksCount / 15;
      xmlReadStream.on("data", (chunk) => {
        if (chunkCounter % fileCount == 1) {
          log(`Created ${fileCounter} file.`);
          xmlWriteStream = fs.createWriteStream(args.output + "." + fileCounter.toString().padStart(5, "0"));
          fileCounter++;
        }
        log(`Started XML Chunk: ${chunkCounter}/${chunksCount}.`);
        xmlWriteStream.write(removeTags(chunk.toString("utf-8")));
        chunkCounter++;
      });

      xmlReadStream.on("end", () => {
        log("Done!");
      });
    } catch (error) {
      console.log("Unable to create output file or read input file!");
      throw new Error(error);
    }
  };

  start(args);
};

const removeTags = (str) => {
  let result = "";
  let strLength = str.length;
  let cursor1 = 0;
  let cursor2 = 0;
  let temp = "";

  let start = str.indexOf("<");
  if (start > 0 && start < str.indexOf(">")) result += str.slice(0, start).trim() + " ";
  while (true) {
    cursor1 = str.indexOf(">", cursor1) + 1;
    if (cursor1 === 0) break;
    cursor2 = str.indexOf("<", cursor1);
    temp = str.slice(cursor1, cursor2 === -1 ? strLength : cursor2).trim();
    if (temp !== "") result += temp + " ";
  }
  return result;
};
