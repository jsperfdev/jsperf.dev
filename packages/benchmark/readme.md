# @jsperf.dev/benchmark

## Documentation

> Coming soon!

## Examples

### Available Examples:

- [for](./examples/for/)
- [async](./examples/async/)
- [sumOfSquares](./examples/sumOfSquares/)

### How to Run

- Set your current directory to `packages/benchmark/examples`
- Install dependencies (i.e. `pnpm install`)
  - The `examples` directory has its own `package.json` with `@jsperf.dev/benchmark` as a dependency. If you are testing out local changes to the benchmark application, don't forget to build it (`pnpm build`) and then link the dependency locally using [`pnpm link`](https://pnpm.io/cli/link).
- Use the `example` script and execute any of the examples listed above (i.e. `pnpm example for`)
