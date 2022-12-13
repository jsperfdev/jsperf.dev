const benchmark = require('@jsperf.dev/benchmark').default;
const reporter = require('@jsperf.dev/reporter').default;
const { assert } = require('node:console');
const path = require('node:path');

reporter(benchmark, {
    outDir: path.join(__dirname, 'results')
});

benchmark.meta = {
    title: "Fibonacci",
};

benchmark.samples = 10;
benchmark.warmup = false;

benchmark.beforeAll((context) => {
    Object.assign(context, {
        n: 100
    });
});

benchmark.afterEach((_, result) => {
    assert(result === 354224848179261915075n, `Unexpected result: ${result}`);
    // assert(result === 12586269025n, `Unexpected result: ${result}`);
})

benchmark.run('sum', path.join(__dirname, './sum.js'));
benchmark.run('matrix', path.join(__dirname, './matrix.js'));
benchmark.run('doubling', path.join(__dirname, './doubling.js'));