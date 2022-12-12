import childProcess from "node:child_process";
import util from "node:util";
const exec = util.promisify(childProcess.exec);
export { exec };
