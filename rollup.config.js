import commonjs from 'rollup-plugin-commonjs'
import hashbang from 'rollup-plugin-hashbang'
import resolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'
import { terser } from 'rollup-plugin-terser'
import replace from 'rollup-plugin-replace'
import babel from 'rollup-plugin-babel'
import packageJson from './package.json'

const external = [
  ...Object.keys(packageJson.dependencies),
  'fs',
  'http',
  'https',
  'path',
  'readline',
  'stream',
  'url',
  'util',
]

const plugins = [
  resolve({
    jsnext: true,
    main: true,
    module: true,
  }),
  json({
    indent: '  ',
    preferConst: true,
  }),
  commonjs({
    ignoreGlobal: false,
    preferBuiltins: true,
    sourceMap: false,
  }),
]

export default [
  // node
  {
    external,
    input: 'dist/src/index.js',
    output: [
      { file: packageJson.main, format: 'cjs' },
      { file: packageJson.module, format: 'es' },
    ],
    plugins,
  },
  // For modern browsers
  {
    input: 'dist/src/index.js',
    output: [{ name: 'allthings', file: packageJson.browser, format: 'umd' }],
    plugins: [
      resolve({
        browser: true,
        jsnext: true,
        main: true,
        module: true,
      }),
      json({
        preferConst: true,
      }),
      commonjs({
        ignoreGlobal: false,
        preferBuiltins: true,
        sourceMap: false,
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        // tslint:disable-next-line:object-literal-sort-keys
        'process.env': JSON.stringify([]),
      }),
      babel({
        //exclude: 'node_modules/**',
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                chrome: '58',
                ie: '11',
              },
              useBuiltIns: 'entry',
            },
          ],
        ],
      }),
      terser(),
    ],
  },
  // The SDKs CLI
  {
    external,
    input: 'dist/src/cli.js',
    output: [{ file: 'dist/cli.js', format: 'cjs' }],
    plugins: [hashbang(), ...plugins],
  },
]
