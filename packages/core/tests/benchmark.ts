import fs from "node:fs/promises";
import path from "node:path";
import tap from "tap";
import {
  Benchmark,
  NonZeroExitCodeError,
  RunIDConflictError,
} from "../src/benchmark";
import os from "node:os";
import { once } from "node:events";
import sinon from "sinon";

const scriptDir = path.join(os.tmpdir(), "core-");
const scriptPath = path.join(scriptDir, "script.js");

tap.plan(6);

tap.before(async () => {
  await fs.mkdir(scriptDir, { recursive: true });
  await fs.writeFile(scriptPath, "module.exports = () => void null");
});

tap.teardown(async () => {
  await fs.rm(scriptDir, { recursive: true });
});

tap.test("context and meta properties should have correct defaults", (t) => {
  const benchmark = new Benchmark();
  t.strictSame(benchmark.context, {});
  t.strictSame(benchmark.meta, {
    title: process.argv[1],
  });
  t.end();
});

tap.test("should not emit start event if no runs are added", async (t) => {
  const benchmark = new Benchmark();
  benchmark.on("start", () => {
    t.fail();
  });
  await benchmark.start();
  t.pass();
});

tap.test("should error when a run is added with a non-unique id", (t) => {
  const benchmark = new Benchmark({
    samples: 1,
    warmup: false,
  });
  benchmark.on("error", (error) => {
    t.ok(error instanceof RunIDConflictError);
    t.strictSame(error.message, "Run with id x already exists.");
    t.end();
  });
  benchmark.run("x", scriptPath);
  benchmark.run("x", scriptPath);
});

tap.test("lifecycle methods are executed in order", async (t) => {
  const sandbox = sinon.createSandbox();
  const benchmark = new Benchmark({
    samples: 1,
    warmup: false,
  });

  const beforeAll = sandbox.spy();
  const beforeEach = sandbox.spy();
  const afterEach = sandbox.spy();
  const afterAll = sandbox.spy();

  benchmark.beforeAll(beforeAll);
  benchmark.beforeEach(beforeEach);
  benchmark.afterEach(afterEach);
  benchmark.afterAll(afterAll);

  benchmark.run("x", scriptPath);
  await benchmark.start();

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
  const sandbox = sinon.createSandbox();
  const benchmark = new Benchmark({
    samples: 1,
    warmup: true,
  });

  const executeRunsSpy = sandbox.spy(benchmark as any, "executeRuns"); // eslint-disable-line @typescript-eslint/no-explicit-any

  benchmark.run("x", scriptPath);
  await benchmark.start();

  t.ok(executeRunsSpy.calledTwice);
  executeRunsSpy.restore();
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
  });
  benchmark.run("x", failureScriptPath);
  benchmark.start();
  const [error] = await once(benchmark, "error");
  t.ok(error instanceof NonZeroExitCodeError);
  t.strictSame(error.message, "Worker stopped with non-zero exit code: 1");

  await fs.rm(failureScriptPath);
  t.end();
});
