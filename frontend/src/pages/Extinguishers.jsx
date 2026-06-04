import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { authApi, extinguisherApi, fetchAllPages } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import Alert, { FieldErrors } from '../components/Alert';
import { emptyExtinguisherForm } from '../utils/forms';

function companyLabel(user) {
  return `${user.firstName} ${user.lastName} (${user.email})`;
}

function companyFromItem(item) {
  const s = item.companySnapshot;
  if (!s) return '—';
  return `${s.firstName} ${s.lastName}`;
}

function extinguisherPayload(form) {
  return {
    serialNumber: form.serialNumber,
    location: form.location,
    type: form.type,
    size: form.size,
    installationDate: form.installationDate,
    expiryDate: form.expiryDate,
    status: form.status,
    assignedTo: form.assignedTo,
  };
}

export default function Extinguishers() {
  const { hasRole, user } = useAuth();
  const { config } = useConfig();
  const pageLimit = config?.pagination?.defaultLimit ?? 10;
  const listAllLimit = config?.pagination?.maxLimit ?? 100;
  const types = config?.extinguisher?.types ?? [];
  const sizes = config?.extinguisher?.sizes ?? [];
  const statuses = config?.extinguisher?.statuses ?? [];
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(() => emptyExtinguisherForm(config));
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);
  const [companies, setCompanies] = useState([]);

  const load = () => {
    extinguisherApi
      .list({ page, limit: pageLimit, search: search || undefined })
      .then((res) => {
        setItems(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
  }, [page, search, pageLimit]);

  useEffect(() => {
    if (!hasRole('admin')) return;
    fetchAllPages(authApi.listUsers, { limit: listAllLimit, role: 'user' })
      .then((list) => setCompanies(list.filter((u) => u.isActive !== false)))
      .catch(() => setCompanies([]));
  }, [listAllLimit]);

  const openCreate = () => {
    setForm(emptyExtinguisherForm(config));
    setModal('create');
    setError(null);
    setFieldErrors(null);
  };

  const openEdit = (item) => {
    setForm({
      ...emptyExtinguisherForm(config),
      serialNumber: item.serialNumber,
      location: item.location,
      type: item.type,
      size: item.size,
      status: item.status,
      assignedTo: item.assignedTo?.toString?.() || item.assignedTo || '',
      installationDate: item.installationDate?.slice(0, 10),
      expiryDate: item.expiryDate?.slice(0, 10),
    });
    setModal(item._id);
    setError(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors(null);
    try {
      const payload = extinguisherPayload(form);
      if (modal === 'create') {
        await extinguisherApi.create(payload);
      } else {
        await extinguisherApi.update(modal, payload);
      }
      setModal(null);
      load();
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors);
    }
  };

  const handleDelete = async () => {
    try {
      await extinguisherApi.remove(deleteId);
      setDeleteId(null);
      load();
    } catch (err) {
      setError(err.message);
      setDeleteId(null);
    }
  };

  const canEdit = hasRole('admin');
  const canDelete = hasRole('admin');
  const isViewOnly = !canEdit;
  const showCompanyColumn = user?.role !== 'user';
  const colCount = 5 + (showCompanyColumn ? 1 : 0) + (canEdit || canDelete ? 1 : 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Fire Extinguishers</h2>
          <p className="text-sm text-slate-600">
            {user?.role === 'inspector'
              ? 'View extinguisher inventory (read-only).'
              : isViewOnly
                ? 'View extinguisher status, location, and expiry for your facility.'
                : 'Register extinguishers and assign each to a facility company managed by TZW Ltd.'}
          </p>
        </div>
        {canEdit && (
          <button type="button" className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add extinguisher
          </button>
        )}
      </div>

      {error && !modal && <div className="mt-4"><Alert>{error}</Alert></div>}

      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input-field pl-10"
          placeholder="Search serial or location..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b text-slate-600">
              <th className="pb-3 pr-4">Serial</th>
              {showCompanyColumn && <th className="pb-3 pr-4">Company</th>}
              <th className="pb-3 pr-4">Location</th>
              <th className="pb-3 pr-4">Type</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Expiry</th>
              {(canEdit || canDelete) && <th className="pb-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={colCount} className="py-8 text-center text-slate-500">
                  No extinguishers found.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item._id} className="border-b border-slate-100">
                <td className="py-3 font-medium">{item.serialNumber}</td>
                {showCompanyColumn && <td className="py-3">{companyFromItem(item)}</td>}
                <td className="py-3">{item.location}</td>
                <td className="py-3">{item.type}</td>
                <td className="py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                      item.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="py-3">
                  {item.expiryDate
                    ? new Date(item.expiryDate).toISOString().slice(0, 10)
                    : '—'}
                </td>
                {(canEdit || canDelete) && (
                  <td className="py-3">
                    <div className="flex gap-2">
                      {canEdit && (
                        <button type="button" className="rounded p-1 hover:bg-slate-100" onClick={() => openEdit(item)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button type="button" className="rounded p-1 text-red-600 hover:bg-red-50" onClick={() => setDeleteId(item._id)} aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto">
            <h3 className="text-lg font-bold">{modal === 'create' ? 'Register' : 'Edit'} Extinguisher</h3>
            <form className="mt-4 space-y-3" onSubmit={handleSave}>
              {error && <Alert>{error}</Alert>}
              <FieldErrors errors={fieldErrors} />
              {canEdit && (
                <div>
                  <label className="label">Facility company</label>
                  <select
                    className="input-field"
                    required
                    value={form.assignedTo}
                    onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  >
                    <option value="">Select company account…</option>
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {companyLabel(c)}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    Each facility user represents a company managed by TZW Ltd.
                  </p>
                </div>
              )}
              <div>
                <label className="label">Serial number</label>
                <input className="input-field" required value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input-field" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Type</label>
                  <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {types.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Size</label>
                  <select className="input-field" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>
                    {sizes.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Installation date</label>
                  <input type="date" className="input-field" required value={form.installationDate} onChange={(e) => setForm({ ...form, installationDate: e.target.value })} />
                </div>
                <div>
                  <label className="label">Expiry date</label>
                  <input type="date" className="input-field" required value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete extinguisher"
        message="This action cannot be undone. Are you sure you want to remove this record?"
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
