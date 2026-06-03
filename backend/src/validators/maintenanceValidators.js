import { body, param } from 'express-validator';

export const logMaintenanceValidator = [
  body('fireExtinguisher').isMongoId().withMessage('Valid fire extinguisher ID is required'),
  body('actionTaken').trim().notEmpty().withMessage('Action taken is required').isLength({ max: 500 }),
  body('maintenanceDate').isISO8601().withMessage('Valid maintenance date is required'),
  body('issuesIdentified').optional().trim().isLength({ max: 1000 }),
  body('notesAndRecommendations').optional().trim().isLength({ max: 2000 }),
];

export const maintenanceIdParam = [param('id').isMongoId().withMessage('Invalid maintenance ID')];
