'use strict';
import benchmark from "../build/index.js";

benchmark.run('1sec', async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
})

benchmark.run('2sec', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
})

benchmark.run('3sec', async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
})