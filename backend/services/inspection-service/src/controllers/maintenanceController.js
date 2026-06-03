import Maintenance from '../models/Maintenance.js';
import UserRead from '../models/UserRead.js';
import {
  AppError,
  asyncHandler,
  getPagination,
  paginatedResponse,
  getExtinguisherById,
  notifyUser,
} from '@fems/shared';

export const logMaintenance = asyncHandler(async (req, res) => {
  const extinguisher = await getExtinguisherById(req.body.fireExtinguisher, req.logger);
  if (!extinguisher) throw new AppError('Fire extinguisher not found', 404);
  if (!['inspector', 'admin'].includes(req.user.role)) {
    throw new AppError('Only inspectors can log maintenance', 403);
  }
  const conditionNoted =
    req.body.issuesIdentified?.trim() || req.body.conditionNoted?.trim() || '';
  const performer =
    (await UserRead.findById(req.user._id).select('firstName lastName email').lean()) || {};
  const record = await Maintenance.create({
    fireExtinguisher: req.body.fireExtinguisher,
    actionTaken: req.body.actionTaken,
    maintenanceDate: req.body.maintenanceDate,
    issuesIdentified: conditionNoted,
    notesAndRecommendations: req.body.notesAndRecommendations,
    performedBy: req.user._id,
    performedBySnapshot: {
      firstName: performer.firstName,
      lastName: performer.lastName,
      email: performer.email || req.user.email,
    },
    extinguisherSnapshot: {
      serialNumber: extinguisher.serialNumber,
      location: extinguisher.location,
    },
  });
  if (extinguisher.registeredBy) {
    await notifyUser(
      {
        recipientId: extinguisher.registeredBy.toString(),
        title: 'Maintenance Completed',
        message: `Maintenance for ${extinguisher.serialNumber} on ${new Date(req.body.maintenanceDate).toLocaleDateString()}: ${req.body.actionTaken}${conditionNoted ? `. Condition: ${conditionNoted}` : ''}`,
        type: 'maintenance',
        relatedId: record._id.toString(),
      },
      req.logger
    );
  }
  res.status(201).json({ success: true, message: 'Maintenance logged', data: record });
});

export const listMaintenance = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = req.query.fireExtinguisher ? { fireExtinguisher: req.query.fireExtinguisher } : {};
  const [data, total] = await Promise.all([
    Maintenance.find(filter)
      .populate('performedBy', 'firstName lastName email role')
      .sort('-maintenanceDate')
      .skip(skip)
      .limit(limit)
      .lean(),
    Maintenance.countDocuments(filter),
  ]);
  res.json(paginatedResponse(data, total, page, limit));
});

export const getMaintenance = asyncHandler(async (req, res) => {
  const record = await Maintenance.findById(req.params.id).populate(
    'performedBy',
    'firstName lastName email role'
  );
  if (!record) throw new AppError('Maintenance record not found', 404);
  res.json({ success: true, data: record });
});
