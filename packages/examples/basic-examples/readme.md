# examples

## Available Examples

- [for](./for/benchmark.js)
- [async](./async/benchmark.js)
- [sumOfSquares](./sumOfSquares/benchmark.js)

## How to Run

- Install dependencies (i.e. `pnpm install`)
  - This package uses [workspace]() resolution for dependencies such as `@jsperf.dev/benchmark`. If you are testing out local changes to the benchmark application, don't forget to build it (`pnpm build`) and then link the dependency locally using [`pnpm link`](https://pnpm.io/cli/link).
- Use the `example` script and execute any of the examples listed above (i.e. `pnpm example for`)
