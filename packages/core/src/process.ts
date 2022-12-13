import { executeRun } from "./executeRun";
import { stringifyJSON } from "./stringify-json";
import type { RunData } from "./benchmark";

process.on("message", (_runData) => {
  const runData = _runData as RunData;

  executeRun(runData).then(({ results, measures }) => {
    process.send?.(
      stringifyJSON({
        id: runData.id,
        results,
        measures,
      })
    );
    process.disconnect();
  });
});
