import mongoose from 'mongoose';

export const EXTINGUISHER_TYPES = ['Water', 'CO₂', 'Foam', 'Dry Chemical'];
export const EXTINGUISHER_SIZES = ['1.5 lb', '5 lb', '9 lb', '12 lb'];
export const EXTINGUISHER_STATUSES = ['active', 'inactive', 'maintenance', 'expired', 'decommissioned'];

const schema = new mongoose.Schema(
  {
    serialNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    location: { type: String, required: true, trim: true },
    type: { type: String, enum: EXTINGUISHER_TYPES, required: true },
    size: { type: String, enum: EXTINGUISHER_SIZES, required: true },
    installationDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    status: { type: String, enum: EXTINGUISHER_STATUSES, default: 'active' },
    registeredBy: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

schema.index({ status: 1 });
schema.index({ expiryDate: 1 });

export default mongoose.model('FireExtinguisher', schema);
