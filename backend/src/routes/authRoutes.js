import { Router } from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  listUsers,
  updateUserRole,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../validators/authValidators.js';
import { body, param } from 'express-validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration, login, and profile management
 */

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);

router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfileValidator, validate, updateProfile);
router.patch('/change-password', protect, changePasswordValidator, validate, changePassword);

router.get('/users', protect, authorize('admin'), listUsers);
router.patch(
  '/users/:id',
  protect,
  authorize('admin'),
  [param('id').isMongoId(), body('role').optional().isIn(['admin', 'inspector', 'user']), body('isActive').optional().isBoolean()],
  validate,
  updateUserRole
);

export default router;
