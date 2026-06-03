import mongoose from 'mongoose';

export const INSPECTION_STATUSES = ['scheduled', 'completed', 'cancelled', 'overdue'];

/** Nested schema — avoid a field named `type` (Mongoose treats it as the path type). */
const extinguisherSnapshotSchema = new mongoose.Schema(
  {
    serialNumber: String,
    location: String,
    unitType: String,
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    fireExtinguisher: { type: mongoose.Schema.Types.ObjectId, required: true },
    scheduledBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    assignedInspector: { type: mongoose.Schema.Types.ObjectId },
    inspectionDate: { type: Date, required: true },
    inspectionTime: { type: String, required: true },
    status: { type: String, enum: INSPECTION_STATUSES, default: 'scheduled' },
    result: String,
    notes: String,
    completedAt: Date,
    extinguisherSnapshot: extinguisherSnapshotSchema,
  },
  { timestamps: true }
);

schema.index({ status: 1, inspectionDate: 1 });

export default mongoose.model('Inspection', schema);
