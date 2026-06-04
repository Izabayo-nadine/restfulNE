import { Router } from 'express';
import { protect, authorize, validate } from '@fems/shared';
import * as ctrl from '../controllers/extinguisherController.js';
import {
  createExtinguisherValidator,
  updateExtinguisherValidator,
  mongoIdParam,
} from '../validators/extinguisherValidators.js';

const router = Router();
router.use(protect);

router.get('/', ctrl.listExtinguishers);
router.get('/:id', mongoIdParam, validate, ctrl.getExtinguisher);
router.post('/', authorize('admin'), createExtinguisherValidator, validate, ctrl.createExtinguisher);
router.patch('/:id', authorize('admin'), updateExtinguisherValidator, validate, ctrl.updateExtinguisher);
router.delete('/:id', authorize('admin'), mongoIdParam, validate, ctrl.deleteExtinguisher);

export default router;
