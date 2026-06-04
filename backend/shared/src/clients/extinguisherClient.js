import { AppError } from '../utils/AppError.js';

const EXTINGUISHER_URL =
  process.env.EXTINGUISHER_SERVICE_URL || 'http://localhost:5002';

const internalHeaders = {
  'X-Internal-Key': process.env.INTERNAL_SERVICE_KEY || 'fems-internal-dev-key',
};

export async function getExtinguisherById(id, logger) {
  try {
    const res = await fetch(`${EXTINGUISHER_URL}/internal/extinguishers/${id}`, {
      headers: internalHeaders,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      logger.warn('Extinguisher lookup failed', { id, status: res.status, text });
      return null;
    }
    const json = await res.json();
    return json.data;
  } catch (err) {
    logger.warn('Extinguisher service unreachable', { id, error: err.message });
    return null;
  }
}

/** Delete all extinguishers assigned to a facility user; returns deleted IDs */
export async function deleteExtinguishersByUser(userId, logger) {
  try {
    const res = await fetch(`${EXTINGUISHER_URL}/internal/extinguishers/by-user/${userId}`, {
      method: 'DELETE',
      headers: internalHeaders,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      logger.warn('Extinguisher cascade delete failed', { userId, status: res.status, text });
      throw new AppError('Failed to remove extinguishers for this company', 502);
    }
    const json = await res.json();
    return json.data || { deletedCount: 0, extinguisherIds: [] };
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.warn('Extinguisher service unreachable for cascade delete', { userId, error: err.message });
    throw new AppError('Extinguisher service unavailable; user was not deleted', 503);
  }
}
