import Inspection from '../models/Inspection.js';
import FireExtinguisher from '../models/FireExtinguisher.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';
import { notifyInspectorsForInspection } from '../services/notificationService.js';
import logger from '../utils/logger.js';

export const scheduleInspection = asyncHandler(async (req, res) => {
  const extinguisher = await FireExtinguisher.findById(req.body.fireExtinguisher);
  if (!extinguisher) throw new AppError('Fire extinguisher not found', 404);
  const inspectionDate = new Date(req.body.inspectionDate);
  if (inspectionDate < new Date(new Date().setHours(0, 0, 0, 0))) {
    throw new AppError('Inspection date cannot be in the past', 400);
  }
  const inspection = await Inspection.create({
    ...req.body,
    scheduledBy: req.user._id,
  });
  await notifyInspectorsForInspection(inspection, extinguisher);
  const populated = await Inspection.findById(inspection._id)
    .populate('fireExtinguisher', 'serialNumber location type')
    .populate('scheduledBy', 'firstName lastName email')
    .populate('assignedInspector', 'firstName lastName email');
  logger.info('Inspection scheduled', { id: inspection._id });
  res.status(201).json({ success: true, message: 'Inspection scheduled', data: populated });
});

export const listInspections = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.fireExtinguisher) filter.fireExtinguisher = req.query.fireExtinguisher;
  const [data, total] = await Promise.all([
    Inspection.find(filter)
      .populate('fireExtinguisher', 'serialNumber location type status')
      .populate('scheduledBy', 'firstName lastName')
      .populate('assignedInspector', 'firstName lastName')
      .sort('-inspectionDate')
      .skip(skip)
      .limit(limit),
    Inspection.countDocuments(filter),
  ]);
  res.json(paginatedResponse(data, total, page, limit));
});

export const getInspection = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findById(req.params.id)
    .populate('fireExtinguisher')
    .populate('scheduledBy', 'firstName lastName email')
    .populate('assignedInspector', 'firstName lastName email');
  if (!inspection) throw new AppError('Inspection not found', 404);
  res.json({ success: true, data: inspection });
});

export const completeInspection = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findById(req.params.id);
  if (!inspection) throw new AppError('Inspection not found', 404);
  if (!['inspector', 'admin'].includes(req.user.role)) {
    throw new AppError('Only inspectors can complete inspections', 403);
  }
  inspection.status = 'completed';
  inspection.result = req.body.result;
  inspection.notes = req.body.notes;
  inspection.completedAt = new Date();
  inspection.assignedInspector = req.user._id;
  await inspection.save();
  res.json({ success: true, message: 'Inspection completed', data: inspection });
});

export const markOverdueInspections = asyncHandler(async () => {
  const now = new Date();
  const result = await Inspection.updateMany(
    { status: 'scheduled', inspectionDate: { $lt: now } },
    { $set: { status: 'overdue' } }
  );
  return result.modifiedCount;
});
