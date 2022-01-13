import { buildSync } from 'esbuild';
import fs from 'fs-extra';

fs.ensureDirSync('dist');
fs.emptyDirSync('dist');

const pkg = JSON.parse(fs.readFileSync('./package.json'));
const dependencies = Object.keys(pkg.dependencies);

buildSync({
  entryPoints: ['./src/index.ts'],
  outfile: './dist/index.js',
  format: 'esm',
  target: 'node16',
  platform: 'node',
  bundle: true,
  external: dependencies,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  banner: {
    js: '#!/usr/bin/env node',
  },
});
