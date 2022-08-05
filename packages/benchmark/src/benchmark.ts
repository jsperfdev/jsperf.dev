import pino from "pino";
import { EventEmitter } from "stream";
import { Worker } from "worker_threads";
import { median } from "./median";
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

export interface WorkerData {
  id: string;
  file: string;
  context: string;
  samples: number;
}

interface WorkerResult {
  id: string;
  results: Array<unknown>;
  measures: PerformanceEntryList;
}

export class Benchmark<Context> extends EventEmitter {
  public context: Context;
  public meta: Meta;

  private handlers: Handlers<Context>;
  private logger: pino.Logger;
  private recordPerformance: boolean;
  private results: Map<string, Array<PerformanceEntry>>;
  private runs: Map<string, string>;
  private samples: number;
  private warmup: boolean;

  constructor({
    logger = pino(),
    meta = {},
    samples = 10,
    warmup = true,
  }: {
    logger?: pino.Logger;
    meta?: Meta;
    samples?: number;
    warmup?: boolean;
  } = {}) {
    super();
    this.context = {} as Context;

    this.handlers = {
      beforeAll: [],
      beforeEach: [],
      afterEach: [],
      afterAll: [],
    };

    this.logger = logger;

    this.meta = meta;
    this.meta.title = this.meta.title ?? process.argv[1];

    this.recordPerformance = false;
    this.results = new Map();
    this.runs = new Map();
    this.samples = samples;
    this.warmup = warmup;

    queueMicrotask(async () => {
      try {
        if (Array.from(this.runs).length === 0) return;

        this.emit("start");

        this.logger.info({ script: this.meta.title });

        if (this.meta.description) {
          this.logger.info({ description: this.meta.description });
        }

        this.logger.info({ samples: this.samples });

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
    });
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
      this.emit("error", new Error(`Run with id ${id} already exists.`));
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
        ) as WorkerResult;

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
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  }

  private async executeRuns() {
    await this.executeHandlers(this.handlers.beforeAll);

    const runs = this.buildRuns();

    await Promise.all(runs);

    await this.executeHandlers(this.handlers.afterAll);

    if (this.recordPerformance) {
      this.logger.info({
        results: Array.from(this.results).flatMap(
          ([key, performanceEntries]) => {
            return {
              run: key,
              medianTime: median(
                performanceEntries.map((enty) => enty.duration)
              ),
            };
          }
        ),
      });
    }
  }
}
