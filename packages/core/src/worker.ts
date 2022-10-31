import { parentPort, workerData as _workerData } from "worker_threads";
import { executeRun } from "./executeRun";
import { stringifyJSONWithFunctions } from "./stringify-json-with-functions";
import type { RunData } from "./benchmark";
const runData = _workerData as RunData;

executeRun(runData).then(({ results, measures }) => {
  parentPort?.postMessage(
    stringifyJSONWithFunctions({
      id: runData.id,
      results,
      measures,
    })
  );
});
