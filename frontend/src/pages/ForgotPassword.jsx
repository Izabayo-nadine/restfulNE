import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound } from 'lucide-react';
import { authApi } from '../api/services';
import Alert, { FieldErrors } from '../components/Alert';
import PasswordField from '../components/PasswordField';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await authApi.forgotPasswordSendOtp(email.trim().toLowerCase());
      setMessage(res.data.message || 'If that email is registered, a code was sent. Check your inbox and spam.');
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors(null);
    setLoading(true);
    try {
      await authApi.forgotPasswordReset({ email: email.trim().toLowerCase(), otp, newPassword });
      setMessage('Password reset successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="card w-full max-w-md">
        <h2 className="text-xl font-bold">Forgot password</h2>
        <p className="mt-1 text-sm text-slate-600">
          {step === 1 ? 'We will send a 6-digit code to your email.' : 'Enter the code and your new password.'}
        </p>

        {step === 1 ? (
          <form className="mt-4 space-y-4" onSubmit={handleSendOtp}>
            {error && <Alert>{error}</Alert>}
            {message && <Alert type="success">{message}</Alert>}
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              <Mail className="h-4 w-4" />
              {loading ? 'Sending...' : 'Send reset code'}
            </button>
          </form>
        ) : (
          <form className="mt-4 space-y-4" onSubmit={handleReset}>
            {error && <Alert>{error}</Alert>}
            <FieldErrors errors={fieldErrors} />
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Enter the 6-digit code sent to <strong>{email}</strong>.
            </p>
            <div>
              <label className="label">6-digit code</label>
              <input
                className="input-field text-center tracking-widest"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
            <PasswordField
              id="new-password"
              label="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              hint="Min 8 chars, upper, lower, and number."
            />
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              <KeyRound className="h-4 w-4" />
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
            <button type="button" className="btn-secondary w-full" onClick={() => setStep(1)}>
              Back
            </button>
          </form>
        )}

        <Link to="/login" className="mt-4 block text-center text-sm text-brand-600">Back to login</Link>
      </div>
    </div>
  );
}
