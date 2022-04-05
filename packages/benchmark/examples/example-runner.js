import fs from 'node:fs/promises';
import path from 'node:path';
import util from 'node:util';
const exec = util.promisify((await import('node:child_process')).exec);

if (process.argv.length > 3) {
    throw new Error(`Invalid number of arguments. Expected 1 argument, found ${process.argv.length - 2}`)
}

const example = process.argv[2];

let stat = await fs.stat(example);

if (!stat.isDirectory()) {
    throw new Error(`Example ${example} is not a directory.`);
}

const benchmarkScriptPath = path.join(example, 'benchmark.js');

stat = await fs.stat(benchmarkScriptPath);

if (!stat.isFile()) {
    throw new Error(`Cannot find benchmark.js in example ${example}`);
}

await exec(`node ${benchmarkScriptPath}`);