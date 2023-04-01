import { defineBuildConfig } from 'unbuild'
export default defineBuildConfig({
  declaration: true,
  rollup: { emitCJS: true },
  externals: ['type-level-regexp'],
})
