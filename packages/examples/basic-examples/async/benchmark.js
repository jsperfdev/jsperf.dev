const { Benchmark } = require("@jsperf.dev/benchmark");
const path = require("node:path");

const benchmark = new Benchmark({ warmup: false, samples: 3 });

benchmark.meta = {
  title: "Async setTimeout",
  description: "Demonstrating async run capabilities",
};

benchmark.run("1sec", path.resolve(__dirname, "./1sec.js"));
benchmark.run("2sec", path.resolve(__dirname, "./2sec.js"));
benchmark.run("3sec", path.resolve(__dirname, "./3sec.js"));
