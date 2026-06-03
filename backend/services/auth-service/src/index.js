import { loadEnv, createServiceApp, connectDB, createServiceLogger, notFound, errorHandler } from '@fems/shared';

loadEnv();
import routes from './routes/authRoutes.js';

const SERVICE = 'auth-service';
const PORT = process.env.AUTH_SERVICE_PORT || 5001;
const logger = createServiceLogger(SERVICE);

const app = createServiceApp({ serviceName: SERVICE, logger });
app.use('/', routes);

app.use(notFound);
app.use(errorHandler(logger));

async function start() {
  await connectDB(SERVICE, logger);
  app.listen(PORT, () => logger.info(`Auth service http://localhost:${PORT}`));
}

start().catch((err) => {
  logger.error('Failed to start', err);
  process.exit(1);
});
