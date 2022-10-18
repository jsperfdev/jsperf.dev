import tap from "tap";
import { stringifyJSONWithFunctions } from "../src/stringify-json-with-functions";

tap.test("preceeds functions with the prefix `function-`", (t) => {
  const json = {
    func: function f() {
      return "1";
    },
    prop: "2",
  };
  const stringified = stringifyJSONWithFunctions(json);
  t.equal(
    stringified,
    `{"func":"function-function f() { return \\"1\\"; }","prop":"2"}`
  );
  t.end();
});
