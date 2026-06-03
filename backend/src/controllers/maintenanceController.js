import Maintenance from '../models/Maintenance.js';
import FireExtinguisher from '../models/FireExtinguisher.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';
import { createNotification } from '../services/notificationService.js';
import logger from '../utils/logger.js';

export const logMaintenance = asyncHandler(async (req, res) => {
  const extinguisher = await FireExtinguisher.findById(req.body.fireExtinguisher);
  if (!extinguisher) throw new AppError('Fire extinguisher not found', 404);
  if (!['inspector', 'admin'].includes(req.user.role)) {
    throw new AppError('Only inspectors can log maintenance', 403);
  }
  const record = await Maintenance.create({
    ...req.body,
    performedBy: req.user._id,
  });
  extinguisher.status = 'active';
  await extinguisher.save();
  if (extinguisher.registeredBy) {
    await createNotification({
      recipientId: extinguisher.registeredBy,
      title: 'Maintenance Completed',
      message: `Maintenance logged for ${extinguisher.serialNumber}: ${req.body.actionTaken}`,
      type: 'maintenance',
      relatedId: record._id,
    });
  }
  const populated = await Maintenance.findById(record._id)
    .populate('fireExtinguisher', 'serialNumber location')
    .populate('performedBy', 'firstName lastName email');
  logger.info('Maintenance logged', { id: record._id });
  res.status(201).json({ success: true, message: 'Maintenance logged', data: populated });
});

export const listMaintenance = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.fireExtinguisher) filter.fireExtinguisher = req.query.fireExtinguisher;
  const [data, total] = await Promise.all([
    Maintenance.find(filter)
      .populate('fireExtinguisher', 'serialNumber location type')
      .populate('performedBy', 'firstName lastName')
      .sort('-maintenanceDate')
      .skip(skip)
      .limit(limit),
    Maintenance.countDocuments(filter),
  ]);
  res.json(paginatedResponse(data, total, page, limit));
});

export const getMaintenance = asyncHandler(async (req, res) => {
  const record = await Maintenance.findById(req.params.id)
    .populate('fireExtinguisher')
    .populate('performedBy', 'firstName lastName email');
  if (!record) throw new AppError('Maintenance record not found', 404);
  res.json({ success: true, data: record });
});
