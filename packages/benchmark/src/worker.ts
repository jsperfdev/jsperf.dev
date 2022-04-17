import { parentPort, workerData as _workerData } from "worker_threads";
import { JSONParse, JSONStringify, WorkerData } from "./utils.js";
const workerData = _workerData as WorkerData;

const context = JSONParse(workerData.context);
const module = await import(workerData.file);
const results = [];

for (let i = 0; i < workerData.samples; i++) {
  performance.mark("start");
  const result = await module.default(context);
  performance.mark("end");
  results.push(result);

  performance.measure(workerData.id, "start", "end");
}

const measures = performance.getEntriesByName(workerData.id);

parentPort?.postMessage(
  JSONStringify({
    id: workerData.id,
    results,
    measures,
  })
);
