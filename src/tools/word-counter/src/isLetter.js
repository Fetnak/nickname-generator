export const initializeIsLetterFunc = (langParam) => {
  let isLetter;

  if (langParam.isLetterFunctionType === "loop") {
    isLetter = (char) => {
      if (char >= langParam.firstLetter && char <= langParam.lastLetter) return true;
      return false;
    };
  } else {
    const isLetterRegex = new RegExp("[" + langParam.alphabet + "]");
    isLetter = (char) => {
      return char.match(isLetterRegex);
    };
  }

  return isLetter;
};
