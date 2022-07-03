import fs from "fs";
import path from "path";

export const displayWordsInfo = (dirPath) => {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    try {
      const info = JSON.parse(fs.readFileSync(path.join(dirPath, file, "info.json")));
      let message = `UUID: ${info.uuid}. Name: ${info.name}. Created: ${info.createdAt}.`;
      console.log(message);
    } catch (error) {}
  });
};

export const displayModelInfo = (dirPath) => {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    try {
      const info = JSON.parse(fs.readFileSync(path.join(dirPath, file, "info.json")));
      let message = `UUID: ${info.uuid}. Name: ${info.name}. Created: ${info.createdAt}. Sequence: ${info.maxSequenceLength}.`;
      console.log(message);
    } catch (error) {}
  });
};

export const turnFilesIntoArray = (dirPath, filterString) => {
  const files = filterFilesByString(dirPath, filterString);
  let array = [];
  files.forEach((file) => {
    try {
      array.push(JSON.parse(fs.readFileSync(path.join(dirPath, file))));
    } catch (error) {}
  });
  return array;
};

export const filterFilesByString = (dirPath, filterString) => {
  return fs.readdirSync(dirPath).filter((filename) => filename.includes(filterString));
};
