import { executeRun } from "./executeRun";
import { stringifyJSONWithFunctions } from "./stringify-json-with-functions";
import type { RunData } from "./benchmark";

process.on("message", (_runData) => {
  const runData = _runData as RunData;

  executeRun(runData).then(({ results, measures }) => {
    process.send?.(
      stringifyJSONWithFunctions({
        id: runData.id,
        results,
        measures,
      })
    );
  });
});
