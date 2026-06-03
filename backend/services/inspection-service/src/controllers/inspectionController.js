import Inspection from '../models/Inspection.js';
import {
  AppError,
  asyncHandler,
  getPagination,
  paginatedResponse,
  getExtinguisherById,
  notifyRole,
  notifyUser,
} from '@fems/shared';

export const scheduleInspection = asyncHandler(async (req, res) => {
  const extinguisher = await getExtinguisherById(req.body.fireExtinguisher, req.logger);
  if (!extinguisher) throw new AppError('Fire extinguisher not found', 404);
  const inspectionDate = new Date(req.body.inspectionDate);
  if (inspectionDate < new Date(new Date().setHours(0, 0, 0, 0))) {
    throw new AppError('Inspection date cannot be in the past', 400);
  }
  const inspection = await Inspection.create({
    fireExtinguisher: req.body.fireExtinguisher,
    inspectionDate: req.body.inspectionDate,
    inspectionTime: req.body.inspectionTime,
    assignedInspector: req.body.assignedInspector,
    scheduledBy: req.user._id,
    extinguisherSnapshot: {
      serialNumber: extinguisher.serialNumber,
      location: extinguisher.location,
      unitType: extinguisher.type,
    },
  });
  const dateStr = inspectionDate.toLocaleDateString();
  const notifyPayload = {
    title: 'New Inspection Scheduled',
    message: `Inspection for ${extinguisher.serialNumber} at ${extinguisher.location} on ${dateStr} at ${inspection.inspectionTime}.`,
    type: 'inspection',
    relatedId: inspection._id.toString(),
  };
  // Notify in background so scheduling responds even if notification service is slow
  const notifyTasks = [
    notifyRole({ role: 'inspector', ...notifyPayload }, req.logger),
    notifyRole({ role: 'admin', ...notifyPayload }, req.logger),
    notifyUser(
      {
        recipientId: req.user._id.toString(),
        title: 'Inspection scheduled',
        message: `You scheduled an inspection for ${extinguisher.serialNumber} on ${dateStr} at ${inspection.inspectionTime}.`,
        type: 'inspection',
        relatedId: inspection._id.toString(),
      },
      req.logger
    ),
  ];
  Promise.allSettled(notifyTasks).catch(() => {});
  res.status(201).json({ success: true, message: 'Inspection scheduled', data: inspection });
});

export const listInspections = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.fireExtinguisher) filter.fireExtinguisher = req.query.fireExtinguisher;
  const [data, total] = await Promise.all([
    Inspection.find(filter).sort('-inspectionDate').skip(skip).limit(limit),
    Inspection.countDocuments(filter),
  ]);
  res.json(paginatedResponse(data, total, page, limit));
});

export const getInspection = asyncHandler(async (req, res) => {
  const item = await Inspection.findById(req.params.id);
  if (!item) throw new AppError('Inspection not found', 404);
  res.json({ success: true, data: item });
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

export async function markOverdueInspections(logger) {
  const now = new Date();
  const result = await Inspection.updateMany(
    { status: 'scheduled', inspectionDate: { $lt: now } },
    { $set: { status: 'overdue' } }
  );
  if (result.modifiedCount) logger.info('Marked overdue inspections', { count: result.modifiedCount });
  return result.modifiedCount;
}
