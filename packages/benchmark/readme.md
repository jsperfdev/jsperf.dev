# @jsperf.dev/benchmark

## Documentation

> Coming soon!

## Examples

### Available Examples:

> Example results were executed on a 2019 MacBook Pro running macOS Monterey v12.1 with the following hardwar specs:
>
> - Processor: 2.4 GHz 8-Core Intel Core i9
> - Memory: 32 GB 2667 MHz DDR4

- [for](./examples/for/)

```
Executing Benchmark script For Iteration
    Description: Iterating 100,000 items
    Sample Size: 10
┌─────────┬────────────┬────────────────────┐
│ (index) │    Run     │  Median Time (ms)  │
├─────────┼────────────┼────────────────────┤
│    0    │   'for'    │ 1.6437067985534668 │
│    1    │ 'forEach'  │ 2.688432216644287  │
│    2    │ 'for...of' │ 4.145325183868408  │
└─────────┴────────────┴────────────────────┘
```

- [async](./examples/async/)

```
Executing Benchmark script Async setTimeout
    Description: Demonstrating async run capabilities
    Sample Size: 10
┌─────────┬────────┬────────────────────┐
│ (index) │  Run   │  Median Time (ms)  │
├─────────┼────────┼────────────────────┤
│    0    │ '1sec' │ 1001.4823122024536 │
│    1    │ '2sec' │ 2002.0258412361145 │
│    2    │ '3sec' │ 3001.2687368392944 │
└─────────┴────────┴────────────────────┘
```

- [sumOfSquares](./examples/sumOfSquares/)

```
Executing Benchmark script Sum of Squares
    Description: Compare 3 seperate algorithms for calculating the sum of the square of all numbers from 0 to 1000
    Sample Size: 10
┌─────────┬─────────────┬────────────────────┐
│ (index) │     Run     │  Median Time (ms)  │
├─────────┼─────────────┼────────────────────┤
│    0    │ 'quick sum' │ 0.6498265266418457 │
│    1    │  'forEach'  │ 0.8894696235656738 │
│    2    │  'reduce'   │ 0.631777286529541  │
└─────────┴─────────────┴────────────────────┘
```

### How to Run

- Set your current directory to `packages/benchmark/examples`
- Install dependencies (i.e. `pnpm install`)
  - The `examples` directory has its own `package.json` with `@jsperf.dev/benchmark` as a dependency. If you are testing out local changes to the benchmark application, don't forget to build it (`pnpm build`) and then link the dependency locally using [`pnpm link`](https://pnpm.io/cli/link).
- Use the `example` script and execute any of the examples listed above (i.e. `pnpm example for`)
