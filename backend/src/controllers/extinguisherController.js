import FireExtinguisher from '../models/FireExtinguisher.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';
import logger from '../utils/logger.js';

export const createExtinguisher = asyncHandler(async (req, res) => {
  const data = { ...req.body, registeredBy: req.user._id };
  if (new Date(data.expiryDate) <= new Date(data.installationDate)) {
    throw new AppError('Expiry date must be after installation date', 400);
  }
  const extinguisher = await FireExtinguisher.create(data);
  logger.info('Fire extinguisher registered', { id: extinguisher._id, serial: extinguisher.serialNumber });
  res.status(201).json({ success: true, message: 'Fire extinguisher registered', data: extinguisher });
});

export const listExtinguishers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.search) {
    filter.$or = [
      { serialNumber: { $regex: req.query.search, $options: 'i' } },
      { location: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const [data, total] = await Promise.all([
    FireExtinguisher.find(filter).populate('registeredBy', 'firstName lastName email').sort('-createdAt').skip(skip).limit(limit),
    FireExtinguisher.countDocuments(filter),
  ]);
  res.json(paginatedResponse(data, total, page, limit));
});

export const getExtinguisher = asyncHandler(async (req, res) => {
  const extinguisher = await FireExtinguisher.findById(req.params.id).populate('registeredBy', 'firstName lastName email');
  if (!extinguisher) throw new AppError('Fire extinguisher not found', 404);
  res.json({ success: true, data: extinguisher });
});

export const updateExtinguisher = asyncHandler(async (req, res) => {
  const extinguisher = await FireExtinguisher.findById(req.params.id);
  if (!extinguisher) throw new AppError('Fire extinguisher not found', 404);
  const updates = req.body;
  if (updates.installationDate && updates.expiryDate) {
    if (new Date(updates.expiryDate) <= new Date(updates.installationDate)) {
      throw new AppError('Expiry date must be after installation date', 400);
    }
  }
  Object.assign(extinguisher, updates);
  await extinguisher.save();
  logger.info('Fire extinguisher updated', { id: extinguisher._id });
  res.json({ success: true, message: 'Updated successfully', data: extinguisher });
});

export const deleteExtinguisher = asyncHandler(async (req, res) => {
  const extinguisher = await FireExtinguisher.findByIdAndDelete(req.params.id);
  if (!extinguisher) throw new AppError('Fire extinguisher not found', 404);
  logger.info('Fire extinguisher deleted', { id: req.params.id });
  res.json({ success: true, message: 'Fire extinguisher deleted' });
});
