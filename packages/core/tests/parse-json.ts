import tap from "tap";
import { parseJSON } from "../src/parse-json";

tap.test("evaluates values preceeded by `function-` as functions", (t) => {
  const string =
    '{"func":"function-function f() { return \'1\'; }","prop":"2"}';
  const parsed = parseJSON(string);
  t.equal(parsed.func(), "1");
  t.equal(parsed.prop, "2");
  t.end();
});

tap.test("evaluates values preceeded by `bigint-` as bigints", (t) => {
  const string = '{"bigint":"bigint-1","prop":"2"}';
  const parsed = parseJSON(string);
  t.equal(parsed.bigint, 1n);
  t.equal(parsed.prop, "2");
  t.end();
});
