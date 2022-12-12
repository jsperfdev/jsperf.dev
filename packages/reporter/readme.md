# jsperf.dev/reporter

## Usage

```js
import reporter from "@jsperf.dev/reporter";
import benchmark from "@jsperf.dev/benchmark";

reporter(benchmark, { outDir: "benchmarks" });

benchmark.run("run1", path.resolve(__dirname, "benchmark-run.js"));
```
