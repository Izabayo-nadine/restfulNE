import { loadEnv, createServiceApp, connectDB, createServiceLogger, notFound, errorHandler } from '@fems/shared';

loadEnv();
import routes from './routes/extinguisherRoutes.js';
import internalRoutes from './routes/internalRoutes.js';

const SERVICE = 'extinguisher-service';
const PORT = process.env.EXTINGUISHER_SERVICE_PORT || 5002;
const logger = createServiceLogger(SERVICE);

const app = createServiceApp({ serviceName: SERVICE, logger });
// Internal routes before JWT-protected public routes (same path prefix would hit protect first)
app.use('/internal/extinguishers', internalRoutes);
app.use('/', routes);
app.use(notFound);
app.use(errorHandler(logger));

async function start() {
  await connectDB(SERVICE, logger);
  app.listen(PORT, () => logger.info(`Extinguisher service http://localhost:${PORT}`));
}

start().catch((err) => {
  logger.error('Failed to start', err);
  process.exit(1);
});
