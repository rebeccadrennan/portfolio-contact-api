'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const swaggerUiDist = require('swagger-ui-dist');

const env = require('./config/env');
const meta = require('./config/meta');
const openApi = require('./docs/openapi');
const contactRoutes = require('./routes/contact.routes');
const errorHandler = require('./middleware/error.middleware');
const requestId = require('./middleware/requestId.middleware');

const app = express();
const startedAt = new Date();
const swaggerAssetsPath = swaggerUiDist.getAbsoluteFSPath();

app.disable('x-powered-by');
app.use(requestId);

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: env.frontendUrl,
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

// ─── Parsing & Compression ────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(compression());

// ─── Logging ──────────────────────────────────────────────────────────────────
if (env.nodeEnv !== 'test') {
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    service: meta.appName,
    version: meta.appVersion,
    status: 'ok',
    docs: '/docs',
    openApi: '/openapi.json',
    health: '/health',
  });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: meta.appName,
    version: meta.appVersion,
    environment: env.nodeEnv,
    uptimeSeconds: Number(process.uptime().toFixed(3)),
    startedAt: startedAt.toISOString(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/openapi.json', (_req, res) => {
  res.type('application/json').status(200).json(openApi);
});

app.use('/docs/assets', express.static(swaggerAssetsPath));

app.get('/docs/swagger-initializer.js', (_req, res) => {
  res.type('application/javascript').send(
    "window.ui = SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger-ui', presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset], layout: 'BaseLayout' });"
  );
});

app.get('/docs', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${meta.appName} API Docs</title>
    <link rel="stylesheet" href="/docs/assets/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/docs/assets/swagger-ui-bundle.js"></script>
    <script src="/docs/assets/swagger-ui-standalone-preset.js"></script>
    <script src="/docs/swagger-initializer.js"></script>
  </body>
</html>`);
});

app.use('/api/contact', contactRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Not found.' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
