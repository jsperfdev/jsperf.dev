import { parentPort, workerData } from "worker_threads";
import { JSONParse, JSONStringify } from "../utils.js";

const func = eval(workerData.func);
const context = JSONParse(workerData.context);

performance.mark("start");
const result = await func(context);
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
