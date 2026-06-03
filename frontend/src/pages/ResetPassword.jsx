import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../api/services';
import Alert, { FieldErrors } from '../components/Alert';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ token: params.get('token') || '', newPassword: '' });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authApi.resetPassword(form);
      navigate('/login');
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="card w-full max-w-md">
        <h2 className="text-xl font-bold">Reset password</h2>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          {error && <Alert>{error}</Alert>}
          <FieldErrors errors={fieldErrors} />
          <div>
            <label className="label">Token</label>
            <input className="input-field" required value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} />
          </div>
          <div>
            <label className="label">New password</label>
            <input type="password" className="input-field" required minLength={8} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary w-full">Reset password</button>
        </form>
        <Link to="/login" className="mt-4 block text-center text-sm text-brand-600">Back to login</Link>
      </div>
    </div>
  );
}
