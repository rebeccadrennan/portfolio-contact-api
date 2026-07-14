import compression from 'compression';
import cors, { type CorsOptions } from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUiDist from 'swagger-ui-dist';

import env from './config/env';
import meta from './config/meta';
import openApi from './docs/openapi';
import errorHandler from './middleware/error.middleware';
import requestId from './middleware/requestId.middleware';
import contactRoutes from './routes/contact.routes';

const app = express();
const startedAt = new Date();
const swaggerAssetsPath = swaggerUiDist.getAbsoluteFSPath();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(requestId);

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || env.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const error = new Error(`Origin not allowed by CORS: ${origin}`) as Error & { status?: number };
    error.status = 403;
    return callback(error);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ─── Parsing & Compression ────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(compression());

// ─── Logging ──────────────────────────────────────────────────────────────────
if (env.nodeEnv !== 'test') {
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: meta.appName,
    version: meta.appVersion,
    status: 'ok',
    docs: '/docs',
    openApi: '/openapi.json',
    health: '/health',
  });
});

app.get('/health', (_req: Request, res: Response) => {
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

app.get('/openapi.json', (_req: Request, res: Response) => {
  res.type('application/json').status(200).json(openApi);
});

app.use('/docs/assets', express.static(swaggerAssetsPath));

app.get('/docs/swagger-initializer.js', (_req: Request, res: Response) => {
  res.type('application/javascript').send(
    "window.ui = SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger-ui', presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset], layout: 'BaseLayout' });"
  );
});

app.get('/docs', (_req: Request, res: Response) => {
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
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Not found.' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
