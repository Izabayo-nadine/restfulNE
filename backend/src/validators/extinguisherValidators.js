import { body, param } from 'express-validator';
import {
  EXTINGUISHER_TYPES,
  EXTINGUISHER_SIZES,
  EXTINGUISHER_STATUSES,
} from '../models/FireExtinguisher.js';

export const mongoIdParam = [param('id').isMongoId().withMessage('Invalid ID format')];

export const createExtinguisherValidator = [
  body('serialNumber').trim().notEmpty().withMessage('Serial number is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('type').isIn(EXTINGUISHER_TYPES).withMessage(`Type must be one of: ${EXTINGUISHER_TYPES.join(', ')}`),
  body('size').isIn(EXTINGUISHER_SIZES).withMessage(`Size must be one of: ${EXTINGUISHER_SIZES.join(', ')}`),
  body('installationDate').isISO8601().withMessage('Valid installation date is required'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
  body('status').optional().isIn(EXTINGUISHER_STATUSES).withMessage('Invalid status'),
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
