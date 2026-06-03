import { Router } from 'express';
import {
  logMaintenance,
  listMaintenance,
  getMaintenance,
} from '../controllers/maintenanceController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { logMaintenanceValidator, maintenanceIdParam } from '../validators/maintenanceValidators.js';

const router = Router();

router.use(protect);

router.get('/', listMaintenance);
router.get('/:id', maintenanceIdParam, validate, getMaintenance);
router.post('/', authorize('inspector', 'admin'), logMaintenanceValidator, validate, logMaintenance);

export default router;
