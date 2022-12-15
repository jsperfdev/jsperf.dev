import tap from "tap";
import { median } from "../src/median";

tap.test("median returns expected values", (t) => {
  t.equal(median([1, 2, 3]), 2);
  t.equal(median([1, 2, 3, 4]), 2.5);
  t.end();
});
