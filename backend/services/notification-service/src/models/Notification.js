import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ['inspection', 'maintenance', 'compliance', 'system'], default: 'system' },
    relatedId: mongoose.Schema.Types.ObjectId,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

schema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', schema);
