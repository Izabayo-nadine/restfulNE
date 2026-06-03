import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    purpose: { type: String, enum: ['register', 'password_reset'], required: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    payload: {
      firstName: String,
      lastName: String,
      password: String,
    },
  },
  { timestamps: true }
);

otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Otp', otpSchema);
