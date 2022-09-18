import tap from "tap";
import { parseJSONWithFunctions } from "../src/parse-json-with-functions";

tap.test("evaluates values preceeded by `function-` as functions", (t) => {
  const string =
    '{"func":"function-function f() { return \'1\'; }","prop":"2"}';
  const parsed = parseJSONWithFunctions(string);
  t.equal(parsed.func(), "1");
  t.equal(parsed.prop, "2");
  t.end();
});
