import fs from "node:fs/promises";
import path from "node:path";
import tap from "tap";
import { Benchmark } from "../src/benchmark";
import pino from "pino";
import os from "node:os";
import { once } from "node:events";
import sinon from "sinon";

const scriptPath = path.join(os.tmpdir(), "script.js");

tap.before(async () => {
  await fs.writeFile(scriptPath, "module.exports = () => void null");
});

let tmpPath: string;

tap.beforeEach(async () => {
  tmpPath = path.join(os.tmpdir(), `tmp-${process.hrtime()}`);
});

tap.teardown(async () => {
  await fs.rm(scriptPath);
});

tap.test("context and meta properties should have correct defaults", (t) => {
  const benchmark = new Benchmark();
  t.strictSame(benchmark.context, {});
  t.strictSame(benchmark.meta, {
    title: process.argv[1],
  });
  t.end();
});

tap.test("should log title, description, samples, and runs", async (t) => {
  const SAMPLES = 1;
  const TITLE = "title";
  const DESCRIPTION = "description";
  const benchmark = new Benchmark({
    samples: SAMPLES,
    warmup: false,
    meta: {
      title: TITLE,
      description: DESCRIPTION,
    },
    logger: pino(pino.destination(tmpPath)),
  });
  const RUN1 = "run1";
  const RUN2 = "run2";
  benchmark.run(RUN1, scriptPath);
  benchmark.run(RUN2, scriptPath);
  await once(benchmark, "end");
  const output = await fs.readFile(tmpPath, "utf8");
  const [l1, l2, l3, l4] = output
    .trim()
    .split("\n")
    .map((l) => JSON.parse(l));
  t.equal(l1.script, TITLE);
  t.equal(l2.description, DESCRIPTION);
  t.equal(l3.samples, SAMPLES);
  t.equal(l4.results[0].run, RUN1);
  t.equal(l4.results[1].run, RUN2);
  t.end();
});

tap.test("should not emit start event if no runs are added", async (t) => {
  const benchmark = new Benchmark();
  benchmark.on("start", () => {
    t.fail();
  });
  // this executes after the microtask queued during the Benchmark constructor
  queueMicrotask(() => {
    t.pass();
  });
});

tap.test("should error when a run is added with a non-unique id", async (t) => {
  const benchmark = new Benchmark({
    samples: 1,
    warmup: false,
    logger: pino(pino.destination(tmpPath)),
  });
  benchmark.run("x", scriptPath);
  t.throws(() => {
    benchmark.run("x", scriptPath);
  }, "Run with id x already exists.");
  await once(benchmark, "start");
  await once(benchmark, "end");
  t.end();
});

tap.test("lifecycle methods are executed in order", async (t) => {
  const benchmark = new Benchmark({
    samples: 1,
    warmup: false,
    logger: pino(pino.destination(tmpPath)),
  });

  const beforeAll = sinon.spy(() => void null);
  const beforeEach = sinon.spy(() => void null);
  const afterEach = sinon.spy(() => void null);
  const afterAll = sinon.spy(() => void null);

  benchmark.beforeAll(beforeAll);
  benchmark.beforeEach(beforeEach);
  benchmark.afterEach(afterEach);
  benchmark.afterAll(afterAll);

  benchmark.run("x", scriptPath);
  await once(benchmark, "end");

  t.ok(beforeAll.calledOnce);
  t.ok(beforeEach.calledOnce);
  t.ok(afterEach.calledOnce);
  t.ok(afterAll.calledOnce);

  t.ok(beforeAll.calledImmediatelyBefore(beforeEach));
  t.ok(beforeEach.calledImmediatelyBefore(afterEach));
  t.ok(afterEach.calledImmediatelyBefore(afterAll));

  t.end();
});

tap.test("warmup executes runs", async (t) => {
  const benchmark = new Benchmark({
    samples: 1,
    warmup: true,
    logger: pino(pino.destination(tmpPath)),
  });

  const executeRunsSpy = sinon.spy(benchmark as any, "executeRuns");

  benchmark.run("x", scriptPath);
  await once(benchmark, "end");

  t.ok(executeRunsSpy.calledTwice);
  t.end();
});

tap.test("bubbles up unsuccessful worker exits", async (t) => {
  const failureScriptPath = path.join(os.tmpdir(), "failureScript.js");
  await fs.writeFile(
    failureScriptPath,
    "module.exports = () => {process.exit(1)}"
  );

  const benchmark = new Benchmark({
    samples: 1,
    warmup: false,
    logger: pino(pino.destination(tmpPath)),
  });
  benchmark.run("x", failureScriptPath);

  const [error] = await once(benchmark, "error");
  t.strictSame(error, new Error("Worker stopped with exit code 1"));

  await fs.rm(failureScriptPath);
  t.end();
});
