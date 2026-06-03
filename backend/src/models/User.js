import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ROLES = ['admin', 'inspector', 'user'];

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
      index: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ROLES, default: 'user' },
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshTokens: [{ type: String, select: false }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.refreshTokens;
  return obj;
};

export const USER_ROLES = ROLES;
export default mongoose.model('User', userSchema);
