import { defineConfig } from 'tsdown'

export default defineConfig(
  {
    exports: true,
    tsconfig: 'tsconfig.json',
    entry: ['src/express/routes.ts', 'src/h3/routes.ts'],
    platform: 'node',
    outDir: 'dist',
    format: ['esm', 'cjs'],
    skipNodeModulesBundle: true,
  })
