'use strict';

const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

const app = require('./app');
const env = require('./config/env');

if (env.missing.length > 0 && env.nodeEnv !== 'test') {
  // eslint-disable-next-line no-console
  console.warn(`Missing environment variables: ${env.missing.join(', ')}`);
}

if (!process.env.PORT && env.nodeEnv !== 'test') {
  // eslint-disable-next-line no-console
  console.warn('PORT is not set; defaulting to 3000.');
}

if (env.nodeEnv !== 'test') {
  // eslint-disable-next-line no-console
  console.log(`Allowed CORS origins: ${env.allowedOrigins.join(', ')}`);
}

app.listen(env.port, env.host, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on ${env.host}:${env.port} [${env.nodeEnv}]`);
});
