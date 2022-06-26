import fs from "fs";
import util from "util";

const convert = (argv) => {
  if (!argv.output) argv.output = argv.input + ".txt";
  try {
    fs.writeFileSync(argv.output, "");
    const xmlWriteStream = fs.createWriteStream(argv.output);
    const xmlReadStream = fs.createReadStream(argv.input, {
      highWaterMark: argv.chunk * 1024 * 1024,
    });
    console.log("Starting...");

    let startExecution = Date.now();
    let chunkCounter = 1;
    let chunksCount = Math.ceil(fs.statSync(argv.input).size / (argv.chunk * 1024 * 1024));

    xmlReadStream.on("data", (chunk) => {
      console.log(util.format("Started XML Chunk: %s/%s. %s", chunkCounter, chunksCount, (Date.now() - startExecution).toString().padStart(8) + " ms"));
      xmlWriteStream.write(removeTags(chunk.toString("utf-8")));
      chunkCounter++;
    });

    xmlReadStream.on("end", () => {
      console.log("Done!");
    });
  } catch (error) {
    console.log("Unable to create output file or read input file!");
    throw new Error(error);
  }
};

const removeTags = (str) => {
  let result = "";
  let strLength = str.length;
  let cursor1 = 0;
  let cursor2 = 0;

  let start = str.indexOf("<");
  if (start > 0 && start < str.indexOf(">")) result += str.slice(0, start).trim() + " ";
  while (true) {
    cursor1 = str.indexOf(">", cursor1) + 1;
    if (cursor1 === 0) break;
    cursor2 = str.indexOf("<", cursor1);
    let temp = str.slice(cursor1, cursor2 === -1 ? strLength : cursor2).trim();
    if (temp === "") continue;
    result += temp + " ";
  }
  return result
};

export default { convert };
