import languages from "./lang/all.js";

export const applyLanguage = (languageCode) => {
  let langParam = languages[languageCode];

  if (langParam.isLetterFunctionType == "loop") {
    langParam.alphabet = makeAlphabet(langParam.firstLetter, langParam.lastLetter);
  }

  return langParam;
};

const makeAlphabet = (firstLetter, lastLetter) => {
  let alphabet = "";
  for (let i = firstLetter.charCodeAt(0), n = lastLetter.charCodeAt(0); i <= n; i++) {
    alphabet += String.fromCharCode(i);
  }
  return alphabet;
};
