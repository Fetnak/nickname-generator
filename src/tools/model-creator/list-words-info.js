import fs from "fs";
import path from "path";

export default (_path) => {
  const words = fs.readdirSync(_path);
  for (let word of words)
    try {
      const info = JSON.parse(
        fs.readFileSync(path.join(_path, word, "info.json"))
      );
      const message = `UUID: ${info.uuid}. Name: ${info.name}. Created: ${info.createdAt}.`;
      console.log(message);
    } catch (error) {}
};
