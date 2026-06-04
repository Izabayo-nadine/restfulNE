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
      return { deletedCount: 0, extinguisherIds: [] };
    }
    const json = await res.json();
    return json.data || { deletedCount: 0, extinguisherIds: [] };
  } catch (err) {
    logger.warn('Extinguisher service unreachable for cascade delete', { userId, error: err.message });
    return { deletedCount: 0, extinguisherIds: [] };
  }
}
