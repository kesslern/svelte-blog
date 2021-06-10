import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-css-only';
import multiInput from 'rollup-plugin-multi-input';

export default {
	input: ['src/App.svelte', 'src/Index.svelte'],
	output: {
		format: 'esm',
		name: 'app',
		dir: 'build',
	},
	plugins: [
		multiInput(),
		svelte({
			compilerOptions: {
				dev: true,
				generate: "ssr",
			}
		}),
		css({ output: 'ssr.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
	],
	watch: {
		clearScreen: false
	}
};
