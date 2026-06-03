import { Router } from 'express';
import { body } from 'express-validator';
import { internalOnly, validate } from '@fems/shared';
import * as ctrl from '../controllers/notificationController.js';

const router = Router();
router.post(
  '/notify',
  internalOnly,
  [
    body('title').notEmpty(),
    body('message').notEmpty(),
    body('recipientIds').optional().isArray(),
    body('role').optional().isString(),
  ],
  validate,
  ctrl.internalNotify
);
export default router;
