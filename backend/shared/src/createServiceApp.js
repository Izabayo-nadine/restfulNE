import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import morgan from 'morgan';

export function createServiceApp({ serviceName, logger, mountPath, router }) {
  const app = express();
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

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
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));

  app.get('/health', (_req, res) =>
    res.json({ success: true, service: serviceName, status: 'ok', type: 'microservice' })
  );

  if (mountPath && router) {
    app.use(mountPath, router);
  }

  return app;
}
