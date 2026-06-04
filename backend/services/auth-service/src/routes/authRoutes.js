import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  protect,
  authorize,
  validate,
  internalOnly,
} from '@fems/shared';
import * as ctrl from '../controllers/authController.js';
import * as otpCtrl from '../controllers/otpAuthController.js';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  createInspectorValidator,
} from '../validators/authValidators.js';

const router = Router();

// Internal (service-to-service) — register before authenticated routes
router.get('/internal/users/role/:role', internalOnly, ctrl.getUsersByRole);

router.post('/register/send-otp', registerValidator, validate, otpCtrl.registerSendOtp);
router.post('/register/verify-otp', [
  body('email').trim().isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
], validate, otpCtrl.registerVerifyOtp);
router.post('/login', loginValidator, validate, ctrl.login);
router.post('/logout', protect, ctrl.logout);
router.post('/forgot-password/send-otp', forgotPasswordValidator, validate, otpCtrl.forgotPasswordSendOtp);
router.post('/forgot-password/reset', [
  body('email').trim().isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/[a-z]/)
    .matches(/[A-Z]/)
    .matches(/[0-9]/),
], validate, otpCtrl.forgotPasswordReset);
router.get('/profile', protect, ctrl.getProfile);
router.patch('/profile', protect, updateProfileValidator, validate, ctrl.updateProfile);
router.patch('/change-password', protect, changePasswordValidator, validate, ctrl.changePassword);
router.get('/users', protect, authorize('admin'), ctrl.listUsers);
router.post(
  '/users',
  protect,
  authorize('admin'),
  createInspectorValidator,
  validate,
  ctrl.createInspector
);
router.patch(
  '/users/:id',
  protect,
  authorize('admin'),
  [param('id').isMongoId(), body('isActive').optional().isBoolean()],
  validate,
  ctrl.updateUser
);
router.delete(
  '/users/:id',
  protect,
  authorize('admin'),
  [param('id').isMongoId()],
  validate,
  ctrl.deleteUser
);

export default router;
