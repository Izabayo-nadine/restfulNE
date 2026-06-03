import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken, createPasswordResetToken, hashResetToken } from '../services/tokenService.js';
import logger from '../utils/logger.js';

const tokenBlacklist = new Set();

export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email is already registered', 409, [{ field: 'email', message: 'Email already in use' }]);
  }
  const assignedRole = req.user?.role === 'admin' && role ? role : 'user';
  const user = await User.create({ firstName, lastName, email, password, role: assignedRole });
  const token = signToken(user._id);
  logger.info('User registered', { userId: user._id, email });
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user, token },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.isActive) {
    throw new AppError('Account is deactivated. Contact administrator.', 403);
  }
  const token = signToken(user._id);
  user.password = undefined;
  logger.info('User logged in', { userId: user._id });
  res.json({ success: true, message: 'Login successful', data: { user, token } });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) tokenBlacklist.add(token);
  logger.info('User logged out', { userId: req.user._id });
  res.json({ success: true, message: 'Logged out successfully' });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, email } = req.body;
  if (email && email !== req.user.email) {
    const dup = await User.findOne({ email });
    if (dup) throw new AppError('Email is already in use', 409);
    req.user.email = email;
  }
  if (firstName) req.user.firstName = firstName;
  if (lastName) req.user.lastName = lastName;
  await req.user.save();
  res.json({ success: true, message: 'Profile updated', data: req.user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const { currentPassword, newPassword } = req.body;
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 400);
  }
  user.password = newPassword;
  await user.save();
  logger.info('Password changed', { userId: user._id });
  res.json({ success: true, message: 'Password changed successfully' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    });
  }
  const { resetToken, hashed, expires } = createPasswordResetToken();
  user.passwordResetToken = hashed;
  user.passwordResetExpires = expires;
  await user.save({ validateBeforeSave: false });
  logger.info('Password reset requested', { userId: user._id });
  res.json({
    success: true,
    message: 'If that email exists, a reset link has been sent.',
    ...(process.env.NODE_ENV === 'development' && { resetToken }),
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = hashResetToken(req.body.token);
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');
  if (!user) throw new AppError('Token is invalid or has expired', 400);
  user.password = req.body.newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json({ success: true, message: 'Password reset successful' });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { getPagination, paginatedResponse } = await import('../utils/pagination.js');
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json(paginatedResponse(users, total, page, limit));
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (req.body.role) user.role = req.body.role;
  if (typeof req.body.isActive === 'boolean') user.isActive = req.body.isActive;
  await user.save();
  res.json({ success: true, message: 'User updated', data: user });
});

export { tokenBlacklist };
