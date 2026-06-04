import mongoose from "mongoose";
import {
  EXTINGUISHER_TYPES,
  EXTINGUISHER_SIZES,
  EXTINGUISHER_STATUSES,
} from "@fems/shared";

export { EXTINGUISHER_TYPES, EXTINGUISHER_SIZES, EXTINGUISHER_STATUSES };

const schema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    location: { type: String, required: true, trim: true },
    type: { type: String, enum: EXTINGUISHER_TYPES, required: true },
    size: { type: String, enum: EXTINGUISHER_SIZES, required: true },
    installationDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    status: { type: String, enum: EXTINGUISHER_STATUSES, default: "active" },
    registeredBy: { type: mongoose.Schema.Types.ObjectId },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, required: true },
    companySnapshot: {
      firstName: String,
      lastName: String,
      email: String,
    },
  },
  { timestamps: true },
);

schema.index({ status: 1 });
schema.index({ expiryDate: 1 });
schema.index({ assignedTo: 1 });

export default mongoose.model("FireExtinguisher", schema);
