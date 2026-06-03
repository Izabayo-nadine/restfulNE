import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { AppError, asyncHandler, getPagination, paginatedResponse } from '@fems/shared';

function toObjectId(id) {
  if (!id) return null;
  try {
    return new mongoose.Types.ObjectId(String(id));
  } catch {
    return null;
  }
}

const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY || 'fems-internal-dev-key';

async function resolveRecipientIds({ recipientIds, role }) {
  if (recipientIds?.length) return recipientIds;
  if (!role) return [];
  const res = await fetch(`${AUTH_URL}/internal/users/role/${role}`, {
    headers: { 'X-Internal-Key': INTERNAL_KEY },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export const internalNotify = asyncHandler(async (req, res) => {
  const { recipientIds, role, title, message, type, relatedId } = req.body;
  const ids = await resolveRecipientIds({ recipientIds, role });
  if (!ids.length) {
    return res.json({ success: true, message: 'No recipients', created: 0 });
  }
  const docs = await Notification.insertMany(
    ids.map((recipientId) => ({
      recipient: toObjectId(recipientId),
      title,
      message,
      type: type || 'system',
      relatedId: relatedId ? toObjectId(relatedId) : undefined,
    }))
  );
  res.status(201).json({ success: true, created: docs.length });
});

export const unreadCount = asyncHandler(async (req, res) => {
  const recipientId = toObjectId(req.user._id || req.user.id);
  if (!recipientId) throw new AppError('Invalid user session', 401);
  const count = await Notification.countDocuments({ recipient: recipientId, isRead: false });
  res.json({ success: true, data: { count } });
});

export const listNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const recipientId = toObjectId(req.user._id || req.user.id);
  if (!recipientId) throw new AppError('Invalid user session', 401);
  const filter = { recipient: recipientId };
  if (req.query.unread === 'true') filter.isRead = false;
  const [data, total] = await Promise.all([
    Notification.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);
  res.json(paginatedResponse(data, total, page, limit));
});

export const markAsRead = asyncHandler(async (req, res) => {
  const recipientId = toObjectId(req.user._id || req.user.id);
  const n = await Notification.findOne({ _id: req.params.id, recipient: recipientId });
  if (!n) throw new AppError('Notification not found', 404);
  n.isRead = true;
  await n.save();
  res.json({ success: true, data: n });
});

export const markAllRead = asyncHandler(async (req, res) => {
  const recipientId = toObjectId(req.user._id || req.user.id);
  await Notification.updateMany({ recipient: recipientId, isRead: false }, { isRead: true });
  res.json({ success: true, message: 'All notifications marked as read' });
});
