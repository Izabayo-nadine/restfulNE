import { loadEnv, createServiceApp, connectDB, createServiceLogger, notFound, errorHandler } from '@fems/shared';

loadEnv();
import inspectionRoutes from './routes/inspectionRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import internalRoutes from './routes/internalRoutes.js';

const SERVICE = 'inspection-service';
const PORT = process.env.INSPECTION_SERVICE_PORT || 5003;
const logger = createServiceLogger(SERVICE);

const app = createServiceApp({ serviceName: SERVICE, logger });
app.use('/internal/inspections', internalRoutes);
// Maintenance must be registered before inspection `GET /:id` (otherwise "maintenance" is treated as an id)
app.use('/maintenance', maintenanceRoutes);
app.use('/', inspectionRoutes);
app.use(notFound);
app.use(errorHandler(logger));

async function start() {
  await connectDB(SERVICE, logger);
  app.listen(PORT, () => logger.info(`Inspection service http://localhost:${PORT}`));
}

start().catch((err) => {
  logger.error('Failed to start', err);
  process.exit(1);
});
