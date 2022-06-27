import fs from "fs";
import util from "util";
import { applyLanguage } from "./src/functions/applyLanguage.js";
import { initializeIsLetterFunc } from "./src/functions/isLetter.js";

let langParam, isLetter;

const countWords = (args) => {
  let allWordsFromText = {
    info: {},
    data: {},
  };
  
//console.log(args.input.slice(args.input.lastIndexOf("\\") + 1))

  langParam = applyLanguage(args.language);
  isLetter = initializeIsLetterFunc(langParam);

  try {
    if (!args.output) args.output = args.input.words;

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
      fs.writeFileSync(args.output + ".data", JSON.stringify(allWordsFromText));
    });
  } catch (error) {
    console.log("Unable to create output file or read input file!");
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
        addWordToArray(word, wordsObject);
      }
      word = "";
    }
  }
};

const addWordToArray = (word, array) => {
  if (array[word]) array[word]++;
  else array[word] = 1;
};

// const INFO = {
//   name: argv.name,
//   createdAt: "",
//   alphabet: ALPHABET,
//   maxSequenceLength: 0,
//   sourceSize: fs.statSync(argv.input).size,
//   processingLog: [],
//   vesrion: VERSION,
//   language: LANGUAGE,
//   dummy: DUMMY,
// };

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

// const JSONInfoModifier = (result) => {
//   result.info = {
//     name: addAbortSignal,
//     createdAt: Date.now().toISOString()
//   }
// };

export default { countWords };
