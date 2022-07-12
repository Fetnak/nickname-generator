import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import * as uuid from "uuid";
import sizeof from "object-sizeof";
import { applyLanguage } from "./src/applyLanguage.js";
import { initializeIsLetterFunc } from "./src/isLetter.js";
import { log } from "../../functions/log.js";

export const countWords = (args) => {
  const preparedUuid = uuid.validate(args.uuid) ? args.uuid : uuid.v4();

  let langParam, isLetter;

  const start = (args) => {
    langParam = applyLanguage(args.language);
    isLetter = initializeIsLetterFunc(langParam);

    let wordsInfo = {
      uuid: preparedUuid,
      name: path.basename(args.input, ".txt"),
      describtion: args.describtion,
      createdAt: undefined,
      alphabet: langParam.alphabet,
      sourceSize: fs.statSync(args.input).size.toString() + " bytes",
      toWordsProcessingTime: undefined,
      language: langParam.language,
      vesrion: process.env.npm_package_version,
    };

    let wordsData = {};

    try {
      const wordsFolder = path.join(args.output, "words-" + preparedUuid);

      const textFileReadStream = fs.createReadStream(args.input, {
        highWaterMark: args.chunk,
      });
      fs.promises.mkdir(wordsFolder, { recursive: true }).catch(console.error);

      const startExecution = Date.now();
      let chunkCounter = 1;
      let chunksCount = Math.ceil(fs.statSync(args.input).size / args.chunk);
      let wordsFileCounter = 0;

      textFileReadStream.on("data", (chunk) => {
        console.log(`Started Text Chunk: ${chunkCounter}/${chunksCount}.`);

        splitTextFileToWordsArray(chunk.toString("utf-8"), wordsData);
        let wdl = Object.keys(wordsData).length;
        const limitToFile = 3000000;
        if (wdl >= limitToFile) {
          fs.writeFileSync(path.join(wordsFolder, wordsFileCounter.toString().padStart(3, "0") + "-data.json"), JSON.stringify(wordsData));
          wordsFileCounter++;
          wordsData = {};
          log(`${wdl} words was wrote on drive.`);
        }
        log(`Size of ${wdl} words is ${sizeof(wordsData)} bytes`);
        chunkCounter++;
      });

      textFileReadStream.on("end", () => {
        if (args.sort !== "none") wordsData = SortWordsInObject(args.sort, wordsData);

        wordsInfo.createdAt = dayjs(Date.now()).format("YYYY-MM-DD HH-mm-ss");
        wordsInfo.toWordsProcessingTime = (Date.now() - startExecution).toString() + " ms";

        fs.writeFileSync(path.join(wordsFolder, wordsFileCounter.toString().padStart(3, "0") + "-data.json"), JSON.stringify(wordsData));
        wordsFileCounter++;
        fs.writeFileSync(path.join(wordsFolder, "info.json"), JSON.stringify(wordsInfo));
        console.log(wordsInfo);
        log("Started clearing files.");
        clearWordFiles(wordsFolder);
      });
    } catch (error) {
      console.log("Unable to create output file or read input file!");
      console.log(error);
    }
  };

  const clearWordFiles = (wordsFolder) => {
    const files = fs.readdirSync(wordsFolder).filter((filename) => filename.includes("data.json"));
    for (let i = 0; i < files.length - 1; i++) {
      const file1 = JSON.parse(fs.readFileSync(path.join(wordsFolder, files[i])));
      log(`"${files[i]}" Loaded`);
      const file1Array = Object.keys(file1);
      log(`Array from "${files[i]}" file created`);
      const file1ArrayLength = file1Array.length;
      for (let j = i + 1; j < files.length; j++) {
        const file2 = JSON.parse(fs.readFileSync(path.join(wordsFolder, files[j])));
        for (let k = file1ArrayLength; k--; ) {
          if (file2[file1Array[k]]) {
            file1[file1Array[k]] += file2[file1Array[k]];
            delete file2[file1Array[k]];
          }
        }
        fs.writeFileSync(path.join(wordsFolder, files[j]), JSON.stringify(file2));
        log(`[${files[i]}] Cleared "${files[j]}" was written`);
      }
      fs.writeFileSync(path.join(wordsFolder, files[i]), JSON.stringify(file1));
      log(`Cleared "${files[i]}" was written`);
    }
  };

  let word = "";

  const splitTextFileToWordsArray = (textFile, wordsObject) => {
    for (let i = 0, tempLetter = "", n = textFile.length - 1; i < n; i++) {
      tempLetter = textFile[i].toLowerCase();
      if (isLetter(tempLetter)) {
        word += tempLetter;
      } else {
        if (word.length > 1) {
          addWordToObject(word, wordsObject);
        }
        word = "";
      }
    }
  };

  const addWordToObject = (word, obj) => {
    if (obj[word]) obj[word]++;
    else obj[word] = 1;
  };

  const SortWordsInObject = (order, obj) => {
    let sortOrder,
      countsObject = {};

    if (order === "asc") sortOrder = (a, b) => a[1] - b[1];
    else sortOrder = (a, b) => b[1] - a[1];

    const countsArray = Object.entries(obj).sort(sortOrder);
    countsArray.forEach((word) => {
      countsObject[word[0]] = word[1];
    });

    return countsObject;
  };

  start(args);
};
