import { EventEmitter } from "node:stream";
import { fork } from "node:child_process";
import { parseJSON } from "./parse-json";
import { stringifyJSON } from "./stringify-json";

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
    super(`Child process stopped with non-zero exit code: ${code}`);
  }
}

interface BenchmarkOptions {
  meta?: Meta;
  samples?: number;
  warmup?: boolean;
}

export class Benchmark<Context> extends EventEmitter {
  public context: Context;
  public meta: Meta;
  public readonly results: Map<string, Array<PerformanceEntry>>;
  public samples: number;
  public warmup: boolean;

  private handlers: Handlers<Context>;
  private recordPerformance: boolean;
  private runs: Map<string, string>;
  private controller: AbortController;

  constructor({
    meta = {},
    samples = 10,
    warmup = true,
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

      const resultRaw = await this.executeRun([id, file]);

      if (this.recordPerformance) {
        const result = parseJSON(resultRaw) as RunResult;

        for (const res of result.results) {
          await this.executeHandlers(this.handlers.afterEach, res);
        }

        this.results.set(result.id, result.measures);
      }
    });
  }

  private executeHandlers(handlers: HandlerList<Context>, data?: unknown) {
    return Promise.all(handlers.map((handler) => handler(this.context, data)));
  }

  private executeRun([id, file]: [id: string, file: string]) {
    return new Promise<string>((resolve, reject) => {
      const process = fork(require.resolve("./process"), {
        signal: this.controller.signal,
      });
      process.on("spawn", () => {
        process.send({
          id,
          file,
          context: stringifyJSON(this.context),
          samples: this.samples,
        });
      });
      process.on("message", resolve);
      process.on("error", reject);
      process.on("exit", (code) => {
        if (code !== null && code !== 0) reject(new NonZeroExitCodeError(code));
      });
    });
  }

  private async executeRuns() {
    await this.executeHandlers(this.handlers.beforeAll);

    const runs = this.buildRuns();

    await Promise.all(runs);

    await this.executeHandlers(this.handlers.afterAll);
  }
}
