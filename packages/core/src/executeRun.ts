import { parseJSONWithFunctions } from "./parse-json-with-functions";
import type { RunData } from "./benchmark";

export async function executeRun(runData: RunData) {
  const context = parseJSONWithFunctions(runData.context);
  const script = await import(runData.file);

  const results = [];

  for (let i = 0; i < runData.samples; i++) {
    performance.mark("start");
    const result = await script.default(context);
    performance.mark("end");
    results.push(result);

    performance.measure(runData.id, "start", "end");
  }

  const measures = performance.getEntriesByName(runData.id);

  return { results, measures };
}
