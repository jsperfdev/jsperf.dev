import tap from "tap";
import benchmark, { Benchmark } from "../src/index.js";

tap.test("default export is an instance of Benchmark class", (t) => {
  t.ok(benchmark instanceof Benchmark);
  t.end();
});
