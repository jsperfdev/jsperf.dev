import reporter from "../../../src";
import benchmark from "@jsperf.dev/benchmark";

const scriptPath = process.env.__TEST_SCRIPT_PATH as string;
const tmpPath = process.env.__TEST_TMP_PATH as string;

reporter(benchmark, {
  outDir: tmpPath,
});

benchmark.meta = {
  title: "title",
  description: "description",
};

benchmark.samples = 1;
benchmark.warmup = false;

benchmark.run("run1", scriptPath);
benchmark.run("run2", scriptPath);
