import {
  FireExtinguisher,
  Inspection,
} from '../models/readModels.js';
import {
  asyncHandler,
  getComplianceTargetPercent,
  getExpiryWarningDays,
  getDashboardPreviewLimit,
  getReportRecentLimit,
  getReportUpcomingLimit,
} from '@fems/shared';

async function markOverdueInspections() {
  const now = new Date();
  await Inspection.updateMany(
    { status: 'scheduled', inspectionDate: { $lt: now } },
    { $set: { status: 'overdue' } }
  );
}

function userObjectId(userId) {
  return userId;
}

/** Role-scoped dashboard stats and summary lists — all counts from MongoDB. */
export const dashboardReport = asyncHandler(async (req, res) => {
  await markOverdueInspections();
  const now = new Date();
  const userId = userObjectId(req.user.id || req.user._id);
  const role = req.user.role;
  const previewLimit = getDashboardPreviewLimit();
  const generatedAt = new Date();

  if (role === 'user') {
    const extFilter = { assignedTo: userId };
    const inspFilter = { scheduledBy: userId };

    const [
      total,
      pending,
      overdue,
      completed,
      recentExtinguishers,
      upcomingInspections,
      myInspections,
    ] = await Promise.all([
      FireExtinguisher.countDocuments(extFilter),
      Inspection.countDocuments({ ...inspFilter, status: 'scheduled' }),
      Inspection.countDocuments({ ...inspFilter, status: 'overdue' }),
      Inspection.countDocuments({ ...inspFilter, status: 'completed' }),
      FireExtinguisher.find(extFilter)
        .sort('-updatedAt')
        .limit(previewLimit)
        .select('serialNumber location status expiryDate'),
      Inspection.find({
        ...inspFilter,
        status: { $in: ['scheduled', 'overdue'] },
        inspectionDate: { $gte: now },
      })
        .sort('inspectionDate')
        .limit(previewLimit),
      Inspection.find(inspFilter).sort('-inspectionDate').limit(previewLimit),
    ]);

    return res.json({
      success: true,
      data: {
        role,
        stats: { total, pending, overdue, completed },
        reports: {
          inventory: { total, period: 'mine', recent: recentExtinguishers },
          inspections: {
            pending,
            overdue,
            completed,
            upcoming: upcomingInspections,
            recent: myInspections,
          },
        },
        generatedAt,
      },
    });
  }

  const complianceTargetPercent = getComplianceTargetPercent();
  const expiryWarningDays = getExpiryWarningDays();
  const warningEnd = new Date();
  warningEnd.setDate(warningEnd.getDate() + expiryWarningDays);

  const [
    total,
    pending,
    completed,
    overdue,
    byType,
    byStatus,
    recentExtinguishers,
    upcomingInspections,
    expiredUnits,
    upcomingExpirations,
    activeCount,
  ] = await Promise.all([
    FireExtinguisher.countDocuments(),
    Inspection.countDocuments({ status: 'scheduled' }),
    Inspection.countDocuments({ status: 'completed' }),
    Inspection.countDocuments({ status: 'overdue' }),
    FireExtinguisher.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    FireExtinguisher.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    FireExtinguisher.find()
      .sort('-createdAt')
      .limit(getReportRecentLimit())
      .select('serialNumber location status'),
    Inspection.find({ status: 'scheduled', inspectionDate: { $gte: now } })
      .sort('inspectionDate')
      .limit(getReportUpcomingLimit()),
    FireExtinguisher.find({ expiryDate: { $lt: now } }).select(
      'serialNumber location expiryDate status'
    ),
    FireExtinguisher.find({
      expiryDate: { $gte: now, $lte: warningEnd },
    }).select('serialNumber location expiryDate'),
    FireExtinguisher.countDocuments({ status: 'active', expiryDate: { $gte: now } }),
  ]);

  const complianceRate = total ? Math.round((activeCount / total) * 100) : 100;

  res.json({
    success: true,
    data: {
      role,
      stats: {
        total,
        pending,
        overdue,
        compliance: complianceRate,
        expired: expiredUnits.length,
        completed,
      },
      reports: {
        inventory: {
          total,
          period: 'all',
          byType,
          byStatus,
          recent: recentExtinguishers,
        },
        inspections: {
          pending,
          completed,
          overdue,
          upcoming: upcomingInspections,
        },
        compliance: {
          complianceRate,
          complianceTargetPercent,
          expiryWarningDays,
          expiredCount: expiredUnits.length,
          expired: expiredUnits,
          upcomingExpirations,
          complianceStatus:
            complianceRate >= complianceTargetPercent ? 'compliant' : 'at_risk',
        },
      },
      generatedAt,
    },
  });
})