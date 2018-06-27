import commonjs from 'rollup-plugin-commonjs'
import hashbang from 'rollup-plugin-hashbang'
import resolve from 'rollup-plugin-node-resolve'
// import json from 'rollup-plugin-json'

const external = ['bottleneck', 'got', 'mem', 'readline', 'shortid']

const plugins = [
  hashbang(),
  resolve({
    extensions: ['.js'],
    jsnext: true,
    main: true,
    module: true,
  }),
  // json({
  //   indent: '  ',
  //   preferConst: true,
  // }),
  commonjs({
    extensions: ['.js'],
    ignoreGlobal: false,
    namedExports: { 'node_modules/shortid/index.js': ['generate'] },
    preferBuiltins: true,
    sourceMap: false,
  }),
]

export default [
  {
    external,
    input: 'dist/src/index.js',
    output: [
      { file: 'dist/lib.cjs.js', format: 'cjs' },
      { file: 'dist/lib.es.js', format: 'es' },
    ],
    plugins,
  },
  {
    external,
    input: 'dist/src/cli.js',
    output: [{ file: 'dist/cli.js', format: 'cjs' }],
    plugins,
  },
]
