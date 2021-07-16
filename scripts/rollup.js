import { rollup } from 'rollup'
import resolve from '@rollup/plugin-node-resolve'
import svelte from 'rollup-plugin-svelte'
import commonjs from '@rollup/plugin-commonjs'
import css from 'rollup-plugin-css-only'

async function run(componentName) {
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
