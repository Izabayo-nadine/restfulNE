import { body } from 'express-validator';

export const registerValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
];

export const loginValidator = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export const updateProfileValidator = [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('email').optional().trim().isEmail().normalizeEmail(),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty(),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/[a-z]/).matches(/[A-Z]/).matches(/[0-9]/),
];

export const createInspectorValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
];

export const forgotPasswordValidator = [body('email').trim().isEmail().normalizeEmail()];
export const resetPasswordValidator = [
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 8 }).matches(/[a-z]/).matches(/[A-Z]/).matches(/[0-9]/),
];
