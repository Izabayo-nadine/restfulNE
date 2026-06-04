import { body, param } from 'express-validator';

export const scheduleInspectionValidator = [
  body('fireExtinguisher').isMongoId(),
  body('inspectionDate')
    .notEmpty()
    .custom((value) => {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) throw new Error('Invalid inspection date');
      return true;
    }),
  body('inspectionTime').matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body('assignedInspector').optional().isMongoId(),
];

export const completeInspectionValidator = [
  param('id').isMongoId(),
  body('performedDate')
    .notEmpty()
    .custom((value) => {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) throw new Error('Invalid performed date');
      return true;
    }),
  body('result').trim().notEmpty(),
  body('notes').optional().trim(),
];
