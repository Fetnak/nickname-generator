export const outputArrayAsTable = (array, maximum, columns) => {
  let string = "";
  let padding = maximum + 2;
  let columnCount = columns + 1;
  for (let i = 0, n = Math.ceil(array.length / columnCount); i <= n; i++) {
    for (let j = 0, word; j < columns; j++) {
      word = array[j + i * columns];
      if (word) string += word.padEnd(padding);
    }
    console.log(string);
    string = "";
  }
};
