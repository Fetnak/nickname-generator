import fs from "fs";

export default class Output {
  constructor(args) {
    this.sort = args.sort;
    this.form = args.form;
    this.columns = args.columns;
    this.output = args.output;
    this.outputFilePath = args.outputFilePath;
    this.random = args.random;
  }

  checkFilePath() {
    switch (this.form) {
      case "json":
        fs.mkdirSync(this.output, { recursive: true });
        break;
      case "text":
        fs.mkdirSync(this.output, { recursive: true });
        break;
    }
  }

  sortArray(nicknames) {
    switch (this.sort) {
      case "random":
        this.shuffleArray(nicknames);
        break;
      case "asc":
        nicknames
          .sort((a, b) => a.localeCompare(b))
          .sort((a, b) => a.length - b.length);
        break;
      case "desc":
        nicknames
          .sort((a, b) => b.localeCompare(a))
          .sort((a, b) => b.length - a.length);
        break;
      case "asc2":
        nicknames.sort((a, b) => a.localeCompare(b));
        break;
      case "desc2":
        nicknames.sort((a, b) => b.localeCompare(a));
        break;
      default:
        break;
    }
  }

  outputArray(nicknames) {
    switch (this.form) {
      case "console":
        this.outputArrayAsTable(nicknames, this.columns);
        break;
      case "json":
        fs.writeFileSync(this.outputFilePath, JSON.stringify(nicknames));
        break;
      case "text":
        fs.writeFileSync(this.outputFilePath, nicknames.join(", "));
        break;
    }
  }

  shuffleArray(array) {
    let randomIndex;
		let tmp;
    for (let currentIndex in array) {
      randomIndex = this.random(0, array.length - 1);
			tmp = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = tmp;
    }
    return array;
  }

  outputArrayAsTable(array, columns) {
    let string = "";
    let padding = 0;
    for (let item of array) padding = Math.max(item.length, padding);
    padding++;

    if (columns < 1) columns = Math.floor(process.stdout.columns / padding);

    for (let i = 0, n = Math.ceil(array.length / columns); i < n; i++) {
      for (let j = 0, word; j < columns; j++) {
        word = array[j + i * columns];
        if (word) string += word.padEnd(padding);
      }
      console.log(string);
      string = "";
    }
  }
}
