import pino from "pino";
import benchmark, { setLogger } from "../../../src";
// import testingEnv from '../../utils/defaultTestingEnvVars';

const scriptPath = process.env.__TEST_SCRIPT_PATH as string;
const tmpPath = process.env.__TEST_TMP_PATH as string;

const isWindows = process.platform === "win32";

setLogger(
  pino(pino.destination({ dest: tmpPath, mode: isWindows ? 0o444 : 0o666 }))
);

benchmark.meta = {
  title: "title",
  description: "description",
};

benchmark.samples = 1;
benchmark.warmup = false;

benchmark.run("run1", scriptPath);
benchmark.run("run2", scriptPath);
