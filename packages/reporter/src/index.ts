import { Benchmark } from "@jsperf.dev/core";
import path from "node:path";
import fs from "node:fs";

export interface ReporterOptions {
  outDir?: string;
}

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return typeof err === "object" && err instanceof Error;
}

export class SpecifiedOutputDirectoryDoesNotExist extends Error {
  constructor(outDir: string) {
    super(`Specified output directory \`${outDir}\` does not exist.`);
  }
}

export class SpecifiedOutputDirectoryIsNotADirectory extends Error {
  constructor(outDir: string) {
    super(`Specified output directory \`${outDir}\` is not a directory.`);
  }
}

function reporter<Context>(
  benchmark: Benchmark<Context>,
  { outDir = "/" }: ReporterOptions = {}
) {
  try {
    const stat = fs.statSync(outDir);
    if (!stat.isDirectory()) {
      throw new SpecifiedOutputDirectoryIsNotADirectory(outDir);
    }
  } catch (error) {
    if (error instanceof SpecifiedOutputDirectoryIsNotADirectory) {
      throw error;
    }
    if (isErrnoException(error)) {
      switch (error.code) {
        case "ENOENT":
          throw new SpecifiedOutputDirectoryDoesNotExist(outDir);
        default:
          throw error;
      }
    }

    throw error;
  }
  benchmark.on("end", () => {
    fs.writeFileSync(
      path.join(outDir, `${Date.now()}-results.json`),
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
