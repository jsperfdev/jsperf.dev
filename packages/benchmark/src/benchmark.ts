import {
  FunctionWithContext,
  __dirname,
  JSONStringify,
  JSONParse,
} from "./utils.js";
import path from "path";
import { Worker } from "worker_threads";
import { median } from "simple-statistics";

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
  private context: Context;
  private runs: Map<string, FunctionWithContext<Context>>;
  private handlers: Handlers<Context>;
  private results: Map<string, Array<PerformanceEntry>>;
  public warmup: boolean;
  public meta: Meta = {};

  constructor({ warmup = true, samples = 10 } = {}) {
    this.warmup = warmup;
    this.context = {} as Context;
    this.runs = new Map();

    this.handlers = {
      beforeAll: [],
      beforeEach: [],
      afterEach: [],
      afterAll: [],
    };

    this.results = new Map();

    queueMicrotask(() => {
      console.log(
        `Executing Benchmark script ${this.meta.title || process.argv[1]}`
      );
      if (this.meta.description) {
        console.log(`    Description: ${this.meta.description}`);
      }
      console.log(`    Sample Size: ${samples}`);
      if (this.warmup) {
        this.executeRuns({ recordPerformance: false, samples });
      }
      this.executeRuns({ samples });
    });
  }

  async executeRuns({ recordPerformance = true, samples = 10 }) {
    for (let i = 0; i < samples; i++) {
      await this.executeHandlers(this.handlers.beforeAll);

      const runs = this.buildRuns({ recordPerformance });

      await Promise.all(runs);

      await this.executeHandlers(this.handlers.afterAll);
    }

    if (recordPerformance) {
      console.table(
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

  private buildRuns({ recordPerformance = true }) {
    return Array.from(this.runs).map(async ([id, func]) => {
      if (!this.results.get(id)) {
        this.results.set(id, []);
      }
      await this.executeHandlers(this.handlers.beforeEach);

      const workerResultRaw = await this.executeRun([id, func]);

      if (recordPerformance) {
        const workerResult = JSONParse(workerResultRaw);

        await this.executeHandlers(
          this.handlers.afterEach,
          workerResult.result
        );

        this.results.get(workerResult.id)?.push(workerResult.measure);
      }
    });
  }

  private executeRun([id, func]: [
    id: string,
    func: FunctionWithContext<Context>
  ]) {
    return new Promise<string>((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, "./worker/worker.js"), {
        workerData: {
          id,
          func: func.toString(),
          context: JSONStringify(this.context),
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

  run(id: string, func: FunctionWithContext<Context>) {
    if (this.runs.has(id)) {
      throw new Error(`Run with id ${id} already exists.`);
    }
    this.runs.set(id, func);
  }
}
