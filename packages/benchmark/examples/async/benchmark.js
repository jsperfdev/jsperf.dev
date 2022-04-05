import benchmark from '@jsperf.dev/benchmark'
import { pathResolver } from '../utils/pathResolver.js'

benchmark.meta = {
    title: "Async setTimeout",
    description: "Demonstrating async run capabilities"
};

benchmark.run('1sec', pathResolver(import.meta.url, './1sec.js'));
benchmark.run('2sec', pathResolver(import.meta.url, './2sec.js'));
benchmark.run('3sec', pathResolver(import.meta.url, './3sec.js'));
