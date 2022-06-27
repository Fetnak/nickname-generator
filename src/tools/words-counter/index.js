import fs from "fs";
import util from "util";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { applyLanguage } from "./src/functions/applyLanguage.js";
import { initializeIsLetterFunc } from "./src/functions/isLetter.js";

const countWords = (args) => {
  let langParam, isLetter;

  const uuid = uuidv4();

  const start = (args) => {
    langParam = applyLanguage(args.language);
    isLetter = initializeIsLetterFunc(langParam);

    let allWordsFromText = {
      info: {
        uuid,
        name: path.basename(args.input, ".txt"),
        createdAt: "",
        alphabet: langParam.alphabet,
        sourceSize: fs.statSync(args.input).size,
        language: langParam.language,
      },
      data: {},
    };

    try {
      console.log(args.output);
      args.output += "/" + uuid;

      const textFileReadStream = fs.createReadStream(args.input, {
        highWaterMark: args.chunk,
      });
      fs.writeFileSync(args.output + ".data", "");
      fs.writeFileSync(args.output + ".info", "");

      const startExecution = Date.now();
      let chunkCounter = 1;
      let chunksCount = Math.ceil(fs.statSync(args.input).size / args.chunk);

      textFileReadStream.on("data", (chunk) => {
        console.log(util.format("Started Text Chunk: %s/%s. %s", chunkCounter, chunksCount, (Date.now() - startExecution).toString().padStart(8) + " ms"));

        splitTextFileToWordsArray(chunk.toString("utf-8"), allWordsFromText.data);

        chunkCounter++;
      });

      textFileReadStream.on("end", () => {
        allWordsFromText.info.createdAt = new Date().toISOString();
        if (args.sort !== "none") allWordsFromText.data = SortWordsInObject(args.sort, allWordsFromText.data);
        fs.writeFileSync(args.output + ".info", JSON.stringify(allWordsFromText.info));
        fs.writeFileSync(args.output + ".data", JSON.stringify(allWordsFromText.data));
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
