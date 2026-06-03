import { loadEnv, createServiceApp, connectDB, createServiceLogger, notFound, errorHandler } from '@fems/shared';

loadEnv();
import routes from './routes/reportRoutes.js';

const SERVICE = 'report-service';
const PORT = process.env.REPORT_SERVICE_PORT || 5004;
const logger = createServiceLogger(SERVICE);

const app = createServiceApp({ serviceName: SERVICE, logger });
app.use('/', routes);
app.use(notFound);
app.use(errorHandler(logger));

async function start() {
  await connectDB(SERVICE, logger);
  app.listen(PORT, () => logger.info(`Report service http://localhost:${PORT}`));
}

start().catch((err) => {
  logger.error('Failed to start', err);
  process.exit(1);
});
