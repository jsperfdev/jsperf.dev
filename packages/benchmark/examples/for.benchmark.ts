import assert from "assert";
import _benchmark, { Benchmark } from "../src";

interface Context {
  list: number[];
  noop: (...args: unknown[]) => undefined;
}

const jsperf = _benchmark as Benchmark<Context>;

const createArray = (length: number) => Array.from({ length }, (_, i) => i);

const N = 100000;

jsperf.beforeAll((context) => {
  Object.assign(context, {
    list: createArray(N),
    noop: (...args: unknown[]) => void args,
  });
});

jsperf.beforeEach(({ list }) => {
  assert(list.length === N, `list has ${N} items`);
});

jsperf.afterEach(({ list }) => {
  assert(list.length === N, `list has ${N} items`);
});

jsperf.run("forEach", ({ list, noop }) => {
  list.forEach((item) => {
    noop(item);
  });
});

jsperf.run("for..of", ({ list, noop }) => {
  for (const item of list) {
    noop(item);
  }
});

jsperf.run("for", ({ list, noop }) => {
  for (let i = 0; i < list.length; i++) {
    noop(list[i]);
  }
});

/**
 * ts-node for.benchmark.ts
 *
 * | Run     | Time (ms) | Mem (gb) |
 * | ------- | --------- | -------- |
 * | for     |   0.56734 |  0.00057 |
 * | for..of |   0.78901 |  0.00011 |
 * | forEach |   1.00234 |  0.00232 |
 */
