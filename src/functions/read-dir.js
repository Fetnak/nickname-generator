import fs from "fs";
import path from "path";

const turnFilesIntoArray = (dirPath, filterString) => {
  const files = filterFilesByString(dirPath, filterString);
  let array = []
  files.forEach(file => {
    array.push(JSON.parse(fs.readFileSync(path.join(dirPath, file))))
  });
  return array
}

const filterFilesByString = (dirPath, string) => {
  return fs.readdirSync(dirPath).filter((filename) => filename.includes(string));
};

export default { turnFilesIntoArray, filterFilesByString };
