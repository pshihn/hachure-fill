/* eslint-disable */

const { build } = require('esbuild');

build({
  entryPoints: ['./src/demo/demo.ts'],
  outfile: './demo-bundle.js',
  bundle: true,
  minify: true
});