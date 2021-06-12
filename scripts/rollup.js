const rollup = require('rollup')
const fs = require('fs')
const resolve = require('@rollup/plugin-node-resolve').default
const svelte = require('rollup-plugin-svelte')
const commonjs = require('@rollup/plugin-commonjs')
const css = require('rollup-plugin-css-only')

async function run(componentName) {
  const bundle = await rollup.rollup({
    input: `src/${componentName}.svelte`,
    plugins: [
      svelte({
        compilerOptions: {
          generate: "ssr",
        }
      }),
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      css({ output: 'ssr.css' }),
      commonjs(),
    ]
  });

  // or write the bundle to disk
  await bundle.write({
    format: "umd",
    dir: "../build",
    name: componentName,
  });

  return require(`../build/${componentName}.js`)
}

module.exports = run