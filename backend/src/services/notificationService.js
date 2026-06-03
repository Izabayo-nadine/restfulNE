import Notification from '../models/Notification.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export async function createNotification({ recipientId, title, message, type = 'system', relatedId }) {
  const notification = await Notification.create({
    recipient: recipientId,
    title,
    message,
    type,
    relatedId,
  });
  logger.info('Notification created', { recipientId, type, title });
  return notification;
}

export async function notifyInspectorsForInspection(inspection, extinguisher) {
  const inspectors = await User.find({ role: 'inspector', isActive: true }).select('_id');
  const dateStr = new Date(inspection.inspectionDate).toLocaleDateString();
  await Promise.all(
    inspectors.map((inspector) =>
      createNotification({
        recipientId: inspector._id,
        title: 'New Inspection Scheduled',
        message: `Inspection for ${extinguisher.serialNumber} at ${extinguisher.location} on ${dateStr} at ${inspection.inspectionTime}.`,
        type: 'inspection',
        relatedId: inspection._id,
      })
    )
  );
}

export async function notifyAdminsCompliance(title, message, relatedId) {
  const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        recipientId: admin._id,
        title,
        message,
        type: 'compliance',
        relatedId,
      })
    )
  );
}
