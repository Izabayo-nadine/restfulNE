import { Router } from 'express';
import {
  createExtinguisher,
  listExtinguishers,
  getExtinguisher,
  updateExtinguisher,
  deleteExtinguisher,
} from '../controllers/extinguisherController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createExtinguisherValidator,
  updateExtinguisherValidator,
  mongoIdParam,
} from '../validators/extinguisherValidators.js';

const router = Router();

router.use(protect);

router.get('/', listExtinguishers);
router.get('/:id', mongoIdParam, validate, getExtinguisher);
router.post('/', authorize('admin', 'inspector'), createExtinguisherValidator, validate, createExtinguisher);
router.patch('/:id', authorize('admin', 'inspector'), updateExtinguisherValidator, validate, updateExtinguisher);
router.delete('/:id', authorize('admin'), mongoIdParam, validate, deleteExtinguisher);

export default router;
