'use strict';
import assert from "assert";
import benchmark from "../build/index.js";

const createArray = (length) => Array.from({ length }, (_, i) => i)

const N = 10000

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

benchmark.run('reduce', ({ list, square }) => {
    return list.reduce((acc, i) => acc += square(i), 0)
})

benchmark.run('forEach', ({ list, square }) => {
    let sum = 0;
    list.forEach(item => {
        sum += square(item)
    })
    return sum
})

benchmark.run('quick sum', ({ list, square }) => {
    let length = list.length;
    let sum = 0
    for (let i = 0; i < length / 2; i++) {
        sum += square(list[i]) + square(list[length - i - 1])
    }
    return sum
})

/**
 * node for.benchmark.js
 * 
 * | Run     | Time (ms) | Mem (gb) |
 * | ------- | --------- | -------- |
 * | for     |   0.56734 |  0.00057 |
 * | for..of |   0.78901 |  0.00011 | 
 * | forEach |   1.00234 |  0.00232 |
 */