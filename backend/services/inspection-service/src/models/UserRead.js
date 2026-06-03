import mongoose from 'mongoose';

/** Read-only User model (auth-service writes to same `users` collection). */
const schema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    role: String,
  },
  { collection: 'users' }
);

export default mongoose.models.User || mongoose.model('User', schema);
