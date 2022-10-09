import fs from "fs";
import path from "path";

export default class Text {
  constructor(input, chunkSize, alphabet) {
    this.file = new File(input, chunkSize);
    this.isLetterRegex = new RegExp(`[${alphabet}]`);
    this.tempWord = "";
  }
  *getSeparatedWords() {
    const a = [];
    while (!this.file.isEnded()) {
      this.file.loadNextChunk();
      const str = this.file.getString();
      console.log(
        `Started Text Chunk: ${this.file.currentChunk}/${this.file.chunksCount}.`
      );
      const words = this.textToWords(str);
      for (const word of words) yield word;
    }
    return a;
  }
  *textToWords(text) {
    for (let i = 0, temp, n = text.length - 1; i < n; i++) {
      temp = text[i].toLowerCase();
      if (this.isLetter(temp)) this.tempWord += temp;
      else {
        if (this.tempWord.length >= 2) yield this.tempWord;
        this.tempWord = "";
      }
    }
  }
  isLetter(char) {
    return char.match(this.isLetterRegex);
  }
}

class File {
  constructor(input, chunkSize) {
    this.descriptor = fs.openSync(input, "r");
    this.fileSize = fs.statSync(input).size;
    this.chunkSize = chunkSize;
    this.currentChunk = 0;
    this.chunksCount = Math.ceil(this.fileSize / chunkSize);
    this.buffer = Buffer.alloc(chunkSize);
    this.bytesRead = 0;
  }
  updateChunkNumber() {
    return (this.currentChunk = Math.ceil(this.bytesRead / this.chunkSize));
  }
  loadNextChunk() {
    this.bytesRead += fs.readSync(this.descriptor, this.buffer);
    this.updateChunkNumber();
  }
  getString() {
    return this.buffer.toString("utf-8");
  }
  isEnded() {
    return this.bytesRead >= this.fileSize;
  }
}
