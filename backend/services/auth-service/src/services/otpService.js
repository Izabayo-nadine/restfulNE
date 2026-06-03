import crypto from 'crypto';
import Otp from '../models/Otp.js';
import { AppError } from '@fems/shared';
import { sendOtpEmail } from './emailService.js';

const OTP_TTL_MS = 10 * 60 * 1000;

function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createAndSendOtp({ email, purpose, payload = null }) {
  const normalizedEmail = email.toLowerCase().trim();
  await Otp.deleteMany({ email: normalizedEmail, purpose });
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await Otp.create({
    email: normalizedEmail,
    purpose,
    codeHash: hashCode(code),
    expiresAt,
    payload,
  });
  const { emailed } = await sendOtpEmail({ to: normalizedEmail, code, purpose });
  if (!emailed) {
    throw new AppError(
      'Email could not be sent. Configure SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env (see docs/SMTP_SETUP.md).',
      503
    );
  }
  return {
    expiresAt,
    email: normalizedEmail,
    emailed: true,
    message:
      purpose === 'register'
        ? `Verification code sent to ${normalizedEmail}. Check your inbox (and spam folder).`
        : `Password reset code sent to ${normalizedEmail}.`,
  };
}

export async function verifyOtp({ email, purpose, code }) {
  const normalizedEmail = email.toLowerCase().trim();
  const record = await Otp.findOne({ email: normalizedEmail, purpose });
  if (!record) {
    throw new AppError('No verification code found. Please request a new one.', 400);
  }
  if (record.expiresAt < new Date()) {
    await record.deleteOne();
    throw new AppError('Verification code has expired. Please request a new one.', 400);
  }
  if (record.attempts >= record.maxAttempts) {
    await record.deleteOne();
    throw new AppError('Too many failed attempts. Please request a new code.', 429);
  }
  if (hashCode(code) !== record.codeHash) {
    record.attempts += 1;
    await record.save();
    throw new AppError('Invalid verification code.', 400);
  }
  await record.deleteOne();
  return record.payload || {};
}
