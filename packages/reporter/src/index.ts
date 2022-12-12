import { Benchmark } from "@jsperf.dev/core";
import path from "node:path";
import fs from "node:fs";

export interface ReporterOptions {
  outDir?: string;
}

function reporter<Context>(
  benchmark: Benchmark<Context>,
  { outDir = "/" }: ReporterOptions = {}
) {
  benchmark.on("end", () => {
    fs.writeFileSync(
      path.join(outDir, "results.json"),
      JSON.stringify({
        runResults: Array.from(benchmark.results.entries()).map(([k, v]) => ({
          run: k,
          results: v,
        })),
      })
    );
  });
}

export default reporter;
