import { parentPort, workerData as _workerData } from "worker_threads";
import { parseJSONWithFunctions } from "./parse-json-with-functions.js";
import { stringifyJSONWithFunctions } from "./stringify-json-with-functions.js";
import type { WorkerData } from "./benchmark";
const workerData = _workerData as WorkerData;

async function execute() {
  const context = parseJSONWithFunctions(workerData.context);
  const script = await import(workerData.file);

  const results = [];

  for (let i = 0; i < workerData.samples; i++) {
    performance.mark("start");
    const result = await script.default(context);
    performance.mark("end");
    results.push(result);

    performance.measure(workerData.id, "start", "end");
  }

  const measures = performance.getEntriesByName(workerData.id);

  return { results, measures };
}

execute().then(({ results, measures }) => {
  parentPort?.postMessage(
    stringifyJSONWithFunctions({
      id: workerData.id,
      results,
      measures,
    })
  );
});
