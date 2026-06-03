import { Router } from 'express';
import {
  scheduleInspection,
  listInspections,
  getInspection,
  completeInspection,
} from '../controllers/inspectionController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  scheduleInspectionValidator,
  completeInspectionValidator,
} from '../validators/inspectionValidators.js';
import { param } from 'express-validator';

const router = Router();

router.use(protect);

router.get('/', listInspections);
router.get('/:id', [param('id').isMongoId()], validate, getInspection);
router.post('/', scheduleInspectionValidator, validate, scheduleInspection);
router.patch(
  '/:id/complete',
  authorize('inspector', 'admin'),
  completeInspectionValidator,
  validate,
  completeInspection
);

export default router;
