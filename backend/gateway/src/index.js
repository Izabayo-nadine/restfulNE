import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.js';

const PORT = process.env.GATEWAY_PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  extinguisher: process.env.EXTINGUISHER_SERVICE_URL || 'http://localhost:5002',
  inspection: process.env.INSPECTION_SERVICE_URL || 'http://localhost:5003',
  report: process.env.REPORT_SERVICE_URL || 'http://localhost:5004',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5005',
};

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Internal-Key'],
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { success: false, message: 'Too many requests' },
  })
);

app.get('/health', async (_req, res) => {
  const checks = await Promise.all(
    Object.entries(SERVICES).map(async ([name, url]) => {
      try {
        const r = await fetch(`${url}/health`);
        const ok = r.ok;
        return { name, url, status: ok ? 'up' : 'down' };
      } catch {
        return { name, url, status: 'down' };
      }
    })
  );
  const allUp = checks.every((c) => c.status === 'up');
  res.status(allUp ? 200 : 503).json({
    success: allUp,
    service: 'FEMS API Gateway',
    architecture: 'microservices',
    services: checks,
  });
});

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'FEMS Microservices API',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      tryItOutEnabled: true,
    },
  })
);
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

function createServiceProxy(target, pathRewrite) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    proxyTimeout: 30000,
    timeout: 30000,
    ...(pathRewrite && { pathRewrite }),
    onProxyReq: (proxyReq, req) => {
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
    },
    onError: (err, req, res) => {
      console.error('[gateway] proxy error', req.method, req.url, err.message);
      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          message:
            'Service unavailable. Restart backend (npm run dev) and ensure all microservices are running.',
        });
      }
    },
  });
}

// Gateway strips matched prefix; each microservice serves routes from /
app.use('/api/v1/auth', createServiceProxy(SERVICES.auth));
app.use('/api/v1/extinguishers', createServiceProxy(SERVICES.extinguisher));
app.use('/api/v1/inspections', createServiceProxy(SERVICES.inspection));
app.use(
  '/api/v1/maintenance',
  createServiceProxy(SERVICES.inspection, {
    '^/(.*)': '/maintenance/$1',
    '^/?$': '/maintenance',
  })
);
app.use('/api/v1/reports', createServiceProxy(SERVICES.report));
app.use('/api/v1/notifications', createServiceProxy(SERVICES.notification));

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found on gateway' }));

app.listen(PORT, () => {
  console.log(`FEMS API Gateway http://localhost:${PORT}`);
  console.log(`Swagger http://localhost:${PORT}/api-docs`);
  console.log('Microservices:', SERVICES);
});
