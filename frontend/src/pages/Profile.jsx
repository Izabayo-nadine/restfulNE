import { useState } from 'react';
import { authApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import Alert, { FieldErrors } from '../components/Alert';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);

  const saveProfile = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await authApi.updateProfile(profile);
      setUser(res.data.data);
      localStorage.setItem('fems_user', JSON.stringify(res.data.data));
      setMessage('Profile updated');
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await authApi.changePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      setMessage('Password changed');
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold">Profile</h2>
      <p className="text-sm text-slate-600 capitalize">Role: {user?.role}</p>
      {message && <div className="mt-4"><Alert type="success">{message}</Alert></div>}
      {error && <div className="mt-4"><Alert>{error}</Alert><FieldErrors errors={fieldErrors} /></div>}
      <form className="card mt-6 space-y-4" onSubmit={saveProfile}>
        <h3 className="font-semibold">Personal information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">First name</label>
            <input className="input-field" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
          </div>
          <div>
            <label className="label">Last name</label>
            <input className="input-field" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input-field" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
        </div>
        <button type="submit" className="btn-primary">Save profile</button>
      </form>
      <form className="card mt-6 space-y-4" onSubmit={changePassword}>
        <h3 className="font-semibold">Change password</h3>
        <div>
          <label className="label">Current password</label>
          <input type="password" className="input-field" required value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
        </div>
        <div>
          <label className="label">New password</label>
          <input type="password" className="input-field" required minLength={8} value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
        </div>
        <button type="submit" className="btn-secondary">Update password</button>
      </form>
    </div>
  );
}
