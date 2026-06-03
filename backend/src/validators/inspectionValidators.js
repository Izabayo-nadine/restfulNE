import { body, param } from 'express-validator';
import { INSPECTION_STATUSES } from '../models/Inspection.js';

export const scheduleInspectionValidator = [
  body('fireExtinguisher').isMongoId().withMessage('Valid fire extinguisher ID is required'),
  body('inspectionDate').isISO8601().withMessage('Valid inspection date is required'),
  body('inspectionTime')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('Inspection time must be in HH:mm format (24-hour)'),
  body('assignedInspector').optional().isMongoId(),
];

export const completeInspectionValidator = [
  param('id').isMongoId().withMessage('Invalid inspection ID'),
  body('result').trim().notEmpty().withMessage('Inspection result is required'),
  body('notes').optional().trim().isLength({ max: 2000 }),
];

export const updateInspectionStatusValidator = [
  param('id').isMongoId(),
  body('status').isIn(INSPECTION_STATUSES).withMessage('Invalid status'),
];
