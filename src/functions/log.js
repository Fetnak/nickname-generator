import dayjs from "dayjs";

let start = Date.now()
let previous = Date.now();

export const log = (message) => {
  console.log(`[${dayjs(Date.now()).format("YYYY-MM-DD HH-mm-ss")}] ${message} ${(Date.now() - previous).toString().padStart(6)} ms. From start: ${Date.now() - start} ms`);
  previous = Date.now();
};
