import mongoose from 'mongoose';

export const INSPECTION_STATUSES = ['scheduled', 'completed', 'cancelled', 'overdue'];

const inspectionSchema = new mongoose.Schema(
  {
    fireExtinguisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FireExtinguisher',
      required: true,
    },
    scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedInspector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    inspectionDate: { type: Date, required: true },
    inspectionTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    status: { type: String, enum: INSPECTION_STATUSES, default: 'scheduled' },
    result: { type: String, trim: true },
    notes: { type: String, trim: true, maxlength: 2000 },
    completedAt: Date,
  },
  { timestamps: true }
);

inspectionSchema.index({ fireExtinguisher: 1 });
inspectionSchema.index({ inspectionDate: 1, status: 1 });
inspectionSchema.index({ status: 1 });

export default mongoose.model('Inspection', inspectionSchema);
