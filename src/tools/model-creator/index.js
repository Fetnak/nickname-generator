import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import * as uuid from "uuid";

const createModel = (args) => {
  const startExecution = Date.now();
  const preparedUuid = uuid.validate(args.output_uuid) ? args.output_uuid : uuid.v4();

  const wordsInfo = JSON.parse(fs.readFileSync(path.join(args.input, "words-" + args.input_uuid + "-info.json")));
  const wordsData = JSON.parse(fs.readFileSync(path.join(args.input, "words-" + args.input_uuid + "-data.json")));

  const DUMMY = "_";

  let modelInfo = {
    uuid: preparedUuid,
    uuidWords: wordsInfo.uuid,
    name: wordsInfo.name,
    createdAt: undefined,
    alphabet: wordsInfo.alphabet,
    maxSequenceLength: 0,
    sourceSize: wordsInfo.sourceSize,
    toWordsProcessingTime: wordsInfo.toWordsProcessingTime,
    toModelProcessingTime: undefined,
    language: wordsInfo.language,
    vesrion: process.env.npm_package_version,
    dummy: DUMMY,
  };

  let modelData = {};

  const start = (args) => {
    console.log(args);
    processAllWordsFromText(modelData, args.sequence, wordsData);

    modelInfo.createdAt = dayjs(Date.now()).format("YYYY-MM-DD HH-mm-ss");
    modelInfo.toModelProcessingTime = (Date.now() - startExecution).toString() + " ms";

    fs.writeFileSync(path.join(args.input, "model-" + args.input_uuid + "-info.json"), JSON.stringify(modelInfo));
    fs.writeFileSync(path.join(args.input, "model-" + args.input_uuid + "-data.json"), JSON.stringify(modelData));
    console.log(modelInfo);
  };

  const processAllWordsFromText = (result, sequenceLength, wordsData) => {
    const words = Object.keys(wordsData);
    for (let i = words.length; i--; ) {
      processOneWord(words[i], wordsData[words[i]], sequenceLength, result);
    }
  };
  const processOneWord = (word, multiplier, sequenceLength, result) => {
    for (let maxSequenceLength = sequenceLength + 1, wl = word.length; maxSequenceLength--; ) {
      if (wl > maxSequenceLength) addSomeLettersToResult(word, maxSequenceLength, multiplier, result);
    }
  };

  const addSomeLettersToResult = (word, maxSequenceLength, multiplier, result) => {
    maxSequenceLength--;
    for (let i = maxSequenceLength, obj = {}; i < word.length - 1; i++) {
      const sequenceFromWord = DUMMY + word.slice(i - maxSequenceLength, i + 1);
      const letterAfterSequence = word[i + 1];
      const counter = sequenceFromWord.length - DUMMY.length;
      obj = addCounterToResult(counter, result);
      obj = addSequenceToResult(sequenceFromWord, obj);
      addWeightsToResult(letterAfterSequence, multiplier, obj);
    }
  };

  let maxSequenceLengthMeasurer = 0;

  const addCounterToResult = (counter, result) => {
    if (counter > maxSequenceLengthMeasurer) maxSequenceLengthMeasurer = counter;
    if (!result[counter]) result[counter] = {};
    return result[counter];
  };

  const addSequenceToResult = (sequence, result) => {
    if (!result[sequence]) result[sequence] = {};
    return result[sequence];
  };

  const addWeightsToResult = (weights, multiplier, result) => {
    if (result[weights]) result[weights] += multiplier;
    else result[weights] = multiplier;
  };

  start(args);
};

export default { createModel };
