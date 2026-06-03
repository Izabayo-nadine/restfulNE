import mongoose from 'mongoose';

/** Read-only schemas for cross-service reporting (shared MongoDB). */
export const FireExtinguisher = mongoose.models.FireExtinguisher ||
  mongoose.model('FireExtinguisher', new mongoose.Schema({}, { strict: false, collection: 'fireextinguishers' }));

export const Inspection = mongoose.models.Inspection ||
  mongoose.model('Inspection', new mongoose.Schema({}, { strict: false, collection: 'inspections' }));

export const Maintenance = mongoose.models.Maintenance ||
  mongoose.model('Maintenance', new mongoose.Schema({}, { strict: false, collection: 'maintenances' }));
