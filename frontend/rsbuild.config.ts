import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: './index.html',
  },
  output: {
    assetPrefix: '/',
  },
  server: {
    port: 3000,
  },
  source: {
    entry: {
      index: './src/main.tsx',
    },
  },
});
