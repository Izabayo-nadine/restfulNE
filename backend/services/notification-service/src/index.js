import { loadEnv, createServiceApp, connectDB, createServiceLogger, notFound, errorHandler } from '@fems/shared';

loadEnv();
import routes from './routes/notificationRoutes.js';
import internalRoutes from './routes/internalRoutes.js';

const SERVICE = 'notification-service';
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 5005;
const logger = createServiceLogger(SERVICE);

const app = createServiceApp({ serviceName: SERVICE, logger });
app.use('/internal', internalRoutes);
app.use('/', routes);
app.use(notFound);
app.use(errorHandler(logger));

async function start() {
  await connectDB(SERVICE, logger);
  app.listen(PORT, () => logger.info(`Notification service http://localhost:${PORT}`));
}

start().catch((err) => {
  logger.error('Failed to start', err);
  process.exit(1);
});
