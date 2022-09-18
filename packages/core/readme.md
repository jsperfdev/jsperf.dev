# @jsperf.dev/core

## API

### Class: `Benchmark`

Extends: `EventEmitter`

#### `new Benchmark<Context>(options)`

Arguments:

- **options** - `object` - _optional_ - Default: `{}`
  - **warmup** - `boolean` - _optional_ - Default: `true`
  - **samples** - `number` - _optional_ - Default: `10`
  - **meta** - `Meta` - _optional_ - Default: `{}`

#### Instance Properties

##### `Benchmark.context`

- `Context`

A property that will be passed as the first argument to each lifecyle method and run script.

##### `Benchmark.meta`

- `Meta`

A property that represents general information about the benchmark instance. The title is defaulted to `process.argv[1]` (generally the path of the benchmark script).

##### `Benchmark.results`

- `Map<string, Array<PerformanceEntry>>`

This property is updated after the benchmark suite executes.

##### `Benchmark.samples`

- `number`

The number of samples the benchmark suite will run. This property can be modified at any point prior to calling `benchmark.start()`.

##### `Benchmark.warmup`

- `boolean`

When set to `true`, the warmup step will run. This property can be modified at any point prior to calling `benchmark.start()`.

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

##### `Benchmark.start()`

Returns: `Promise<void>`

Executes the benchmark suite. Resolves once it completes execution. Does **not** rethrow errors thrown during execution. Errors are emitted through the [`error`](#error) event.

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
