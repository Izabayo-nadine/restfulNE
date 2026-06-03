const EXTINGUISHER_URL =
  process.env.EXTINGUISHER_SERVICE_URL || 'http://localhost:5002';

export async function getExtinguisherById(id, logger) {
  try {
    const res = await fetch(`${EXTINGUISHER_URL}/internal/extinguishers/${id}`, {
      headers: {
        'X-Internal-Key': process.env.INTERNAL_SERVICE_KEY || 'fems-internal-dev-key',
      },
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
