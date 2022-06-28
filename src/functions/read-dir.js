import fs from "fs";
import path from "path";

const displayInfo = (dirPath, filterString) => {
  const infos = turnFilesIntoArray(dirPath, filterString);
  infos.forEach((info) => console.log("UUID: %s. Name: %s. Created: %s", info.uuid, info.name, info.createdAt));
};

const turnFilesIntoArray = (dirPath, filterString) => {
  const files = filterFilesByString(dirPath, filterString);
  let array = [];
  files.forEach((file) => {
    array.push(JSON.parse(fs.readFileSync(path.join(dirPath, file))));
  });
  return array;
};

const filterFilesByString = (dirPath, filterString) => {
  return fs.readdirSync(dirPath).filter((filename) => filename.includes(filterString));
};

export default { displayInfo, turnFilesIntoArray, filterFilesByString };
