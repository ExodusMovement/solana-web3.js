import alias from '@rollup/plugin-alias';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import path from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

const env = process.env.NODE_ENV;
const extensions = ['.js', '.ts'];

function generateConfig(configType, format) {
  const browser = configType === 'browser' || configType === 'react-native';
  const bundle = format === 'iife';

  const config = {
    input: 'src/index.ts',
    plugins: [
      alias({
        entries: [
          {
            find: /^\./, // Relative paths.
            replacement: '.',
            async customResolver(source, importer, options) {
              const resolved = await this.resolve(source, importer, {
                skipSelf: true,
                ...options,
              });
              if (resolved == null) {
                return;
              }
              const {id: resolvedId} = resolved;
              const directory = path.dirname(resolvedId);
              const moduleFilename = path.basename(resolvedId);
              const forkPath = path.join(
                directory,
                '__forks__',
                configType,
                moduleFilename,
              );
              const hasForkCacheKey = `has_fork:${forkPath}`;
              let hasFork = this.cache.get(hasForkCacheKey);
              if (hasFork === undefined) {
                hasFork = fs.existsSync(forkPath);
                this.cache.set(hasForkCacheKey, hasFork);
              }
              if (hasFork) {
                return forkPath;
              }
            },
          },
        ],
      }),
      commonjs(),
      nodeResolve({
        browser,
        dedupe: ['bn.js', 'buffer'],
        extensions,
        preferBuiltins: !browser,
      }),
      babel({
        exclude: '**/node_modules/**',
        extensions,
        babelHelpers: bundle ? 'bundled' : 'runtime',
        plugins: bundle ? [] : ['@babel/plugin-transform-runtime'],
      }),
      replace({
        preventAssignment: true,
        values: {
          'process.env.NODE_ENV': JSON.stringify(env),
          'process.env.BROWSER': JSON.stringify(browser),
          'process.env.npm_package_version': JSON.stringify(
            process.env.npm_package_version,
          ),
        },
      }),
    ],
    onwarn: function (warning, rollupWarn) {
      rollupWarn(warning);
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        throw new Error(
          'Please eliminate the circular dependencies listed ' +
            'above and retry the build',
        );
      }
    },
    treeshake: {
      moduleSideEffects: false,
    },
  };

  assert(browser && format === 'esm');

  switch (configType) {
    case 'browser':
    case 'react-native':
      switch (format) {
        case 'esm': {
          config.output = [
            {
              file: 'lib/index.browser.esm.js',
              format: 'es',
              sourcemap: false,
            },
          ];

          // Prevent dependencies from being bundled
          config.external = [
            /@babel\/runtime/,
            '@exodus/crypto/hash',
            '@exodus/crypto/secp256k1',
            '@exodus/crypto/curve25519',
            '@exodus/crypto/randomBytes',
            'readable-stream',
            '@solana/buffer-layout',
            'bn.js',
            'borsh',
            'bs58',
            'buffer',
            'http',
            'https',
            'jayson/lib/client/browser',
            'json-stable-stringify',
            'superstruct',
          ];

          break;
        }
        default: {
          throw new Error('Unexpected non-esm build');
        }
      }
      break;
    default:
      throw new Error(`Unknown configType: ${configType}`);
  }

  return config;
}

export default [
  // generateConfig('node'),
  generateConfig('browser', 'esm'),
  // generateConfig('browser', 'iife'),
  // generateConfig('react-native'),
];
