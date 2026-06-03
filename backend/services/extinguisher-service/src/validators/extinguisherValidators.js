import { body, param } from 'express-validator';
import { EXTINGUISHER_TYPES, EXTINGUISHER_SIZES, EXTINGUISHER_STATUSES } from '../models/FireExtinguisher.js';

export const mongoIdParam = [param('id').isMongoId().withMessage('Invalid ID format')];

export const createExtinguisherValidator = [
  body('serialNumber').trim().notEmpty(),
  body('location').trim().notEmpty(),
  body('type').isIn(EXTINGUISHER_TYPES),
  body('size').isIn(EXTINGUISHER_SIZES),
  body('installationDate').isISO8601(),
  body('expiryDate').isISO8601(),
  body('status').optional().isIn(EXTINGUISHER_STATUSES),
];

export const updateExtinguisherValidator = [
  ...mongoIdParam,
  body('serialNumber').optional().trim().notEmpty(),
  body('location').optional().trim().notEmpty(),
  body('type').optional().isIn(EXTINGUISHER_TYPES),
  body('size').optional().isIn(EXTINGUISHER_SIZES),
  body('installationDate').optional().isISO8601(),
  body('expiryDate').optional().isISO8601(),
  body('status').optional().isIn(EXTINGUISHER_STATUSES),
];
