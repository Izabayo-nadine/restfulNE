import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export function signToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

export function createPasswordResetToken() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expires = Date.now() + 60 * 60 * 1000;
  return { resetToken, hashed, expires };
}

export function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
