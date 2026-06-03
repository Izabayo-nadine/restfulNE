import User from '../models/User.js';
import { AppError, asyncHandler, signToken } from '@fems/shared';
import { createAndSendOtp, verifyOtp } from '../services/otpService.js';

export const registerSendOtp = asyncHandler(async (req, res) => {
  const { firstName, lastName, password } = req.body;
  const email = req.body.email?.toLowerCase().trim();
  if (await User.findOne({ email })) {
    throw new AppError('Email is already registered', 409);
  }
  const { message, email: sentTo } = await createAndSendOtp({
    email,
    purpose: 'register',
    payload: { firstName, lastName, password },
  });
  res.json({
    success: true,
    message,
    email: sentTo,
    expiresInMinutes: 10,
  });
});

export const registerVerifyOtp = asyncHandler(async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const { otp } = req.body;
  const payload = await verifyOtp({ email, purpose: 'register', code: otp });
  if (await User.findOne({ email })) {
    throw new AppError('Email is already registered', 409);
  }
  const user = await User.create({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email,
    password: payload.password,
    role: 'user',
  });
  const token = signToken(user);
  res.status(201).json({
    success: true,
    message: 'Email verified. You are now signed in.',
    data: { user, token },
  });
});

export const forgotPasswordSendOtp = asyncHandler(async (req, res) => {
  const email = req.body.email?.toLowerCase();
  const user = await User.findOne({ email });
  const genericMessage = 'If that email is registered, a verification code has been sent.';
  if (!user) {
    return res.json({ success: true, message: genericMessage });
  }
  await createAndSendOtp({
    email,
    purpose: 'password_reset',
  });
  res.json({
    success: true,
    message: genericMessage,
  });
});

export const forgotPasswordReset = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  await verifyOtp({ email, purpose: 'password_reset', code: otp });
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json({ success: true, message: 'Password reset successful. You can sign in now.' });
});
