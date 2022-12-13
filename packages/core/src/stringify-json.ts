export const stringifyJSON = (value: unknown) => {
  return JSON.stringify(value, (_, v) => {
    switch (typeof v) {
      case "function":
        return `function-${v.toString()}`;
      case "bigint":
        return `bigint-${v.toString()}`;
      default:
        return v;
    }
  });
};
