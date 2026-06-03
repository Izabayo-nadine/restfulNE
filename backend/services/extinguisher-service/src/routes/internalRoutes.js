import { Router } from 'express';
import { param } from 'express-validator';
import { internalOnly, validate, asyncHandler, AppError } from '@fems/shared';
import FireExtinguisher from '../models/FireExtinguisher.js';

const router = Router();
router.use(internalOnly);

router.get(
  '/:id',
  [param('id').isMongoId()],
  validate,
  asyncHandler(async (req, res) => {
    const item = await FireExtinguisher.findById(req.params.id);
    if (!item) throw new AppError('Not found', 404);
    res.json({ success: true, data: item });
  })
);

export default router;
