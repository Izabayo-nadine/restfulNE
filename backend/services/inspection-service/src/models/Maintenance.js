import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    fireExtinguisher: { type: mongoose.Schema.Types.ObjectId, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    performedBySnapshot: {
      firstName: String,
      lastName: String,
      email: String,
    },
    actionTaken: { type: String, required: true, trim: true },
    maintenanceDate: { type: Date, required: true },
    issuesIdentified: String,
    notesAndRecommendations: String,
    extinguisherSnapshot: { serialNumber: String, location: String },
  },
  { timestamps: true }
);

export default mongoose.model('Maintenance', schema);
