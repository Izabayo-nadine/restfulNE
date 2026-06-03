import PDFDocument from 'pdfkit';
import { FireExtinguisher, Inspection, Maintenance } from '../models/readModels.js';
import { asyncHandler, getPagination, paginatedResponse } from '@fems/shared';

function periodRange(period) {
  const now = new Date();
  let start = new Date(0);
  if (period === 'daily') start = new Date(now.setHours(0, 0, 0, 0));
  else if (period === 'monthly') start = new Date(now.getFullYear(), now.getMonth(), 1);
  else if (period === 'yearly') start = new Date(now.getFullYear(), 0, 1);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
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
  res.json({ success: true, data: { period, total, byType, byStatus, recent, generatedAt: new Date() } });
});

export const inspectionReport = asyncHandler(async (req, res) => {
  const now = new Date();
  await Inspection.updateMany(
    { status: 'scheduled', inspectionDate: { $lt: now } },
    { $set: { status: 'overdue' } }
  );
  const [pending, completed, overdue, upcoming] = await Promise.all([
    Inspection.countDocuments({ status: 'scheduled' }),
    Inspection.countDocuments({ status: 'completed' }),
    Inspection.countDocuments({ status: 'overdue' }),
    Inspection.find({ status: 'scheduled', inspectionDate: { $gte: now } }).sort('inspectionDate').limit(10),
  ]);
  res.json({ success: true, data: { pending, completed, overdue, upcoming, generatedAt: new Date() } });
});

export const complianceReport = asyncHandler(async (req, res) => {
  const now = new Date();
  const thirtyDays = new Date();
  thirtyDays.setDate(thirtyDays.getDate() + 30);
  const [expired, upcoming, active, total] = await Promise.all([
    FireExtinguisher.find({ expiryDate: { $lt: now } }).select('serialNumber location expiryDate status'),
    FireExtinguisher.find({ expiryDate: { $gte: now, $lte: thirtyDays } }).select('serialNumber location expiryDate'),
    FireExtinguisher.countDocuments({ status: 'active', expiryDate: { $gte: now } }),
    FireExtinguisher.countDocuments(),
  ]);
  const complianceRate = total ? Math.round((active / total) * 100) : 100;
  res.json({
    success: true,
    data: {
      expiredCount: expired.length,
      expired,
      upcomingExpirations: upcoming,
      complianceRate,
      complianceStatus: complianceRate >= 80 ? 'compliant' : 'at_risk',
      generatedAt: new Date(),
    },
  });
});

export const maintenanceReport = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [history, total, frequency, recent] = await Promise.all([
    Maintenance.find().sort('-maintenanceDate').skip(skip).limit(limit),
    Maintenance.countDocuments(),
    Maintenance.aggregate([
      { $group: { _id: '$fireExtinguisher', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Maintenance.find().sort('-createdAt').limit(5),
  ]);
  res.json({
    success: true,
    data: {
      history,
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

/** Draw a simple table in PDF (pdfkit has no built-in tables). */
function drawPdfTable(doc, headers, rows, startY = 120) {
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidth = pageWidth / headers.length;
  const rowHeight = 22;
  let y = startY;
  const left = doc.page.margins.left;

  doc.font('Helvetica-Bold').fontSize(9);
  headers.forEach((h, i) => {
    doc.text(String(h), left + i * colWidth, y, { width: colWidth - 4, ellipsis: true });
  });
  y += rowHeight;
  doc.moveTo(left, y - 4).lineTo(left + pageWidth, y - 4).stroke();

  doc.font('Helvetica').fontSize(8);
  rows.forEach((row) => {
    if (y > doc.page.height - doc.page.margins.bottom - 40) {
      doc.addPage();
      y = doc.page.margins.top;
    }
    row.forEach((cell, i) => {
      doc.text(String(cell ?? ''), left + i * colWidth, y, { width: colWidth - 4, ellipsis: true });
    });
    y += rowHeight;
  });
  return y;
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
      e.expiryDate?.toISOString?.()?.split('T')[0],
    ]);
  } else if (type === 'inspection') {
    title = 'Inspection Report';
    headers = ['Date', 'Time', 'Serial', 'Status', 'Result'];
    const items = await Inspection.find();
    rows = items.map((i) => [
      i.inspectionDate?.toISOString?.()?.split('T')[0],
      i.inspectionTime,
      i.extinguisherSnapshot?.serialNumber || '',
      i.status,
      i.result || '',
    ]);
  } else if (type === 'compliance') {
    title = 'Compliance Report';
    headers = ['Serial', 'Location', 'Expiry', 'Status'];
    const now = new Date();
    const items = await FireExtinguisher.find({
      expiryDate: { $lte: new Date(now.getTime() + 30 * 86400000) },
    });
    rows = items.map((e) => [
      e.serialNumber,
      e.location,
      e.expiryDate?.toISOString?.()?.split('T')[0],
      e.expiryDate < now ? 'expired' : 'upcoming',
    ]);
  } else {
    title = 'Maintenance Report';
    headers = ['Date', 'Serial', 'Action', 'Condition noted'];
    const items = await Maintenance.find();
    rows = items.map((m) => [
      m.maintenanceDate?.toISOString?.()?.split('T')[0],
      m.extinguisherSnapshot?.serialNumber || '',
      m.actionTaken,
      m.issuesIdentified || '',
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
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(res);
  doc.fontSize(18).text(`TZW LTD - ${title}`, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.fontSize(10).text(`Total records: ${rows.length}`, { align: 'center' });
  doc.moveDown();
  drawPdfTable(doc, headers, rows);
  doc.end();
});
