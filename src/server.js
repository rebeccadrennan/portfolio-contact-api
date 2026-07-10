'use strict';

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

let server;

const onListening = () => {
  const address = server.address();
  const bind = typeof address === 'string' ? address : `${address.address}:${address.port}`;

  // eslint-disable-next-line no-console
  console.log(`Server running on ${bind} [${env.nodeEnv}]`);
};

server = env.host ? app.listen(env.port, env.host, onListening) : app.listen(env.port, onListening);
