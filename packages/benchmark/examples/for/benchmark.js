import assert from "node:assert";
import benchmark from '@jsperf.dev/benchmark'
import { pathResolver } from "../utils/pathResolver.js";
import { createArray } from "../utils/createArray.js";

const N = 100000;

benchmark.meta = {
    title: "For Iteration",
    description: "Iterating 100,000 items"
};

benchmark.beforeAll(context => {
    Object.assign(context, {
        list: createArray(N),
        noop: (...args) => void args
    });
})

benchmark.beforeEach(({ list }) => {
    assert(list.length === N, `list has ${N} items`);
});

benchmark.afterEach(({ list }) => {
    assert(list.length === N, `list has ${N} items`);
});

benchmark.run('for', pathResolver(import.meta.url, './for.js'));
benchmark.run('forEach', pathResolver(import.meta.url, './forEach.js'));
benchmark.run('for...of', pathResolver(import.meta.url, './forOf.js'));
