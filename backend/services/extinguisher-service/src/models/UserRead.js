import mongoose from 'mongoose';

/** Read-only User model (auth-service owns the users collection). */
const schema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    role: String,
    isActive: { type: Boolean, default: true },
  },
  { collection: 'users' }
);

export default mongoose.models.User || mongoose.model('User', schema);
