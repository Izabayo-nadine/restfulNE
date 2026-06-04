import { Router } from 'express';
import { protect, authorize, validate, createServiceLogger } from '@fems/shared';
import * as ctrl from '../controllers/inspectionController.js';
import { attachLogger } from '../middleware/attachLogger.js';
import {
  scheduleInspectionValidator,
  completeInspectionValidator,
} from '../validators/inspectionValidators.js';
import { param } from 'express-validator';

const logger = createServiceLogger('inspection-service');
const router = Router();
router.use(protect);
router.use(attachLogger(logger));

router.get('/', ctrl.listInspections);
router.get('/:id', [param('id').isMongoId()], validate, ctrl.getInspection);
router.post(
  '/',
  authorize('admin', 'inspector', 'user'),
  scheduleInspectionValidator,
  validate,
  ctrl.scheduleInspection
);
router.patch('/:id/complete', authorize('inspector'), completeInspectionValidator, validate, ctrl.completeInspection);

export default router;
