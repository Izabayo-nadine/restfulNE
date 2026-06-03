import FireExtinguisher from '../models/FireExtinguisher.js';
import { AppError, asyncHandler, getPagination, paginatedResponse } from '@fems/shared';

export const createExtinguisher = asyncHandler(async (req, res) => {
  const data = { ...req.body, registeredBy: req.user._id };
  if (new Date(data.expiryDate) <= new Date(data.installationDate)) {
    throw new AppError('Expiry date must be after installation date', 400);
  }
  const item = await FireExtinguisher.create(data);
  res.status(201).json({ success: true, message: 'Fire extinguisher registered', data: item });
});

export const listExtinguishers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    filter.$or = [
      { serialNumber: { $regex: req.query.search, $options: 'i' } },
      { location: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  const [data, total] = await Promise.all([
    FireExtinguisher.find(filter).sort('-createdAt').skip(skip).limit(limit),
    FireExtinguisher.countDocuments(filter),
  ]);
  res.json(paginatedResponse(data, total, page, limit));
});

export const getExtinguisher = asyncHandler(async (req, res) => {
  const item = await FireExtinguisher.findById(req.params.id);
  if (!item) throw new AppError('Fire extinguisher not found', 404);
  res.json({ success: true, data: item });
});

export const updateExtinguisher = asyncHandler(async (req, res) => {
  const item = await FireExtinguisher.findById(req.params.id);
  if (!item) throw new AppError('Fire extinguisher not found', 404);
  Object.assign(item, req.body);
  await item.save();
  res.json({ success: true, message: 'Updated successfully', data: item });
});

export const deleteExtinguisher = asyncHandler(async (req, res) => {
  const item = await FireExtinguisher.findByIdAndDelete(req.params.id);
  if (!item) throw new AppError('Fire extinguisher not found', 404);
  res.json({ success: true, message: 'Fire extinguisher deleted' });
});
