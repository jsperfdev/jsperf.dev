export const stringifyJSONWithFunctions = (value: unknown) => {
  return JSON.stringify(value, (_, value) => {
    return typeof value === "function" ? `function-${value.toString()}` : value;
  });
};
