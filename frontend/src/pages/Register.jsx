import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail } from 'lucide-react';
import { authApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import Alert, { FieldErrors } from '../components/Alert';
import PasswordField from '../components/PasswordField';

export default function Register() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [emailSentTo, setEmailSentTo] = useState('');
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const normalizedEmail = form.email.trim().toLowerCase();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors(null);
    setSuccessMsg(null);
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      const res = await authApi.registerSendOtp({
        ...data,
        email: normalizedEmail,
      });
      setEmailSentTo(res.data.email || normalizedEmail);
      setSuccessMsg(res.data.message);
      setOtp('');
      setStep(2);
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      const res = await authApi.registerSendOtp({
        ...data,
        email: normalizedEmail,
      });
      setSuccessMsg(res.data.message || `New code sent to ${emailSentTo}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code from your email');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.registerVerifyOtp(emailSentTo || normalizedEmail, otp);
      const { user, token } = res.data.data;
      localStorage.setItem('fems_token', token);
      localStorage.setItem('fems_user', JSON.stringify(user));
      setUser(user);
      setSuccessMsg('Email verified! Signing you in...');
      navigate('/dashboard', { replace: true });
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
        <h2 className="text-2xl font-bold">Create user account</h2>
        <p className="mt-1 text-sm text-slate-600">
          {step === 1
            ? 'Enter your details. We will send a verification code to your email address.'
            : `Enter the 6-digit code we sent to ${emailSentTo || normalizedEmail}`}
        </p>

        {step === 1 ? (
          <form className="mt-6 space-y-4" onSubmit={handleSendOtp}>
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
              <label className="label">Email address</label>
              <input
                type="email"
                className="input-field"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
              />
              <p className="mt-1 text-xs text-slate-500">OTP will be sent to this email.</p>
            </div>
            <PasswordField
              id="register-password"
              label="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
              minLength={8}
              hint="Min 8 chars, upper, lower, and number."
            />
            <PasswordField
              id="register-confirm"
              label="Confirm password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              autoComplete="new-password"
            />
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              <UserPlus className="h-4 w-4" />
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleVerify}>
            {error && <Alert>{error}</Alert>}
            {successMsg && !error && <Alert type="success">{successMsg}</Alert>}
            <FieldErrors errors={fieldErrors} />
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              We sent a 6-digit code to <strong>{emailSentTo}</strong>. Check your inbox and spam folder.
            </p>
            <div>
              <label className="label">6-digit code from your email</label>
              <input
                className="input-field text-center text-lg tracking-widest"
                required
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading || otp.length !== 6}>
              <UserPlus className="h-4 w-4" />
              {loading ? 'Verifying & signing in...' : 'Verify email & sign in'}
            </button>
            <button type="button" className="btn-secondary w-full" disabled={loading} onClick={handleResendOtp}>
              Resend code to {emailSentTo}
            </button>
            <button type="button" className="text-sm text-slate-600 hover:text-brand-600" onClick={() => { setStep(1); setOtp(''); setError(null); }}>
              ← Change email or details
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm">
          Already have an account? <Link to="/login" className="font-semibold text-brand-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
