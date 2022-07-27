const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

if (process.argv.length > 3) {
  throw new Error(
    `Invalid number of arguments. Expected 1 argument, found ${
      process.argv.length - 2
    }`
  );
}

const example = process.argv[2];

let stat = fs.statSync(example);

if (!stat.isDirectory()) {
  throw new Error(`Example ${example} is not a directory.`);
}

const benchmarkScriptPath = path.join(example, "benchmark.js");

stat = fs.statSync(benchmarkScriptPath);

if (!stat.isFile()) {
  throw new Error(`Cannot find benchmark.js in example ${example}`);
}

let stdout = execSync(`node ${benchmarkScriptPath}`);

console.log(stdout.toString("utf-8"));
