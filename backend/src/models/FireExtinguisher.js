import mongoose from 'mongoose';
import {
  EXTINGUISHER_TYPES,
  EXTINGUISHER_SIZES,
  EXTINGUISHER_STATUSES,
} from '../../shared/src/config/appConfig.js';

export { EXTINGUISHER_TYPES, EXTINGUISHER_SIZES, EXTINGUISHER_STATUSES };

const fireExtinguisherSchema = new mongoose.Schema(
  {
    serialNumber: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
    location: { type: String, required: true, trim: true },
    type: { type: String, enum: EXTINGUISHER_TYPES, required: true },
    size: { type: String, enum: EXTINGUISHER_SIZES, required: true },
    installationDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    status: { type: String, enum: EXTINGUISHER_STATUSES, default: 'active' },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

fireExtinguisherSchema.index({ status: 1 });
fireExtinguisherSchema.index({ expiryDate: 1 });
fireExtinguisherSchema.index({ location: 1 });

export default mongoose.model('FireExtinguisher', fireExtinguisherSchema);
