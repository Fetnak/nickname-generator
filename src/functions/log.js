import dayjs from "dayjs";

let previous = Date.now();

export const log = (message) => {
  console.log(`[${dayjs(Date.now()).format("YYYY-MM-DD HH-mm-ss")}] ${message} ${(Date.now() - previous).toString().padStart(6)} ms`);
  previous = Date.now();
};
