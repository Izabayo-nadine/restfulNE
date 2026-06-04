import { Router } from 'express';
import { body } from 'express-validator';
import { internalOnly, validate, asyncHandler } from '@fems/shared';
import Inspection from '../models/Inspection.js';

const router = Router();
router.use(internalOnly);

router.post(
  '/delete-by-extinguishers',
  [body('extinguisherIds').isArray(), body('extinguisherIds.*').isMongoId()],
  validate,
  asyncHandler(async (req, res) => {
    const { extinguisherIds } = req.body;
    const result = await Inspection.deleteMany({ fireExtinguisher: { $in: extinguisherIds } });
    res.json({ success: true, data: { deletedCount: result.deletedCount } });
  })
);

export default router;
