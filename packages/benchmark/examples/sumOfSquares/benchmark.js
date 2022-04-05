import assert from "node:assert";
import benchmark from '@jsperf.dev/benchmark'
import { pathResolver } from "../utils/pathResolver.js";
import { createArray } from "../utils/createArray.js";

const N = 10000

benchmark.meta = {
    title: 'Sum of Squares',
    description: 'Compare 3 seperate algorithms for calculating the sum of the square of all numbers from 0 to 1000'
}

benchmark.beforeAll((context) => {
    Object.assign(context, {
        list: createArray(N),
        square: (n) => n**2
    })
})

benchmark.beforeEach(({ list }) => {
    assert(list.length === N, `list has ${N} items`)
})

benchmark.afterEach(({ list }, sum) => {
    assert(list.length === N, `list has ${N} items`)
    assert(sum === 333283335000, `sum is ${sum}`)
})

benchmark.run('quick sum', pathResolver(import.meta.url, './quickSum.js'))
benchmark.run('forEach', pathResolver(import.meta.url, './forEach.js'))
benchmark.run('reduce', pathResolver(import.meta.url, './reduce.js'))