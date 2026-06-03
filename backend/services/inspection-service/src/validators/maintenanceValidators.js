import { body, param } from 'express-validator';

export const logMaintenanceValidator = [
  body('fireExtinguisher').isMongoId(),
  body('actionTaken').trim().notEmpty(),
  body('maintenanceDate')
    .notEmpty()
    .custom((value) => {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) throw new Error('Invalid maintenance date');
      return true;
    }),
  body('issuesIdentified').optional({ values: 'falsy' }).isString().trim(),
  body('conditionNoted').optional({ values: 'falsy' }).isString().trim(),
  body('notesAndRecommendations').optional({ values: 'falsy' }).isString().trim(),
];

export const maintenanceIdParam = [param('id').isMongoId()];
