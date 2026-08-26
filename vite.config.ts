/// <reference types="vitest/config" />

import path from 'node:path';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        ref: true,
        titleProp: true,
      },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    watch: {
      ignored: ['**/coverage/**'],
    },
  },
  test: {
    coverage: {
      exclude: ['src/main.tsx', 'src/assets/**', 'src/constant/mainKeys.ts', 'scripts/**'],
      provider: 'v8',
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
    environment: 'jsdom',
    exclude: ['**/node_modules/**', 'e2e/**'],
    globals: true,
    resolveSnapshotPath: (testPath, snapExtension) =>
      path.join(path.dirname(testPath), 'snapshots', `${path.basename(testPath)}${snapExtension}`),
    setupFiles: ['./src/test/setup.ts'],
  },
});
