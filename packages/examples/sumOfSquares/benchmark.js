const assert = require("node:assert");
const { MODES } = require("@jsperf.dev/benchmark");
const benchmark = require("@jsperf.dev/benchmark").default;
const path = require("node:path");
const { createArray } = require("../utils/createArray.js");

const N = 100;

benchmark.meta = {
  title: "Sum of Squares",
  description: `Compare 3 seperate algorithms for calculating the sum of the square of all numbers from 0 to ${N}`,
};

benchmark.beforeAll((context) => {
  Object.assign(context, {
    list: createArray(N),
    square: (n) => n ** 2,
  });
});

benchmark.beforeEach(({ list }) => {
  assert(list.length === N, `list has ${N} items`);
});

benchmark.afterEach(({ list }, sum) => {
  assert(list.length === N, `list has ${N} items`);
  assert(sum === 328350, `sum is ${sum}`);
});

benchmark.run("quick sum", path.resolve(__dirname, "./quickSum.js"));
benchmark.run("forEach", path.resolve(__dirname, "./forEach.js"));
benchmark.run("reduce", path.resolve(__dirname, "./reduce.js"));
