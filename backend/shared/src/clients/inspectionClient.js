const INSPECTION_URL =
  process.env.INSPECTION_SERVICE_URL || 'http://localhost:5003';

const internalHeaders = {
  'Content-Type': 'application/json',
  'X-Internal-Key': process.env.INTERNAL_SERVICE_KEY || 'fems-internal-dev-key',
};

/** Delete inspections linked to removed extinguishers (user cascade delete). */
export async function deleteInspectionsByExtinguishers(extinguisherIds, logger) {
  const ids = (extinguisherIds || []).map((id) => id?.toString?.() || String(id));
  if (!ids.length) return { deletedCount: 0 };

  try {
    const res = await fetch(`${INSPECTION_URL}/internal/inspections/delete-by-extinguishers`, {
      method: 'POST',
      headers: internalHeaders,
      body: JSON.stringify({ extinguisherIds: ids }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      logger.warn('Inspection cascade delete failed', { status: res.status, text });
      return { deletedCount: 0 };
    }
    const json = await res.json();
    return json.data || { deletedCount: 0 };
  } catch (err) {
    logger.warn('Inspection service unreachable for cascade delete', { error: err.message });
    return { deletedCount: 0 };
  }
}
