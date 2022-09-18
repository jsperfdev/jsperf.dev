import tap from "tap";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import benchmark, { setLogger } from "../../src/index";
import { Benchmark } from "@jsperf.dev/core";
import pino from "pino";
import crypto from "node:crypto";

// Intentionally not executing these tests in parallel since all the tests operate on the default `benchmark` instance

const scriptDir = path.join(os.tmpdir(), "benchmark:unit-");
const scriptPath = path.join(scriptDir, "script.js");

tap.before(async () => {
  await fs.mkdir(scriptDir, { recursive: true });
  await fs.writeFile(scriptPath, "module.exports = () => void null");
});

tap.teardown(async () => {
  await fs.rm(scriptDir, { recursive: true });
});

tap.beforeEach(async (t) => {
  const outputPath = setLoggerOutputFile(t.name);
  t.context.outputPath = outputPath;
});

tap.afterEach(async (t) => {
  await fs.rm(t.context.outputPath);
});

function setLoggerOutputFile(name: string) {
  const outputPath = path.join(
    os.tmpdir(),
    crypto.createHash("md5").update(name).digest("hex")
  );
  setLogger(pino(pino.destination(outputPath)));
  return outputPath;
}

tap.test("default export is an instance of Benchmark class", (t) => {
  t.ok(benchmark instanceof Benchmark);
  t.end();
});

tap.test("start event logs default information", async (t) => {
  benchmark.emit("start");

  const output = await fs.readFile(t.context.outputPath, "utf8");
  const [l1, l2] = output
    .trim()
    .split("\n")
    .map((l) => JSON.parse(l));
  t.equal(l1.script, process.argv[1]);
  t.equal(l2.samples, 10);
  t.end();
});

tap.test("start event logs meta information and samples", async (t) => {
  const TITLE = "title";
  const DESCRIPTION = "description";
  const SAMPLES = 1;

  benchmark.meta = {
    title: TITLE,
    description: DESCRIPTION,
  };

  benchmark.samples = SAMPLES;

  benchmark.emit("start");

  const output = await fs.readFile(t.context.outputPath, "utf8");
  const [l1, l2, l3] = output
    .trim()
    .split("\n")
    .map((l) => JSON.parse(l));
  t.equal(l1.script, TITLE);
  t.equal(l2.description, DESCRIPTION);
  t.equal(l3.samples, SAMPLES);
  t.end();
});

tap.test("error event logs error", async (t) => {
  const MESSAGE = "message";
  benchmark.emit("error", new Error(MESSAGE));
  const output = await fs.readFile(t.context.outputPath, "utf8");
  const [l1] = output
    .trim()
    .split("\n")
    .map((l) => JSON.parse(l));
  t.equal(l1.err.message, MESSAGE);
  t.end();
});

tap.test("end event logs results", async (t) => {
  const results = [
    ["run1", [{ duration: 0 }]],
    ["run2", [{ duration: 0 }]],
  ];

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-ignore - override readonly
  benchmark.results = results;
  benchmark.emit("end");
  const output = await fs.readFile(t.context.outputPath, "utf8");
  const [l1] = output
    .trim()
    .split("\n")
    .map((l) => JSON.parse(l));
  t.same(l1.results, [
    { run: "run1", medianTime: 0 },
    { run: "run2", medianTime: 0 },
  ]);
  t.end();
});
