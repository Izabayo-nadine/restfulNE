import { useEffect, useState } from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import { inspectionApi, extinguisherApi, fetchAllPages } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import Pagination from '../components/Pagination';
import Alert, { FieldErrors } from '../components/Alert';
import { emptyInspectionForm } from '../utils/forms';

function formatDate(value) {
  if (!value) return '—';
  const s = typeof value === 'string' ? value : value;
  return String(s).slice(0, 10);
}

function inspectionSerial(item) {
  return item.extinguisherSnapshot?.serialNumber || item.fireExtinguisher?.serialNumber || '—';
}

function inspectionLocation(item) {
  return item.extinguisherSnapshot?.location || '—';
}

function statusBadgeClass(status) {
  const map = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-slate-100 text-slate-700',
  };
  return map[status] || 'bg-slate-100 text-slate-700';
}

export default function Inspections() {
  const { user, hasRole } = useAuth();
  const { config } = useConfig();
  const pageLimit = config?.pagination?.defaultLimit ?? 10;
  const listAllLimit = config?.pagination?.maxLimit ?? 100;
  const canComplete = hasRole('inspector', 'admin');
  const canSchedule = hasRole('admin', 'inspector', 'user');

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [extinguishers, setExtinguishers] = useState([]);
  const [modal, setModal] = useState(false);
  const [completeId, setCompleteId] = useState(null);
  const [form, setForm] = useState(emptyInspectionForm);
  const [completeForm, setCompleteForm] = useState({ result: '', notes: '' });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  const load = () => {
    setError(null);
    inspectionApi
      .list({ page, limit: pageLimit })
      .then((res) => {
        setItems(res.data.data || []);
        setPagination(res.data.pagination);
      })
      .catch((err) => {
        setItems([]);
        setError(err.message || 'Failed to load inspections');
      });
  };

  useEffect(() => {
    load();
    fetchAllPages(extinguisherApi.list, { limit: listAllLimit })
      .then(setExtinguishers)
      .catch(() => setExtinguishers([]));
  }, [page, pageLimit, listAllLimit]);

  const openSchedule = () => {
    setError(null);
    setFieldErrors(null);
    setSuccessMsg(null);
    setForm(emptyInspectionForm());
    setModal(true);
  };

  const schedule = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors(null);
    setSuccessMsg(null);
    try {
      await inspectionApi.schedule(form);
      setModal(false);
      setSuccessMsg('Inspection scheduled. An inspector will be notified.');
      setPage(1);
      load();
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors);
    }
  };

  const complete = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await inspectionApi.complete(completeId, completeForm);
      setCompleteId(null);
      setCompleteForm({ result: '', notes: '' });
      setSuccessMsg('Inspection marked as completed.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Inspections</h2>
          <p className="mt-1 text-sm text-slate-600">
            {user?.role === 'user'
              ? 'Schedule inspections for your facility and track their status.'
              : 'Schedule and complete fire extinguisher inspections.'}
          </p>
        </div>
        {canSchedule && (
          <button type="button" className="btn-primary" onClick={openSchedule}>
            <Plus className="h-4 w-4" /> Schedule inspection
          </button>
        )}
      </div>

      {successMsg && (
        <div className="mt-4">
          <Alert type="success">{successMsg}</Alert>
        </div>
      )}
      {error && !modal && !completeId && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b text-slate-600">
              <th className="pb-3 text-left">Serial</th>
              <th className="pb-3 text-left">Location</th>
              <th className="pb-3 text-left">Date</th>
              <th className="pb-3 text-left">Time</th>
              <th className="pb-3 text-left">Status</th>
              {canComplete && <th className="pb-3 text-left">Result</th>}
              <th className="pb-3 text-left">{canComplete ? 'Actions' : 'Next step'}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={canComplete ? 7 : 6} className="py-8 text-center text-slate-500">
                  No inspections yet.
                  {canSchedule && ' Use “Schedule inspection” to create one.'}
                </td>
              </tr>
            )}
            {items.map((i) => (
              <tr key={i._id} className="border-b border-slate-100">
                <td className="py-3 font-medium">{inspectionSerial(i)}</td>
                <td className="py-3">{inspectionLocation(i)}</td>
                <td className="py-3">{formatDate(i.inspectionDate)}</td>
                <td className="py-3">{i.inspectionTime || '—'}</td>
                <td className="py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${statusBadgeClass(i.status)}`}>
                    {i.status}
                  </span>
                </td>
                {canComplete && (
                  <td className="py-3">{i.result || '—'}</td>
                )}
                <td className="py-3">
                  {canComplete && i.status !== 'completed' ? (
                    <button
                      type="button"
                      className="btn-secondary !py-1 !px-2 text-xs"
                      onClick={() => {
                        setCompleteId(i._id);
                        setCompleteForm({ result: '', notes: '' });
                      }}
                    >
                      <CheckCircle className="h-3 w-3" /> Complete
                    </button>
                  ) : canComplete && i.status === 'completed' ? (
                    <span className="text-xs text-slate-500">Done</span>
                  ) : i.status === 'completed' ? (
                    <span className="text-xs text-emerald-700">{i.result || 'Completed'}</span>
                  ) : (
                    <span className="text-xs text-slate-600">Awaiting inspector</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md">
            <h3 className="font-bold">Schedule inspection</h3>
            <p className="mt-1 text-sm text-slate-600">
              Choose an extinguisher, date, and time. Inspectors will be notified.
            </p>
            <form className="mt-4 space-y-3" onSubmit={schedule}>
              {error && <Alert>{error}</Alert>}
              <FieldErrors errors={fieldErrors} />
              <div>
                <label className="label">Extinguisher</label>
                <select
                  className="input-field"
                  required
                  value={form.fireExtinguisher}
                  onChange={(e) => setForm({ ...form, fireExtinguisher: e.target.value })}
                >
                  <option value="">Select...</option>
                  {extinguishers.map((ex) => (
                    <option key={ex._id} value={ex._id}>
                      {ex.serialNumber} — {ex.location} ({ex.status})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input-field"
                  required
                  min={today}
                  value={form.inspectionDate}
                  onChange={(e) => setForm({ ...form, inspectionDate: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Time (HH:mm)</label>
                <input
                  type="time"
                  className="input-field"
                  required
                  value={form.inspectionTime}
                  onChange={(e) => setForm({ ...form, inspectionTime: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {completeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-md">
            <h3 className="font-bold">Complete inspection</h3>
            <form className="mt-4 space-y-3" onSubmit={complete}>
              {error && <Alert>{error}</Alert>}
              <div>
                <label className="label">Result</label>
                <input
                  className="input-field"
                  required
                  placeholder="Inspection result"
                  value={completeForm.result}
                  onChange={(e) => setCompleteForm({ ...completeForm, result: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={completeForm.notes}
                  onChange={(e) => setCompleteForm({ ...completeForm, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={() => setCompleteId(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

