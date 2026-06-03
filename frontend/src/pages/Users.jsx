import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { authApi } from '../api/services';
import Pagination from '../components/Pagination';
import Alert, { FieldErrors } from '../components/Alert';
import PasswordField from '../components/PasswordField';

const emptyInspector = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyInspector);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);
  const [message, setMessage] = useState(null);

  const load = () => {
    authApi.listUsers({ page, limit: 10 }).then((res) => {
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    });
  };

  useEffect(() => {
    load();
  }, [page]);

  const toggleActive = async (id, isActive) => {
    await authApi.updateUser(id, { isActive });
    load();
  };

  const handleCreateInspector = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors(null);
    try {
      await authApi.createInspector(form);
      setMessage('Inspector account created successfully.');
      setModal(false);
      setForm(emptyInspector);
      load();
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors);
    }
  };

  const roleBadge = (role) => {
    const styles = {
      admin: 'bg-brand-100 text-brand-800',
      inspector: 'bg-amber-100 text-amber-800',
      user: 'bg-slate-100 text-slate-700',
    };
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[role] || styles.user}`}>
        {role}
      </span>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">User management</h2>
          <p className="mt-1 text-sm text-slate-600">
            Register inspector accounts. Facility users register themselves on the public sign-up page.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => { setModal(true); setError(null); setMessage(null); }}>
          <UserPlus className="h-4 w-4" />
          Register inspector
        </button>
      </div>

      {message && <div className="mt-4"><Alert type="success">{message}</Alert></div>}

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-slate-600">
              <th className="pb-3 text-left">Name</th>
              <th className="pb-3 text-left">Email</th>
              <th className="pb-3 text-left">Role</th>
              <th className="pb-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b">
                <td className="py-3">{u.firstName} {u.lastName}</td>
                <td className="py-3">{u.email}</td>
                <td className="py-3">{roleBadge(u.role)}</td>
                <td className="py-3">
                  {u.role === 'admin' ? (
                    <span className="text-slate-500">Active</span>
                  ) : (
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={u.isActive !== false}
                        onChange={(e) => toggleActive(u._id, e.target.checked)}
                      />
                      <span>{u.isActive !== false ? 'Active' : 'Inactive'}</span>
                    </label>
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
          <div className="card max-h-[90vh] w-full max-w-md overflow-y-auto">
            <h3 className="text-lg font-bold">Register inspector</h3>
            <p className="mt-1 text-sm text-slate-600">Create an inspector account. They will sign in with these credentials.</p>
            <form className="mt-4 space-y-4" onSubmit={handleCreateInspector}>
              {error && <Alert>{error}</Alert>}
              <FieldErrors errors={fieldErrors} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">First name</label>
                  <input className="input-field" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="label">Last name</label>
                  <input className="input-field" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input-field" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <PasswordField
                id="inspector-password"
                label="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
                minLength={8}
                hint="Min 8 characters with upper, lower, and number."
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create inspector</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
