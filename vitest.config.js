import { defineConfig } from 'vitest/config'

export default defineConfig({
    test : {
        maxWorkers: 4,
        minWorkers: 2,
        maxConcurrency: 10
    }
})