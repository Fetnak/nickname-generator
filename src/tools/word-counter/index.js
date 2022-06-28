import fs from "fs";
import util from "util";
import path from "path";
import dayjs from "dayjs";
import * as uuid from "uuid";
import { applyLanguage } from "./src/applyLanguage.js";
import { initializeIsLetterFunc } from "./src/isLetter.js";

const countWords = (args) => {
  const startExecution = Date.now();
  const preparedUuid = uuid.validate(args.uuid) ? args.uuid : uuid.v4();

  let langParam, isLetter;

  const start = (args) => {
    langParam = applyLanguage(args.language);
    isLetter = initializeIsLetterFunc(langParam);

    let wordsInfo = {
      uuid: preparedUuid,
      name: path.basename(args.input, ".txt"),
      createdAt: undefined,
      alphabet: langParam.alphabet,
      sourceSize: fs.statSync(args.input).size.toString() + " bytes",
      toWordsProcessingTime: undefined,
      language: langParam.language,
      vesrion: process.env.npm_package_version,
    };

    let wordsData = {};

    try {
      args.outputFile = args.output + "/words-" + preparedUuid;

      const textFileReadStream = fs.createReadStream(args.input, {
        highWaterMark: args.chunk,
      });
      fs.promises.mkdir(args.output, { recursive: true }).catch(console.error);
      fs.writeFileSync(args.outputFile + "-data.json", "");
      fs.writeFileSync(args.outputFile + "-info.json", "");

      const startExecution = Date.now();
      let chunkCounter = 1;
      let chunksCount = Math.ceil(fs.statSync(args.input).size / args.chunk);

      textFileReadStream.on("data", (chunk) => {
        console.log(util.format("Started Text Chunk: %s/%s. %s", chunkCounter, chunksCount, (Date.now() - startExecution).toString().padStart(8) + " ms"));

        splitTextFileToWordsArray(chunk.toString("utf-8"), wordsData);

        chunkCounter++;
      });

      textFileReadStream.on("end", () => {
        if (args.sort !== "none") wordsData = SortWordsInObject(args.sort, wordsData);

        wordsInfo.createdAt = dayjs(Date.now()).format("YYYY-MM-DD HH-mm-ss");
        wordsInfo.toWordsProcessingTime = (Date.now() - startExecution).toString() + " ms";

        fs.writeFileSync(args.outputFile + "-data.json", JSON.stringify(wordsData));
        fs.writeFileSync(args.outputFile + "-info.json", JSON.stringify(wordsInfo));
        console.log(wordsInfo)
      });
    } catch (error) {
      console.log("Unable to create output file or read input file!");
      console.log(error);
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

// const postProcessWords = (data, options) => {

//   const changeLetterToAnother = (wordsObject, letterArray) => {

//   }

//   const canNotBeFirstWords = (wordsObject, charArray) => {

//   }
//   const deleteWords = (wordsObject, wordsToFilter) => {
//     for (let i = wordsToFilter.length; i--;) {
//       delete wordsObject[wordsToFilter[i]];
//     }
//   };
// }

// const deleteFilteredWords = (wordsObject) => {
//   for (let i = WORDS_FILTER.length; i--;) {
//     delete wordsObject[WORDS_FILTER[i]];
//   }
// };

export default { countWords };
