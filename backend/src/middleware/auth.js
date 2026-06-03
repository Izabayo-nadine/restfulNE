import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    throw new AppError('Authentication required. Please log in.', 401);
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new AppError('User no longer exists or is deactivated.', 401);
  }
  req.user = user;
  next();
});

export const authorize = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action.', 403);
    }
    next();
  });
