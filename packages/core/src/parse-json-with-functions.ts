export const parseJSONWithFunctions = (value: string) => {
  return JSON.parse(value, (_, value) => {
    if (typeof value !== "string") return value;
    return value.substring(0, 9) === "function-"
      ? eval(`(${value.substring(9)})`)
      : value;
  });
};
