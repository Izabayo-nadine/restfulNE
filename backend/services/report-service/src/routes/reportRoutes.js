import { Router } from 'express';
import { protect, authorize } from '@fems/shared';
import * as ctrl from '../controllers/reportController.js';

const router = Router();
router.use(protect);
router.get('/inventory', ctrl.inventoryReport);
router.get('/inspections', ctrl.inspectionReport);
router.get('/compliance', ctrl.complianceReport);
router.get('/maintenance', ctrl.maintenanceReport);
router.get('/export', authorize('admin', 'inspector'), ctrl.exportReport);
export default router;
