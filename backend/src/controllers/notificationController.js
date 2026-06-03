import Notification from '../models/Notification.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { recipient: req.user._id };
  if (req.query.unread === 'true') filter.isRead = false;
  const [data, total] = await Promise.all([
    Notification.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);
  res.json(paginatedResponse(data, total, page, limit));
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
  if (!notification) throw new AppError('Notification not found', 404);
  notification.isRead = true;
  await notification.save();
  res.json({ success: true, data: notification });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: 'All notifications marked as read' });
});
