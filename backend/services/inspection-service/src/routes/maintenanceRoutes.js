import { Router } from 'express';
import { protect, authorize, validate, createServiceLogger } from '@fems/shared';
import * as ctrl from '../controllers/maintenanceController.js';
import { attachLogger } from '../middleware/attachLogger.js';
import { logMaintenanceValidator, maintenanceIdParam } from '../validators/maintenanceValidators.js';

const logger = createServiceLogger('inspection-service');
const router = Router();
router.use(protect);
router.use(attachLogger(logger));

router.get('/', ctrl.listMaintenance);
router.get('/:id', maintenanceIdParam, validate, ctrl.getMaintenance);
router.post('/', authorize('inspector', 'admin'), logMaintenanceValidator, validate, ctrl.logMaintenance);

export default router;
