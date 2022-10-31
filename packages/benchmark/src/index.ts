import pino from "pino";
import { Benchmark } from "@jsperf.dev/core";
import { median } from "./median";

let logger = pino();

function setLogger(_logger: pino.Logger) {
  logger = _logger;
}

const benchmark = new Benchmark();

benchmark.on("start", () => {
  logger.info({ script: benchmark.meta.title });

  if (benchmark.meta.description) {
    logger.info({ description: benchmark.meta.description });
  }

  logger.info({ samples: benchmark.samples });
});

benchmark.on("error", (error) => {
  logger.error(error);
});

benchmark.on("end", () => {
  logger.info({
    results: Array.from(benchmark.results).flatMap(
      ([key, performanceEntries]) => {
        return {
          run: key,
          medianTime: median(performanceEntries.map((enty) => enty.duration)),
        };
      }
    ),
  });
});

queueMicrotask(() => {
  benchmark.start();
});

export { setLogger };
export { MODES } from "@jsperf.dev/core";
export default benchmark;
