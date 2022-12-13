export const parseJSON = (value: string) => {
  return JSON.parse(value, (_, v) => {
    if (typeof v !== "string") {
      return v;
    } else if (v.substring(0, 9) === "function-") {
      return eval(`(${v.substring(9)})`);
    } else if (v.substring(0, 7) === "bigint-") {
      return BigInt(v.substring(7));
    } else {
      return v;
    }
  });
};
