#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { median } from "@jsperf.dev/math";
import * as asciichart from "asciichart";

async function cli() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log(`Missing command`);
    return;
  }
  const command = args[0];
  switch (command) {
    case "view": {
      const resultsPath = args.at(1);
      if (resultsPath === undefined) {
        console.log(
          "Must specify a results path. Usage: `jsperf view [result_path]`"
        );
        break;
      }
      try {
        const stat = fs.statSync(resultsPath);
        if (stat.isDirectory()) {
          const resultFiles = fs.readdirSync(resultsPath);
          const medians: Record<string, Array<number>> = {};
          for (const resultFile of resultFiles) {
            const [timestamp] = resultFile.split("-");
            const date = new Date(parseInt(timestamp));
            const resultJSONRaw = fs.readFileSync(
              path.join(resultsPath, resultFile),
              "utf-8"
            );
            const resultJSON = JSON.parse(resultJSONRaw);
            const medianPerRun = resultJSON.runResults.map(
              ({
                run,
                results,
              }: {
                run: string;
                results: Array<{ duration: number }>;
              }) => {
                return {
                  run,
                  median: median(results.map(({ duration }) => duration)),
                };
              }
            );
            for (const { run, median } of medianPerRun) {
              if (!medians[run]) {
                medians[run] = [];
              }
              medians[run].push(median * 1000);
            }
          }
          Object.entries(medians).forEach(([run, medianValues]) => {
            console.log(`Run: ${run} (milliseconds)`);
            console.log(asciichart.plot(medianValues, { height: 4 }));
          });
        } else {
          console.log(
            `Specified results path ${resultsPath} is not a directory`
          );
        }
      } catch (error) {
        console.error(error);
      }
      break;
    }
    case "help": {
      // todo
      console.log("Not implemented yet");
      break;
    }
    default: {
      console.log(`Unrecognized command ${command}`);
      return;
    }
  }
}

cli().catch((error) => {
  process.exitCode = 1;
  console.error(error);
});
