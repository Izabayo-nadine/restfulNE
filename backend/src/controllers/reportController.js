import FireExtinguisher from '../models/FireExtinguisher.js';
import Inspection from '../models/Inspection.js';
import Maintenance from '../models/Maintenance.js';
import PDFDocument from 'pdfkit';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';
import {
  getComplianceTargetPercent,
  getExpiryWarningDays,
} from '../../shared/src/config/appConfig.js';
import { markOverdueInspections } from './inspectionController.js';

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function periodRange(period) {
  const now = new Date();
  let start;
  if (period === 'daily') {
    start = startOfDay(now);
  } else if (period === 'monthly') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === 'yearly') {
    start = new Date(now.getFullYear(), 0, 1);
  } else {
    start = new Date(0);
  }
  return { start, end: endOfDay(now) };
}

export const inventoryReport = asyncHandler(async (req, res) => {
  const period = req.query.period || 'all';
  const { start, end } = periodRange(period);
  const filter = period === 'all' ? {} : { createdAt: { $gte: start, $lte: end } };
  const [total, byType, byStatus, recent] = await Promise.all([
    FireExtinguisher.countDocuments(filter),
    FireExtinguisher.aggregate([{ $match: filter }, { $group: { _id: '$type', count: { $sum: 1 } } }]),
    FireExtinguisher.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    FireExtinguisher.find(filter).sort('-createdAt').limit(5).select('serialNumber location status'),
  ]);
  res.json({
    success: true,
    data: {
      period,
      total,
      byType,
      byStatus,
      recent,
      generatedAt: new Date(),
    },
  });
});

export const inspectionReport = asyncHandler(async (req, res) => {
  await markOverdueInspections();
  const now = new Date();
  const [pending, completed, overdue] = await Promise.all([
    Inspection.countDocuments({ status: 'scheduled' }),
    Inspection.countDocuments({ status: 'completed' }),
    Inspection.countDocuments({ status: 'overdue' }),
  ]);
  const upcoming = await Inspection.find({ status: 'scheduled', inspectionDate: { $gte: now } })
    .populate('fireExtinguisher', 'serialNumber location')
    .sort('inspectionDate')
    .limit(10);
  res.json({
    success: true,
    data: { pending, completed, overdue, upcoming, generatedAt: new Date() },
  });
});

export const complianceReport = asyncHandler(async (req, res) => {
  const now = new Date();
  const complianceTargetPercent = getComplianceTargetPercent();
  const expiryWarningDays = getExpiryWarningDays();
  const warningEnd = new Date();
  warningEnd.setDate(warningEnd.getDate() + expiryWarningDays);
  const [expired, upcoming, active] = await Promise.all([
    FireExtinguisher.find({ expiryDate: { $lt: now } }).select('serialNumber location expiryDate status'),
    FireExtinguisher.find({ expiryDate: { $gte: now, $lte: warningEnd } }).select('serialNumber location expiryDate'),
    FireExtinguisher.countDocuments({ status: 'active', expiryDate: { $gte: now } }),
  ]);
  const total = await FireExtinguisher.countDocuments();
  const complianceRate = total ? Math.round((active / total) * 100) : 100;
  res.json({
    success: true,
    data: {
      expiredCount: expired.length,
      expired,
      upcomingExpirations: upcoming,
      complianceRate,
      complianceTargetPercent,
      expiryWarningDays,
      complianceStatus: complianceRate >= complianceTargetPercent ? 'compliant' : 'at_risk',
      generatedAt: new Date(),
    },
  });
});

export const maintenanceReport = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [history, total, frequency] = await Promise.all([
    Maintenance.find()
      .populate('fireExtinguisher', 'serialNumber location')
      .populate('performedBy', 'firstName lastName')
      .sort('-maintenanceDate')
      .skip(skip)
      .limit(limit),
    Maintenance.countDocuments(),
    Maintenance.aggregate([
      { $group: { _id: '$fireExtinguisher', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);
  const recent = await Maintenance.find()
    .sort('-createdAt')
    .limit(5)
    .populate('fireExtinguisher', 'serialNumber')
    .populate('performedBy', 'firstName lastName');
  res.json({
    success: true,
    data: {
      history: paginatedResponse(history, total, page, limit).data,
      pagination: paginatedResponse(history, total, page, limit).pagination,
      frequency,
      recent,
      generatedAt: new Date(),
    },
  });
});

function rowsToCsv(headers, rows) {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
}

export const exportReport = asyncHandler(async (req, res) => {
  const { type, format } = req.query;
  if (!['inventory', 'inspection', 'compliance', 'maintenance'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Invalid report type' });
  }
  if (!['csv', 'pdf'].includes(format)) {
    return res.status(400).json({ success: false, message: 'Format must be csv or pdf' });
  }

  let title;
  let headers;
  let rows = [];

  if (type === 'inventory') {
    title = 'Inventory Report';
    headers = ['Serial', 'Location', 'Type', 'Size', 'Status', 'Expiry'];
    const items = await FireExtinguisher.find().sort('serialNumber');
    rows = items.map((e) => [
      e.serialNumber,
      e.location,
      e.type,
      e.size,
      e.status,
      e.expiryDate?.toISOString().split('T')[0],
    ]);
  } else if (type === 'inspection') {
    title = 'Inspection Report';
    headers = ['Date', 'Time', 'Serial', 'Status', 'Result'];
    const items = await Inspection.find().populate('fireExtinguisher', 'serialNumber');
    rows = items.map((i) => [
      i.inspectionDate?.toISOString().split('T')[0],
      i.inspectionTime,
      i.fireExtinguisher?.serialNumber,
      i.status,
      i.result || '',
    ]);
  } else if (type === 'compliance') {
    title = 'Compliance Report';
    headers = ['Serial', 'Location', 'Expiry', 'Status'];
    const now = new Date();
    const warningEnd = new Date(now.getTime() + getExpiryWarningDays() * 86400000);
    const items = await FireExtinguisher.find({ expiryDate: { $lte: warningEnd } });
    rows = items.map((e) => [
      e.serialNumber,
      e.location,
      e.expiryDate?.toISOString().split('T')[0],
      e.expiryDate < now ? 'expired' : 'upcoming',
    ]);
  } else {
    title = 'Maintenance Report';
    headers = ['Date', 'Serial', 'Action', 'Issues', 'Performed By'];
    const items = await Maintenance.find().populate('fireExtinguisher').populate('performedBy');
    rows = items.map((m) => [
      m.maintenanceDate?.toISOString().split('T')[0],
      m.fireExtinguisher?.serialNumber,
      m.actionTaken,
      m.issuesIdentified || '',
      m.performedBy ? `${m.performedBy.firstName} ${m.performedBy.lastName}` : '',
    ]);
  }

  const filename = `fems-${type}-${Date.now()}`;

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    return res.send(rowsToCsv(headers, rows));
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);
  doc.fontSize(18).text(`TZW LTD - ${title}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown();
  rows.forEach((row, idx) => {
    doc.text(`${idx + 1}. ${row.join(' | ')}`);
  });
  doc.end();
});
