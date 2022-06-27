import fs from "fs";

const createModel = (args) => {
  const startExecution = Date.now();

  let weightsObject = {
    info: {
      name: NAME,
      createdAt: "",
      alphabet: ALPHABET,
      maxSequenceLength: 0,
      sourceSize: fs.statSync(TEXT_PATH).size,
      textProcessingTime: undefined,
      wordsProcessingTine: undefined,
      vesrion: process.env.npm_package_version,
      language: LANGUAGE,
      dummy: DUMMY,
    },
    data: {},
  };

  const start = (args) => {
    args.outputFile = args.output + "/words-" + uuid;

    const wordsObject = fs.readFileSync(JSON_PATH);

    processAllWordsFromText(weightsObject.data, args.sequence, allWordsFromText.data);

    fs.writeFileSync(WIGHTS_PATH, JSON.stringify(weightsObject));
    console.log(weightsObject.info);
  };

  const processAllWordsFromText = (result, sequenceLength, array) => {
    const words = Object.keys(allWordsFromText);
    for (let i = words.length; i--; ) {
      processOneWord(words[i], array[words[i]], sequenceLength, result);
      calculateProgressBar(i, words.length, 80, 100);
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

  const WORD_LENGTH = 5;
  const NAME = process.argv[3];
  //const TEXT_PATH = "resources/text_" + NAME + ".txt";
  const TEXT_PATH = process.argv[4];
  const WIGHTS_PATH = "resources/models/" + NAME + ".json";
  const COMPUTED_WORDS_PATH = "resources/computedWords/" + NAME + ".json";
  const DUMMY = "_";

  start();
};

export default { createModel };
