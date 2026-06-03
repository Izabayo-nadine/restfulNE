import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert, { FieldErrors } from '../components/Alert';
import PasswordField from '../components/PasswordField';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors(null);
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="card w-full max-w-lg">
        <h2 className="text-2xl font-bold">Sign in</h2>
        <p className="mt-1 text-sm text-slate-600">Enter your credentials to access the system.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && <Alert>{error}</Alert>}
          <FieldErrors errors={fieldErrors} />
          <div>
            <label className="label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
              placeholder="you@company.com"
            />
          </div>
          <PasswordField
            id="password"
            label="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            <LogIn className="h-4 w-4" />
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Need a facility account?{' '}
          <Link to="/register" className="font-semibold text-brand-600">
            Register as user
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-500">
          Inspector accounts are created by your system administrator.
        </p>
      </div>
    </div>
  );
}
