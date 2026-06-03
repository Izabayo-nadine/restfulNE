const NOTIFICATION_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5005';

export async function callNotificationService(payload, logger) {
  try {
    const res = await fetch(`${NOTIFICATION_URL}/internal/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': process.env.INTERNAL_SERVICE_KEY || 'fems-internal-dev-key',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      logger.warn('Notification service call failed', { status: res.status, text });
    }
  } catch (err) {
    logger.warn('Notification service unreachable', { error: err.message });
  }
}

export async function notifyUser({ recipientId, title, message, type, relatedId }, logger) {
  return callNotificationService({ recipientIds: [recipientId], title, message, type, relatedId }, logger);
}

export async function notifyRole({ role, title, message, type, relatedId }, logger) {
  return callNotificationService({ role, title, message, type, relatedId }, logger);
}
