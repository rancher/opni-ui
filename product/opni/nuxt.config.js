import fs from 'fs';
import path from 'path';

const baseConfig = require('../../nuxt.config');

module.exports = {
  ...baseConfig,

  buildDir: baseConfig.dev ? 'product/opni/.nuxt' : 'product/opni/.nuxt-prod',

  buildModules: [
    ...baseConfig.buildModules,
    ['@nuxtjs/router', { path: 'product/opni' }]
  ],

  server: {
    https: (baseConfig.dev ? {
      key:  fs.readFileSync(path.resolve(__dirname, '../../server/server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, '../../server/server.crt'))
    } : null),
    port:      (baseConfig.dev ? 8008 : 80),
    host:      '0.0.0.0',
  },
};
