import {
  FunctionWithContext,
  __dirname,
  JSONStringify,
  JSONParse,
  WorkerResult,
} from "./utils.js";
import path from "path";
import { Worker } from "worker_threads";
import { median } from "simple-statistics";
import pino from "pino";

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

export class Benchmark<Context> {
  public context: Context;
  public meta: Meta = {};

  private handlers: Handlers<Context>;
  private recordPerformance: boolean;
  private results: Map<string, Array<PerformanceEntry>>;
  private runs: Map<string, string>;
  private samples: number;
  private warmup: boolean;
  private logger: pino.Logger;

  constructor({
    warmup = true,
    samples = 10,
    loggerOptions = {
      transport: {
        target: "pino-pretty",
      },
    },
  }: {
    warmup?: boolean;
    samples?: number;
    loggerOptions?: pino.LoggerOptions;
  } = {}) {
    this.logger = pino(loggerOptions);

    this.context = {} as Context;

    this.handlers = {
      beforeAll: [],
      beforeEach: [],
      afterEach: [],
      afterAll: [],
    };
    this.recordPerformance = false;
    this.results = new Map();
    this.runs = new Map();
    this.samples = samples;
    this.warmup = warmup;

    queueMicrotask(async () => {
      if (Array.from(this.runs).length === 0) {
        this.logger.warn(
          "No benchmark runs found. To remove this warning, check for an unused `benchmark` instance from @jsperf.dev/benchmark"
        );
        return;
      }
      this.logger.info(
        `Executing Benchmark script ${this.meta.title || process.argv[1]}`
      );
      if (this.meta.description) {
        this.logger.info(`    Description: ${this.meta.description}`);
      }
      this.logger.info(`    Sample Size: ${this.samples}`);
      if (this.warmup) {
        this.recordPerformance = false;
        await this.executeRuns();
      }
      this.recordPerformance = true;
      await this.executeRuns();
    });
  }

  async executeRuns() {
    await this.executeHandlers(this.handlers.beforeAll);

    const runs = this.buildRuns();

    await Promise.all(runs);

    await this.executeHandlers(this.handlers.afterAll);

    if (this.recordPerformance) {
      this.logger.info(
        Array.from(this.results).flatMap(([key, performanceEntries]) => {
          return {
            Run: key,
            "Median Time (ms)": median(
              performanceEntries.map((enty) => enty.duration)
            ),
          };
        })
      );
    }
  }

  beforeAll(func: FunctionWithContext<Context>) {
    this.handlers.beforeAll.push(func);
  }

  beforeEach(func: FunctionWithContext<Context>) {
    this.handlers.beforeEach.push(func);
  }

  afterEach(func: FunctionWithContext<Context>) {
    this.handlers.afterEach.push(func);
  }

  afterAll(func: FunctionWithContext<Context>) {
    this.handlers.afterAll.push(func);
  }

  private executeHandlers(handlers: HandlerList<Context>, data?: unknown) {
    return Promise.all(handlers.map((handler) => handler(this.context, data)));
  }

  private buildRuns() {
    return Array.from(this.runs).map(async ([id, file]) => {
      if (!this.results.get(id)) {
        this.results.set(id, []);
      }

      await this.executeHandlers(this.handlers.beforeEach);

      const workerResultRaw = await this.executeRun([id, file]);

      if (this.recordPerformance) {
        const workerResult = JSONParse(workerResultRaw) as WorkerResult;

        for (const result of workerResult.results) {
          await this.executeHandlers(this.handlers.afterEach, result);
        }

        this.results.set(workerResult.id, workerResult.measures);
      }
    });
  }

  private executeRun([id, file]: [id: string, file: string]) {
    return new Promise<string>((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, "./worker.js"), {
        workerData: {
          id,
          file,
          context: JSONStringify(this.context),
          samples: this.samples,
        },
      });
      worker.on("message", resolve);
      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  }

  run(id: string, file: string) {
    if (this.runs.has(id)) {
      throw new Error(`Run with id ${id} already exists.`);
    }
    this.runs.set(id, file);
  }
}
