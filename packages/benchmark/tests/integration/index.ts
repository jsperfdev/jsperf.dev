import tap from "tap";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { exec } from "../utils/exec";

let tmpPath: string;

const scriptDir = path.join(os.tmpdir(), "benchmark-integration");
const scriptPath = path.join(scriptDir, "script.js");

tap.before(async () => {
  await fs.mkdir(scriptDir, { recursive: true });
  await fs.writeFile(scriptPath, "module.exports = () => void null");
});

tap.teardown(async () => {
  await fs.rm(scriptDir, { recursive: true });
});

tap.beforeEach(async () => {
  tmpPath = path.join(os.tmpdir(), `tmp-${process.hrtime()}`);
});

tap.test("should log title, description, samples, and runs", async (t) => {
  await exec("node tests/fixtures/basic-log-output/benchmark.ts", {
    env: {
      ...process.env,
      NODE_OPTIONS: "-r ts-node/register --no-warnings",
      __TEST_TMP_PATH: tmpPath,
      __TEST_SCRIPT_PATH: scriptPath,
    },
  });

  const output = await fs.readFile(tmpPath, "utf8");
  const [l1, l2, l3, l4] = output
    .trim()
    .split("\n")
    .map((l) => JSON.parse(l));
  t.equal(l1.script, "title");
  t.equal(l2.description, "description");
  t.equal(l3.samples, 1);
  t.equal(l4.results[0].run, "run1");
  t.equal(l4.results[1].run, "run2");
  t.end();
});
