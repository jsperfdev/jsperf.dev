import { parentPort, workerData } from "worker_threads";
import { JSONParse, JSONStringify } from "./utils.js";

const context = JSONParse(workerData.context);
const module = await import(workerData.file);

performance.mark("start");
const result = await module.default(context);
performance.mark("end");

performance.measure(workerData.id, "start", "end");

const measure = performance.getEntriesByName(workerData.id)[0];

parentPort?.postMessage(
  JSONStringify({
    id: workerData.id,
    result,
    measure,
  })
);
