const mulberry32 = (a) => {
  return () => {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const xoshiro128ss = (a, b, c, d) => {
  return () => {
    var t = b << 9,
      r = a * 5;
    r = ((r << 7) | (r >>> 25)) * 9;
    c ^= a;
    d ^= b;
    b ^= c;
    a ^= d;
    c ^= t;
    d = (d << 11) | (d >>> 21);
    return (r >>> 0) / 4294967296;
  };
};
const jsf32 = (a, b, c, d) => {
  return () => {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    var t = (a - ((b << 27) | (b >>> 5))) | 0;
    a = b ^ ((c << 17) | (c >>> 15));
    b = (c + d) | 0;
    c = (d + t) | 0;
    d = (a + t) | 0;
    return (d >>> 0) / 4294967296;
  };
};
const randomizer = (seed) => {
  const rnd = xoshiro128ss(0x9e3779b9, 0x243f6a88, 0xb7e15162, seed);
  return (min, max) => {
    return Math.floor(rnd() * (max - min + 1) + min);
  };
};

export default randomizer;
