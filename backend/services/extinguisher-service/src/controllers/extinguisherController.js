import FireExtinguisher from '../models/FireExtinguisher.js';
import UserRead from '../models/UserRead.js';
import { AppError, asyncHandler, getPagination, paginatedResponse } from '@fems/shared';

async function resolveCompanyUser(assignedTo) {
  const company = await UserRead.findById(assignedTo);
  if (!company) throw new AppError('Assigned company user not found', 404);
  if (company.role !== 'user') {
    throw new AppError('Extinguishers must be assigned to a facility user (company) account', 400);
  }
  if (company.isActive === false) {
    throw new AppError('Cannot assign to a deactivated company account', 400);
  }
  return {
    assignedTo: company._id,
    companySnapshot: {
      firstName: company.firstName,
      lastName: company.lastName,
      email: company.email,
    },
  };
}

export const createExtinguisher = asyncHandler(async (req, res) => {
  const company = await resolveCompanyUser(req.body.assignedTo);
  const data = {
    ...req.body,
    ...company,
    registeredBy: req.user._id,
  };
  if (new Date(data.expiryDate) <= new Date(data.installationDate)) {
    throw new AppError('Expiry date must be after installation date', 400);
  }
  const item = await FireExtinguisher.create(data);
  res.status(201).json({ success: true, message: 'Fire extinguisher registered', data: item });
});

export const listExtinguishers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.user.role === 'user') {
    filter.assignedTo = req.user._id;
  }
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    filter.$or = [
      { serialNumber: { $regex: req.query.search, $options: 'i' } },
      { location: { $regex: req.query.search, $options: 'i' } },
      { 'companySnapshot.email': { $regex: req.query.search, $options: 'i' } },
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
  if (req.user.role === 'user' && item.assignedTo?.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to view this extinguisher', 403);
  }
  res.json({ success: true, data: item });
});

export const updateExtinguisher = asyncHandler(async (req, res) => {
  const item = await FireExtinguisher.findById(req.params.id);
  if (!item) throw new AppError('Fire extinguisher not found', 404);
  if (req.body.assignedTo) {
    const company = await resolveCompanyUser(req.body.assignedTo);
    item.assignedTo = company.assignedTo;
    item.companySnapshot = company.companySnapshot;
    delete req.body.assignedTo;
  }
  Object.assign(item, req.body);
  await item.save();
  res.json({ success: true, message: 'Updated successfully', data: item });
});

export const deleteExtinguisher = asyncHandler(async (req, res) => {
  const item = await FireExtinguisher.findByIdAndDelete(req.params.id);
  if (!item) throw new AppError('Fire extinguisher not found', 404);
  res.json({ success: true, message: 'Fire extinguisher deleted', data: { _id: item._id } });
});

/** Internal: remove all extinguishers for a deleted facility user */
export const deleteByAssignedUser = asyncHandler(async (req, res) => {
  const result = await FireExtinguisher.find({ assignedTo: req.params.userId }).select('_id');
  const ids = result.map((d) => d._id);
  await FireExtinguisher.deleteMany({ assignedTo: req.params.userId });
  res.json({ success: true, data: { deletedCount: ids.length, extinguisherIds: ids } });
});
