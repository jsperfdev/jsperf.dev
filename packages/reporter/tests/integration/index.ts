import tap from "tap";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { exec } from "../utils/exec";

let tmpPath: string;

const scriptDir = path.join(os.tmpdir(), "reporter-integration");
const scriptPath = path.join(scriptDir, "script.js");

tap.before(async () => {
  await fs.mkdir(scriptDir, { recursive: true });
  await fs.writeFile(scriptPath, "module.exports = () => void null");
});

tap.teardown(async () => {
  await fs.rm(scriptDir, { recursive: true });
});

tap.beforeEach(async () => {
  tmpPath = await fs.mkdtemp(path.join(os.tmpdir(), `reporter-integration-`));
});

tap.test("should log title, description, samples, and runs", async (t) => {
  await exec("node tests/fixtures/basic-output/benchmark.ts", {
    env: {
      ...process.env,
      NODE_OPTIONS: "-r ts-node/register --no-warnings",
      __TEST_TMP_PATH: tmpPath,
      __TEST_SCRIPT_PATH: scriptPath,
    },
  });

  const results = await fs.readFile(path.join(tmpPath, "results.json"), "utf8");
  const resultsJSON = JSON.parse(results);

  t.match(resultsJSON, {
    runResults: [
      {
        run: "run1",
        results: [
          {
            name: "run1",
            entryType: "measure",
            detail: null,
            startTime: /\d+\.\d+/,
            duration: /\d+\.\d+/,
          },
        ],
      },
      {
        run: "run2",
        results: [
          {
            name: "run2",
            entryType: "measure",
            detail: null,
            startTime: /\d+\.\d+/,
            duration: /\d+\.\d+/,
          },
        ],
      },
    ],
  });

  t.end();
});
