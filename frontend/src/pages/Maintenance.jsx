import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { maintenanceApi, extinguisherApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import Alert, { FieldErrors } from '../components/Alert';

function formatPerformer(record) {
  const snap = record.performedBySnapshot;
  if (snap?.firstName || snap?.lastName) {
    return `${snap.firstName || ''} ${snap.lastName || ''}`.trim();
  }
  const user = record.performedBy;
  if (user && typeof user === 'object') {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    if (user.email) return user.email;
  }
  return '—';
}

export default function Maintenance() {
  const { hasRole } = useAuth();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [extinguishers, setExtinguishers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    fireExtinguisher: '',
    actionTaken: '',
    maintenanceDate: '',
    issuesIdentified: '',
    notesAndRecommendations: '',
  });
  const [fieldErrors, setFieldErrors] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    maintenanceApi
      .list({ page, limit: 10 })
      .then((res) => {
        setItems(res.data.data || []);
        setPagination(res.data.pagination);
      })
      .catch((err) => {
        setItems([]);
        setError(err.message || 'Failed to load maintenance records');
      });
  };

  useEffect(() => {
    load();
    extinguisherApi.list({ page: 1, limit: 100 }).then((res) => setExtinguishers(res.data.data));
  }, [page]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ...form,
        maintenanceDate: form.maintenanceDate.includes('T')
          ? form.maintenanceDate
          : `${form.maintenanceDate}T12:00:00.000Z`,
      };
      await maintenanceApi.log(payload);
      setModal(false);
      setForm({
        fireExtinguisher: '',
        actionTaken: '',
        maintenanceDate: '',
        issuesIdentified: '',
        notesAndRecommendations: '',
      });
      setPage(1);
      load();
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors);
    }
  };

  return (
    <div>
      <div className="flex justify-between gap-4">
        <h2 className="text-2xl font-bold">Maintenance</h2>
        {hasRole('inspector', 'admin') && (
          <button type="button" className="btn-primary" onClick={() => setModal(true)}>
            <Plus className="h-4 w-4" /> Log maintenance
          </button>
        )}
      </div>
      {error && !modal && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-slate-600">
              <th className="pb-3 text-left">Date</th>
              <th className="pb-3 text-left">Serial</th>
              <th className="pb-3 text-left">Action</th>
              <th className="pb-3 text-left">Condition noted</th>
              <th className="pb-3 text-left">Performed by</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No maintenance records yet. Log maintenance using the button above.
                </td>
              </tr>
            )}
            {items.map((m) => (
              <tr key={m._id} className="border-b">
                <td className="py-3">
                  {m.maintenanceDate
                    ? new Date(m.maintenanceDate).toISOString().slice(0, 10)
                    : '—'}
                </td>
                <td className="py-3">
                  {m.extinguisherSnapshot?.serialNumber ||
                    m.fireExtinguisher?.serialNumber ||
                    '—'}
                </td>
                <td className="py-3">{m.actionTaken}</td>
                <td className="py-3">{m.issuesIdentified || '—'}</td>
                <td className="py-3">
                  {formatPerformer(m)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto">
            <h3 className="font-bold">Log maintenance</h3>
            <form className="mt-4 space-y-3" onSubmit={submit}>
              {error && <Alert>{error}</Alert>}
              <FieldErrors errors={fieldErrors} />
              <div>
                <label className="label">Extinguisher</label>
                <select className="input-field" required value={form.fireExtinguisher} onChange={(e) => setForm({ ...form, fireExtinguisher: e.target.value })}>
                  <option value="">Select...</option>
                  {extinguishers.map((ex) => (
                    <option key={ex._id} value={ex._id}>{ex.serialNumber}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Action taken</label>
                <input className="input-field" required value={form.actionTaken} onChange={(e) => setForm({ ...form, actionTaken: e.target.value })} />
              </div>
              <div>
                <label className="label">Maintenance date</label>
                <input type="date" className="input-field" required value={form.maintenanceDate} onChange={(e) => setForm({ ...form, maintenanceDate: e.target.value })} />
              </div>
              <div>
                <label className="label">Condition noted during maintenance</label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="e.g. gauge in green zone, hose intact, minor dust"
                  value={form.issuesIdentified}
                  onChange={(e) => setForm({ ...form, issuesIdentified: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Notes & recommendations</label>
                <textarea className="input-field" rows={3} value={form.notesAndRecommendations} onChange={(e) => setForm({ ...form, notesAndRecommendations: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
