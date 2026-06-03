import { Router } from 'express';
import {
  listNotifications,
  markAsRead,
  markAllRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';
import { param } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.get('/', listNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', [param('id').isMongoId()], validate, markAsRead);

export default router;
