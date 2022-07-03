import fs from "fs";
import path from "path";
import sizeof from "object-sizeof";
import { log } from "../../../functions/log.js";
import { filterFilesByString } from "../../../functions/read-dir.js";

export const clearAndSortResult = (foldersPath, fileLimit) => {
  const folderCounters = fs.readdirSync(foldersPath).filter((filename) => filename !== "info.json");
  for (let folder = 0; folder < folderCounters.length; folder++) {
    const folderPath = path.join(foldersPath, folderCounters[folder]);
    let files = fs.readdirSync(folderPath).filter((name) => name.includes("data.json"));
    if (files.length > 1) {
      processOneFolderCounter(folderPath, fileLimit);
      log(`"${folderCounters[folder]} sequence" processed.`);
      renameAndSeparate(folderPath, fileLimit);
      log(`"${folderCounters[folder]} sequence" renamed and separated.`);
    } else {
      sortFile(path.join(folderPath, files[0]));
      log(`"${folderCounters[folder]} sequence" processed.`);
    }
    filePointersToInfo(folderPath);
    log(`"${folderCounters[folder]} sequence" pointers  done.`);
  }
};

const sortFile = (filePath) => {
  const file = JSON.parse(fs.readFileSync(filePath));
  const fileArray = Object.keys(file).sort((a, b) => b.localeCompare(a));
  let tempFile = {};
  for (let i = fileArray.length; i--; ) {
    tempFile[fileArray[i]] = file[fileArray[i]];
  }
  fs.writeFileSync(filePath, JSON.stringify(tempFile));
};

const processOneFolderCounter = (folderPath, fileLimit) => {
  let files = filterFilesByString(folderPath, "data.json");
  for (let i = 0; i < files.length; i++) {
    let file1 = JSON.parse(fs.readFileSync(path.join(folderPath, files[i])));

    if (JSON.stringify(file1) === "{}") {
      fs.unlinkSync(path.join(folderPath, files[i]));
      files = filterFilesByString(folderPath, "data.json");
      i--;
      continue;
    }
    if (i === files.length - 1) break;
    const file1Array = Object.keys(file1);
    for (let j = i + 1; j < files.length; j++) {
      const file2 = JSON.parse(fs.readFileSync(path.join(folderPath, files[j])));
      if (JSON.stringify(file2) === "{}") continue;
      for (let k = file1Array.length; k--; ) joinSequences(file1, file2, file1Array[k]);

      let tempFile1 = {};
      let tempFile2 = {};
      sortPairOfFiles(tempFile1, tempFile2, file1, file2, fileLimit);
      file1 = tempFile1;
      fs.writeFileSync(path.join(folderPath, files[j]), JSON.stringify(tempFile2));
    }
    fs.writeFileSync(path.join(folderPath, files[i]), JSON.stringify(file1));
  }
};

const joinSequences = (sequences1, sequences2, word) => {
  if (sequences2[word]) {
    const sequences2Array = Object.keys(sequences2[word]);
    for (let i = sequences2Array.length; i--; ) {
      joinWeights(sequences1[word], sequences2[word]);
    }
    delete sequences2[word];
  }
};

const joinWeights = (weights1, weights2) => {
  if (weights1) {
    const wA = Object.keys(weights2);
    for (let i = wA.length; i--; ) {
      if (weights1[wA[i]]) weights1[wA[i]] += weights2[wA[i]];
      else weights1[wA[i]] = weights2[wA[i]];
    }
  } else weights1 = weights2;
};

const sortPairOfFiles = (tempFile1, tempFile2, file1, file2, fileLimit) => {
  let allWordsArray = [...Object.keys(file1), ...Object.keys(file2)].sort((a, b) => b.localeCompare(a));
  let sizeOfTemp = 0;
  for (let k = allWordsArray.length, isNotFull = true; k--; ) {
    if (isNotFull) {
      sizeOfTemp = addSequence(tempFile1, file1, file2, allWordsArray[k], sizeOfTemp);
      if (sizeOfTemp > fileLimit) isNotFull = false;
    } else {
      addSequence(tempFile2, file1, file2, allWordsArray[k]);
    }
  }
};

const addSequence = (tempFile, file1, file2, sequence, sizeOfTempFile) => {
  let obj = file1[sequence];
  if (obj != undefined) {
    tempFile[sequence] = obj;
    sizeOfTempFile += sizeof(sequence) + sizeof(obj);
    return sizeOfTempFile;
  } else {
    obj = file2[sequence];
    tempFile[sequence] = obj;
  }
};

const renameAndSeparate = (folderPath, fileLimit) => {
  let counter = 0;
  let files = filterFilesByString(folderPath, "data.json");
  for (let i = 0; i < files.length; i++) {
    fs.renameSync(path.join(folderPath, files[i]), path.join(folderPath, counter.toString().padStart(6, "0") + "-data.json"));
    counter++;
  }
  files = filterFilesByString(folderPath, "data.json");
  let file = JSON.parse(fs.readFileSync(path.join(folderPath, files[files.length - 1])));

  if (sizeof(file) > fileLimit) {
    counter--;
    while (true) {
      let tempFile1 = {};
      let tempFile2 = {};
      let sizeOfTempFile = 0;
      let isNotFull = true;
      const fileArray = Object.keys(file);
      for (let i = 0, obj; i < fileArray.length; i++) {
        obj = file[fileArray[i]];
        if (isNotFull) {
          tempFile1[fileArray[i]] = obj;
          sizeOfTempFile += sizeof(fileArray[i]) + sizeof(obj);
          if (sizeOfTempFile > fileLimit) isNotFull = false;
        } else {
          tempFile2[fileArray[i]] = obj;
        }
      }
      fs.writeFileSync(path.join(folderPath, counter.toString().padStart(6, "0") + "-data.json"), JSON.stringify(tempFile1));
      counter++;
      if (sizeof(tempFile2) > fileLimit) {
        file = tempFile2;
      } else {
        fs.writeFileSync(path.join(folderPath, counter.toString().padStart(6, "0") + "-data.json"), JSON.stringify(tempFile2));
        break;
      }
    }
  }
};

const filePointersToInfo = (folderPath) => {
  let pointers = [];
  let files = filterFilesByString(folderPath, "data.json");
  for (let i = 0; i < files.length; i++) {
    let file = JSON.parse(fs.readFileSync(path.join(folderPath, files[i])));
    pointers.push(({}[files[i]] = Object.keys(file)[0]));
  }
  fs.writeFileSync(path.join(folderPath, "pointers.json"), JSON.stringify(pointers));
};
