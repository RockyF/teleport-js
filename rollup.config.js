/**
 * Created by rockyl on 2018/5/29.
 */
import node_builtins from 'rollup-plugin-node-builtins'
import node_resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'

export default {
	input: 'src/index.js',
	output: {
		name: 'teleportjs',
		file: 'dist/teleport.js',
		format: 'umd'
	},
	plugins: [
		node_builtins(),
		commonjs({
			//exclude: ['node_modules/bytebuffer/**', 'node_modules/protobufjs/**', 'node_modules/query-string/**'],
		}),
		babel(),
		node_resolve(),
	],
};
