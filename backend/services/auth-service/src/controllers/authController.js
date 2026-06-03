import User from '../models/User.js';
import {
  AppError,
  asyncHandler,
  signToken,
  createPasswordResetToken,
  hashResetToken,
  getPagination,
  paginatedResponse,
} from '@fems/shared';

const tokenBlacklist = new Set();

export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (await User.findOne({ email })) {
    throw new AppError('Email is already registered', 409, [{ field: 'email', message: 'Email already in use' }]);
  }
  const user = await User.create({ firstName, lastName, email, password, role: 'user' });
  const token = signToken(user);
  res.status(201).json({ success: true, message: 'Registration successful', data: { user, token } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.isActive) throw new AppError('Account is deactivated.', 403);
  const token = signToken(user);
  user.password = undefined;
  res.json({ success: true, message: 'Login successful', data: { user, token } });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) tokenBlacklist.add(token);
  res.json({ success: true, message: 'Logged out successfully' });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, data: user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError('User not found', 404);
  const { firstName, lastName, email } = req.body;
  if (email && email !== user.email && (await User.findOne({ email }))) {
    throw new AppError('Email is already in use', 409);
  }
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;
  await user.save();
  res.json({ success: true, message: 'Profile updated', data: user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const { currentPassword, newPassword } = req.body;
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 400);
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed successfully' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    const { resetToken, hashed, expires } = createPasswordResetToken();
    user.passwordResetToken = hashed;
    user.passwordResetExpires = expires;
    await user.save({ validateBeforeSave: false });
    return res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    });
  }
  res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
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

/** Admin registers a new inspector account (inspectors cannot self-register as inspector). */
export const createInspector = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (await User.findOne({ email })) {
    throw new AppError('Email is already registered', 409, [{ field: 'email', message: 'Email already in use' }]);
  }
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: 'inspector',
  });
  res.status(201).json({
    success: true,
    message: 'Inspector account created',
    data: user,
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = req.query.role ? { role: req.query.role } : {};
  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json(paginatedResponse(users, total, page, limit));
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'admin') {
    throw new AppError('Admin accounts cannot be modified', 403);
  }
  if (req.body.role !== undefined) {
    throw new AppError(
      'Roles cannot be changed here. Self-registered accounts are users; inspectors are created by admin.',
      400
    );
  }
  if (typeof req.body.isActive === 'boolean') user.isActive = req.body.isActive;
  await user.save();
  res.json({ success: true, message: 'User updated', data: user });
});

/** Internal: resolve users by role for notification service */
export const getUsersByRole = asyncHandler(async (req, res) => {
  const users = await User.find({ role: req.params.role, isActive: true }).select('_id');
  res.json({ success: true, data: users.map((u) => u._id.toString()) });
});
