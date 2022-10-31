import { EventEmitter } from "node:stream";
import { Worker } from "node:worker_threads";
import { fork, spawn } from "node:child_process";
import { parseJSONWithFunctions } from "./parse-json-with-functions";
import { stringifyJSONWithFunctions } from "./stringify-json-with-functions";

type FunctionWithContext<Context> = (
  context: Context,
  ...extraArgs: unknown[]
) => void | Promise<void>;

type HandlerList<Context> = FunctionWithContext<Context>[];

interface Handlers<Context> {
  beforeAll: HandlerList<Context>;
  beforeEach: HandlerList<Context>;
  afterEach: HandlerList<Context>;
  afterAll: HandlerList<Context>;
}

interface Meta {
  title?: string;
  description?: string;
}

export interface RunData {
  id: string;
  file: string;
  context: string;
  samples: number;
}

interface RunResult {
  id: string;
  results: Array<unknown>;
  measures: PerformanceEntryList;
}

export class RunIDConflictError extends Error {
  constructor(id: string) {
    super(`Run with id ${id} already exists.`);
  }
}

export class NonZeroExitCodeError extends Error {
  constructor(code: number) {
    super(`Worker stopped with non-zero exit code: ${code}`);
  }
}

export const MODES = {
  workerThreads: Symbol("worker threads"),
  childProcesses: Symbol("child processes"),
} as const;

interface BenchmarkOptions {
  meta?: Meta;
  samples?: number;
  warmup?: boolean;
  mode?: typeof MODES[keyof typeof MODES];
}

export class Benchmark<Context> extends EventEmitter {
  public context: Context;
  public meta: Meta;
  public readonly results: Map<string, Array<PerformanceEntry>>;
  public samples: number;
  public warmup: boolean;
  public mode: typeof MODES[keyof typeof MODES];

  private handlers: Handlers<Context>;
  private recordPerformance: boolean;
  private runs: Map<string, string>;
  private controller: AbortController;

  constructor({
    meta = {},
    samples = 10,
    warmup = true,
    mode = MODES.workerThreads,
  }: BenchmarkOptions = {}) {
    super();
    this.context = {} as Context;

    this.handlers = {
      beforeAll: [],
      beforeEach: [],
      afterEach: [],
      afterAll: [],
    };

    this.meta = meta;
    this.meta.title = this.meta.title ?? process.argv[1];

    this.results = new Map();

    this.recordPerformance = false;
    this.runs = new Map();
    this.samples = samples;
    this.warmup = warmup;
    this.mode = mode;
    this.controller = new AbortController();
  }

  async start() {
    try {
      if (Array.from(this.runs).length === 0) return;

      this.emit("start");

      if (this.warmup) {
        this.recordPerformance = false;
        await this.executeRuns();
      }

      this.recordPerformance = true;
      await this.executeRuns();

      this.emit("end");
    } catch (error) {
      this.emit("error", error);
    }
  }

  afterAll(func: FunctionWithContext<Context>) {
    this.handlers.afterAll.push(func);
  }

  afterEach(func: FunctionWithContext<Context>) {
    this.handlers.afterEach.push(func);
  }

  beforeAll(func: FunctionWithContext<Context>) {
    this.handlers.beforeAll.push(func);
  }

  beforeEach(func: FunctionWithContext<Context>) {
    this.handlers.beforeEach.push(func);
  }

  run(id: string, file: string) {
    if (this.runs.has(id)) {
      this.emit("error", new RunIDConflictError(id));
    }
    this.runs.set(id, file);
  }

  private buildRuns() {
    return Array.from(this.runs).map(async ([id, file]) => {
      if (!this.results.get(id)) {
        this.results.set(id, []);
      }

      await this.executeHandlers(this.handlers.beforeEach);

      const workerResultRaw = await this.executeRun([id, file]);

      if (this.recordPerformance) {
        const workerResult = parseJSONWithFunctions(
          workerResultRaw
        ) as RunResult;

        for (const result of workerResult.results) {
          await this.executeHandlers(this.handlers.afterEach, result);
        }

        this.results.set(workerResult.id, workerResult.measures);
      }
    });
  }

  private executeHandlers(handlers: HandlerList<Context>, data?: unknown) {
    return Promise.all(handlers.map((handler) => handler(this.context, data)));
  }

  private executeRun([id, file]: [id: string, file: string]) {
    return new Promise<string>((resolve, reject) => {
      if (this.mode === MODES.workerThreads) {
        const worker = new Worker(require.resolve("./worker"), {
          workerData: {
            id,
            file,
            context: stringifyJSONWithFunctions(this.context),
            samples: this.samples,
          },
        });
        worker.on("message", resolve);
        worker.on("error", reject);
        worker.on("exit", (code) => {
          if (code !== 0) reject(new NonZeroExitCodeError(code));
        });
      } else if (this.mode === MODES.childProcesses) {
        const process = fork(require.resolve("./process"), {
          signal: this.controller.signal,
        });
        process.on("spawn", () => {
          process.send({
            id,
            file,
            context: stringifyJSONWithFunctions(this.context),
            samples: this.samples,
          });
        });
        process.on("message", resolve);
        process.on("error", reject);
        process.on("exit", (code) => {
          if (code !== null && code !== 0)
            reject(new NonZeroExitCodeError(code));
        });
      }
    });
  }

  private async executeRuns() {
    await this.executeHandlers(this.handlers.beforeAll);

    const runs = this.buildRuns();

    await Promise.all(runs);

    await this.executeHandlers(this.handlers.afterAll);
  }
}
