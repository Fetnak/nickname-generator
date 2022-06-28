import fs from "fs";
import path from "path";
import dayjs from "dayjs";

const generateNickname = (args) => {
  const start = (args) => {
    switch (args.form) {
      case "json":
        fs.writeFileSync(path.join(args.output, dayjs(Date.now()).format("YYYY-MM-DD_HH-mm-ss") + ".json"), "");
        break;
      case "text":
        fs.writeFileSync(path.join(args.output, dayjs(Date.now()).format("YYYY-MM-DD_HH-mm-ss") + ".text"), "");
        break;
    }

    const modelsInfo = JSON.parse(fs.readFileSync(path.join(args.input, "model-" + args.uuid + "-info.json")));
    const modelsData = JSON.parse(fs.readFileSync(path.join(args.input, "model-" + args.uuid + "-data.json")));  

    console.log(modelsInfo);
    modelsInfo.maxSequenceLength = args.accuracy > 0 && args.accuracy < modelsInfo.maxSequenceLength ? args.accuracy : modelsInfo.maxSequenceLength;

    const nicknames = generateNicknames(args.minimum, args.maximum, modelsData, modelsInfo, args.count);

    switch (args.form) {
      case "console":
        writeArray(nicknames, args.columns);
        break;
      case "json":
        fs.writeFileSync(path.join(args.output, dayjs(Date.now()).format("YYYY-MM-DD_HH-mm-ss") + ".json"), JSON.stringify(nicknames));
        break;
      case "text":
        fs.writeFileSync(path.join(args.output, dayjs(Date.now()).format("YYYY-MM-DD_HH-mm-ss") + ".text"), nicknames.toString.replace(/,/g, "\n"));
        break;
    }
  };

  const generateNicknames = (min, max, weights, modelsInfo, count) => {
    let nicknames = [];
    for (let i = count; i--; ) nicknames.push(generateRandomNickname(min, max, weights, modelsInfo));
    return nicknames;
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
      let randomNumber = random(1, modelsInfo.maxSequenceLength);
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
