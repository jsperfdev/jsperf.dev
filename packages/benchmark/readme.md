# @jsperf.dev/benchmark

## Getting Started

The module has two main exports:

1. `const benchmark = require('@jsperf.dev/benchmark').default` or `import benchmark from '@jsperf.dev/benchmark'`
   The default export is an initialized instance of the [Benchmark][] class. It is initialized with all configuration properties set to their documented defaults.
2. `const { Benchmark } = require('@jsperf.dev/benchmark')` or `import { Benchmark } from '@jsper.dev/benchmark'`
   The [Benchmark][] class is also available as a named export so it can be manually instantiated and configured by the user.

Start the benchmarking scipt using one of the import methods:

```js
const benchmark = require("@jsperf.dev/benchmark").default;
```

Then, begin by defining necessary lifecycle methods. The four available are `beforeAll`, `beforeEach`, `afterAll`, and `afterEach`.

A benchmark suite has a `context` that is passed to every lifecycle method and run scripts. The recommended way to set the `context` is during the `beforeAll` lifecycle method.

For example, the `context` should contain normalized input values or methods that all of the run scripts should use.

From the [sumOfSquares]() example:

```js
benchmark.beforeAll((context) => {
  Object.assign(context, {
    list: Array.from({ length: 100 }, (_, i) => i),
    square: (n) => n ** 2,
  });
});
```

Similarly, the _after_ lifecycle methods can be used to assert that the results of each run script are correct. Continuing with the [sumOfSquares]() example, the following block asserts that the `list` in the `context` remains the same length, and that the result from each run is the expected value.

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

Finally, back in the benchmarking script, add runs using the `run` method. The first argument must be a unique identifier, and the second argument must be the absoulte path to the _run_ script. The [sumOfSquares]() example is written in CommonJS so it makes use of `path.resolve()` and `__dirname`, but ESM users can make use of a path resolver like: `path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), 'reduce.js')`.

```js
benchmark.run("reduce", path.resolve(__dirname, "reduce.js"));
```

The benchmark script can be executed using `node` and information about the execution will be logged to `stdout`. Below is a simplified output of the [sumOfSquares]() example.

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

### Class: `Benchmark`

Extends: `EventEmitter`

#### `new Benchmark<Context>(options)`

Arguments:

- **options** - `object` - _optional_ - Default: `{}`
  - **warmup** - `boolean` - _optional_ - Default: `true`
  - **samples** - `number` - _optional_ - Default: `10`
  - **meta** - `Meta` - _optional_ - Default: `{}`
  - **logger** - `pino.Logger` - _optional_ Default: `pino()`

#### Instance Properties

##### `Benchmark.context`

- `Context`

A property that will be passed as the first argument to each lifecyle method and run script.

##### `Benchmark.meta`

- `Meta`

A property that represents general information about the benchmark instance. The title is defaulted to `process.argv[1]` (generally the path of the benchmark script).

#### Instance Methods

##### `Benchmark.afterAll(func)`

Arguments:

- **func** - `FunctionWithContext<Context>` - _required_

Lifecycle method for adding a function that executes after all other scripts are executed.

##### `Benchmark.afterEach(func)`

Arguments:

- **func** - `FunctionWithContext<Context>` - _required_

Lifecycle method for adding a function that executes after each _run_ script is executed.

##### `Benchmark.beforeAll(func)`

Arguments:

- **func** - `FunctionWithContext<Context>` - _required_

Lifecycle method for adding a function that executes before all scripts are executed.

##### `Benchmark.beforeEach(func)`

Arguments:

- **func** - `FunctionWithContext<Context>` - _required_

Lifecycle method for adding a function that executes before each _run_ script is executed.

##### `Benchmark.run(id, file)`

Arguments:

- **id** - `string` - _required_
- **file** - `string` - _required_

Add a run to the benchmark instance. The `id` must be unique and `file` must be the absolute path to the script.

#### Instance Events

##### `start`

Emitted at the beginning of the microtask queued during the constructor. It will not be emitted if no runs have been added.

##### `end`

Emitted at the end of the microtask after all runs have been executed.

##### `error`

Emitted whenever an error is thrown. Will return the thrown error.

```js
const [error] = await once(benchmark, "error");
```

### Type: `FunctionWithContext<Context>`

- `(context: Context, ...extraArgs: unknown[]) => void | Promise<void>`

### Interface: `Meta`

- **title** - `string` - _optional_
- **description** - `string` - _optional_

## Testing

Execute tests using `pnpm test`
