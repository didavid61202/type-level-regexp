import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['**/*.{test,test-d,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    typecheck: {
      ignoreSourceErrors: true,
    },
    coverage: {
      '100': true,
      include: ['src'],
      reporter: ['text', 'json', 'html'],
    },
  },
})
