import { body } from 'express-validator';

export const registerValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 100 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number'),
  body('role').optional().isIn(['admin', 'inspector', 'user']).withMessage('Invalid role'),
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const updateProfileValidator = [
  body('firstName').optional().trim().notEmpty().isLength({ max: 100 }),
  body('lastName').optional().trim().notEmpty().isLength({ max: 100 }),
  body('email').optional().trim().isEmail().normalizeEmail(),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/[a-z]/)
    .withMessage('New password must contain a lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('New password must contain an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain a number'),
];

export const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
];

export const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/[a-z]/)
    .withMessage('New password must contain a lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('New password must contain an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain a number'),
];
