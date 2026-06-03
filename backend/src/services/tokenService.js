import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
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
