import fs from "fs";
import path from "path";

export default (_path) => {
  const array = fs
    .readdirSync(_path)
    .map((a) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(_path, a, "info.json")));
      } catch (error) {}
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  for (let a of array)
    try {
      console.log(`UUID: ${a.uuid}. Name: ${a.name}. Created: ${a.createdAt}.`);
    } catch (error) {}
};
