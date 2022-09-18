# @jsperf.dev/benchmark

## Getting Started

This package exports an initialized instance of the [`Benchmark`](../core/readme.md#class-benchmark) class from [`@jsperf.dev/core`](../core/readme.md). It is initialized with all configuration properties set to their documented defaults.

> Import with `const benchmark = require('@jsperf.dev/benchmark').default` for CJS, or `import benchmark from '@jsperf.dev/benchmark'` for ESM

Start the benchmarking scipt using one of the import methods:

```js
const benchmark = require("@jsperf.dev/benchmark").default;
```

Some configuration values can be modified. Make sure this happens within the same execution step of the main script. The configurable properties can be found in the [`@jsperf.dev/core`](../core/readme.md) docs under [Benchmark - Instance Properties](../core/readme.md#instance-properties).

For example, the [sumOfSquares](../examples/sumOfSquares/benchmark.js) example sets its `meta` property:

```js
const N = 10000;

benchmark.meta = {
  title: "Sum of Squares",
  description: `Compare 3 seperate algorithms for calculating the sum of the square of all numbers from 0 to ${N}`,
};
```

Then, begin by defining necessary lifecycle methods. The four available are `beforeAll`, `beforeEach`, `afterAll`, and `afterEach`.

A benchmark suite has a `context` that is passed to every lifecycle method and run scripts. The recommended way to set the `context` is during the `beforeAll` lifecycle method.

For example, the `context` should contain normalized input values or methods that all of the run scripts should use.

From the [sumOfSquares](../examples/sumOfSquares/benchmark.js) example:

```js
benchmark.beforeAll((context) => {
  Object.assign(context, {
    list: Array.from({ length: 100 }, (_, i) => i),
    square: (n) => n ** 2,
  });
});
```

Similarly, the _after_ lifecycle methods can be used to assert that the results of each run script are correct. Continuing with the [sumOfSquares](../examples/sumOfSquares/benchmark.js) example, the following block asserts that the `list` in the `context` remains the same length, and that the result from each run is the expected value.

```js
benchmark.afterEach(({ list }, sum) => {
  assert(list.length === 100, `list has 100 items`);
  assert(sum === 328350, `sum is ${sum}`);
});
```

Each _run_ should be designed to make use of the values in `context`, and then be sure to return the computed result so it can be verified in the _after_ blocks.

```js
// examples/sumOfSquares/reduce.js
module.exports.default = ({ list, square }) => {
  return list.reduce((acc, i) => (acc += square(i)), 0);
};
```

Finally, back in the benchmarking script, add runs using the `run` method. The first argument must be a unique identifier, and the second argument must be the absoulte path to the _run_ script. The [sumOfSquares](../examples/sumOfSquares/benchmark.js) example is written in CommonJS so it makes use of `path.resolve()` and `__dirname`, but ESM users can make use of a path resolver like: `path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), 'reduce.js')`.

```js
benchmark.run("reduce", path.resolve(__dirname, "reduce.js"));
```

The benchmark script can be executed using `node` and information about the execution will be logged to `stdout`. Below is a simplified output of the [sumOfSquares](../examples/sumOfSquares/benchmark.js) example.

```
{ "script": "Sum of Squares" }
{ "description": "Compare 3 seperate algorithms for calculating the sum of the square of all numbers from 0 to 100" }
{ "samples": 10}
{ "results": [
    { "run": "quick sum", "medianTime": 0.010526984930038452 },
    { "run": "forEach", "medianTime": 0.010573983192443848 },
    { "run": "reduce", "medianTime": 0.01349899172782898 }
]}
```

## API

### Default: `benchmark`

- type: `Benchmark`

### Function: `setLogger(logger)`

Arguments:

- **logger** - [`pino.Logger`](https://getpino.io/#/docs/api?id=logger-instance)

Use this method to override the default [pino](https://getpino.io/#/) logger instance.

## Testing

Execute tests using `pnpm test`
