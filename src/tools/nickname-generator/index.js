import fs from "fs";
import path from "path";

const generateNickname = (args) => {
  const start = (args) => {
    const modelsInfo = JSON.parse(fs.readFileSync(path.join(args.input, "model-" + args.uuid + "-info.json")));
    const modelsData = JSON.parse(fs.readFileSync(path.join(args.input, "model-" + args.uuid + "-data.json")));
    maxSequenceLength = args.accuracy > 0 && args.accuracy < modelsInfo.maxSequenceLength ? args.accuracy : modelsInfo.maxSequenceLength;

    console.log(modelsInfo);
    console.log("Selected maxSequenceLength: %s. Min: %s. Max: %s. Words generated: %s.", maxSequenceLength, args.minimum, args.maximum, args.count);

    let generatedWords = [];

    for (let i = 0; i < args.count; i++) {
      generatedWords.push(generateRandomNickname(args.minimum, args.maximum, modelsData, modelsInfo));
    }
    console.log();
    writeArray(generatedWords, args.columns);
  };

  const writeArray = (array, columns) => {
    let string = "";
    let padding = args.maximum + 2;
    let columnCount = columns + 1;
    for (let i = 0, n = Math.ceil(array.length / columnCount); i <= n; i++) {
      for (let j = 0, word; j < columns; j++) {
        word = array[j + i * columns];
        if (word != undefined) string += word.padEnd(padding);
      }
      console.log(string);
      string = "";
    }
  };

  let maxSequenceLength;

  const generateRandomNickname = (min, max, weights, modelsInfo) => {
    if (min < 1 || min > max) return "";
    let nickname = "";
    const wordLength = random(min, max);
    for (let i = wordLength; i--; ) {
      if (nickname.length <= wordLength) {
        nickname += generateNextLetter(nickname, weights, modelsInfo);
      }
    }
    return nickname;
  };

  const generateNextLetter = (nickname, weights, modelsInfo) => {
    let weightsCounter = 0;
    const weightsForNickname = selectWeightsforNickname(nickname, weights, modelsInfo);
    const words = Object.keys(weightsForNickname);
    for (let i = words.length; i--; ) {
      weightsCounter += weightsForNickname[words[i]];
    }

    const randomNumber = random(1, weightsCounter);
    weightsCounter = 0;

    for (let i = words.length; i--; ) {
      if (randomNumber > weightsCounter && randomNumber <= weightsCounter + weightsForNickname[words[i]]) {
        return words[i];
      }

      weightsCounter += weightsForNickname[words[i]];
    }
  };

  const selectWeightsforNickname = (nickname, weights, modelsInfo) => {
    const nl = nickname.length;
    let preform = "";
    while (true) {
      let randomNumber = random(1, maxSequenceLength);
      for (let i = randomNumber; i--; ) {
        preform = modelsInfo.dummy + nickname.slice(nl - i, nl);
        if (weights[i][preform]) {
          return weights[i][preform];
        }
      }
    }
  };

  const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  start(args);
};

export default { generateNickname };
