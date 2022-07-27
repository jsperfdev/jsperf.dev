const assert = require("node:assert");
const path = require("node:path");
const benchmark = require("@jsperf.dev/benchmark").default;
const { createArray } = require("../utils/createArray.js");

const N = 100000;

benchmark.meta = {
  title: "For Iteration",
  description: "Iterating 100,000 items",
};

benchmark.beforeAll((context) => {
  Object.assign(context, {
    list: createArray(N),
    noop: (...args) => void args,
  });
});

benchmark.beforeEach(({ list }) => {
  assert(list.length === N, `list has ${N} items`);
});

benchmark.afterEach(({ list }) => {
  assert(list.length === N, `list has ${N} items`);
});

benchmark.run("for", path.resolve(__dirname, "for.js"));
benchmark.run("forEach", path.resolve(__dirname, "forEach.js"));
benchmark.run("for...of", path.resolve(__dirname, "forOf.js"));
