import require from './require.ts'
const { rollup } = require('rollup')
const resolve = require('@rollup/plugin-node-resolve')
const svelte = require('rollup-plugin-svelte')
const css = require('rollup-plugin-css-only')

async function run(componentName: string) {
  const bundle = await rollup({
    input: `src/${componentName}.svelte`,
    plugins: [
      svelte({
        compilerOptions: {
          generate: 'ssr',
        },
      }),
      resolve({
        browser: true,
        dedupe: ['svelte'],
      }),
      css({ output: 'ssr.css' }),
    ],
  })

  // Write the bundle to disk
  await bundle.write({
    format: 'esm',
    dir: 'build',
    name: componentName,
  })

  return (await import(`../build/${componentName}.js`)).default
}

export default run
