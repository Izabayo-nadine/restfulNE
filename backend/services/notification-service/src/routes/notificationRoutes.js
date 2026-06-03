import { Router } from 'express';
import { protect, validate } from '@fems/shared';
import { param } from 'express-validator';
import * as ctrl from '../controllers/notificationController.js';

const router = Router();
router.use(protect);
router.get('/', ctrl.listNotifications);
router.get('/unread-count', ctrl.unreadCount);
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/read', [param('id').isMongoId()], validate, ctrl.markAsRead);
export default router;
