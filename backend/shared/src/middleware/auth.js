import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** JWT auth for microservices — role embedded in token (no cross-service DB lookup). */
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    throw new AppError('Authentication required. Please log in.', 401);
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = {
    _id: decoded.id,
    id: decoded.id,
    role: decoded.role,
    email: decoded.email,
  };
  next();
});

export const authorize = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action.', 403);
    }
    next();
  });

/** Internal service-to-service calls */
export const internalOnly = asyncHandler(async (req, res, next) => {
  const key = req.headers['x-internal-key'];
  if (!key || key !== process.env.INTERNAL_SERVICE_KEY) {
    throw new AppError('Forbidden', 403);
  }
  next();
});
