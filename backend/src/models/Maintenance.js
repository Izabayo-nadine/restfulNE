import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
  {
    fireExtinguisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FireExtinguisher',
      required: true,
    },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actionTaken: { type: String, required: true, trim: true, maxlength: 500 },
    maintenanceDate: { type: Date, required: true },
    issuesIdentified: { type: String, trim: true, maxlength: 1000 },
    notesAndRecommendations: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

maintenanceSchema.index({ fireExtinguisher: 1 });
maintenanceSchema.index({ maintenanceDate: -1 });

export default mongoose.model('Maintenance', maintenanceSchema);
