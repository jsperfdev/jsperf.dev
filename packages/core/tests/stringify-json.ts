import tap from "tap";
import { stringifyJSON } from "../src/stringify-json";

tap.test("preceeds functions with the prefix `function-`", (t) => {
  const json = {
    // prettier-ignore
    func: function f() { return "1"; },
    prop: "2",
  };
  const stringified = stringifyJSON(json);
  t.equal(
    stringified,
    `{"func":"function-function f() { return \\"1\\"; }","prop":"2"}`
  );
  t.end();
});

tap.test("preceeds bigints with the prefix `bigint-`", (t) => {
  const json = {
    bigint: 1n,
    prop: "2",
  };
  const stringified = stringifyJSON(json);
  t.equal(stringified, `{"bigint":"bigint-1","prop":"2"}`);
  t.end();
});
