const SIZES = {
  STRING: 2,
  BOOLEAN: 4,
  NUMBER: 8,
};
const sizeof = (object) => {
  // if (Buffer.isBuffer(object)) return object.length;

  switch (typeof object) {
    case "string":
      return object.length * SIZES.STRING;
    case "boolean":
      return SIZES.BOOLEAN;
    case "number":
      return SIZES.NUMBER;
    case "symbol":
      return Symbol.keyFor(object).length * SIZES.STRING;
    case "object":
      if (object instanceof Array)
        return object.reduce((acc, val) => acc + sizeof(val), 0);
      let size = 0;
      for (let key in object) size += sizeof(key) + sizeof(object[key]);
      return size;
    default:
      return 0;
  }
};

export default sizeof;
