const UNAMBIGOUS_ALPHA_NUMERICS =
  "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const UAN_MAP = new Map(
  UNAMBIGOUS_ALPHA_NUMERICS.split("").map((e, i) => [i, e]),
);

// returns random int in range [min, max)
const randomInt = (min = 0, max = 10) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export const randomStringBase = (
  length = 5,
  src = UNAMBIGOUS_ALPHA_NUMERICS,
) => {
  let s = "";
  for (let _ = 0; _ < length; _++) {
    const i = randomInt(0, src.length);
    s += src.charAt(i);
  }
  return s;
};

export const randomStringA = (length = 5, src = UNAMBIGOUS_ALPHA_NUMERICS) => {
  const s = new Array(length);
  const size = src.length;
  for (let ptr = 0; ptr < length; ptr++) {
    s[ptr] = src.charAt(randomInt(0, size));
  }
  return s.reduce((cur, acc) => cur + acc, "");
};

export const randomStringB = (length = 5, src = UNAMBIGOUS_ALPHA_NUMERICS) =>
  Array(length).fill(undefined).map(() => src.charAt(randomInt(0, src.length)))
    .join("");

export const randomStringC = (length = 5, src = UAN_MAP) => {
  let s = "";
  const size = src.size;
  for (let _ = 0; _ < length; _++) {
    const i = randomInt(0, size);
    s += src.get(i) ?? "";
  }
  return s;
};

export const randomString = randomStringBase;
