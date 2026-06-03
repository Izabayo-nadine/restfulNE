import { Router } from 'express';
import {
  inventoryReport,
  inspectionReport,
  complianceReport,
  maintenanceReport,
  exportReport,
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/inventory', inventoryReport);
router.get('/inspections', inspectionReport);
router.get('/compliance', complianceReport);
router.get('/maintenance', maintenanceReport);
router.get('/export', authorize('admin', 'inspector'), exportReport);

export default router;
