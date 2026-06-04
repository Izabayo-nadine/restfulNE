import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { reportApi } from '../api/services';
import Alert from '../components/Alert';
import AdminDashboard from './dashboards/AdminDashboard';
import InspectorDashboard from './dashboards/InspectorDashboard';
import UserDashboard from './dashboards/UserDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const { config } = useConfig();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    reportApi
      .dashboard()
      .then((res) => {
        const data = res.data.data;
        setStats(data.stats);
        setReports(data.reports);
      })
      .catch((err) => {
        setStats(null);
        setReports(null);
        setError(
          err.message ||
            'Could not load dashboard data. Ensure the backend is running (npm run dev in backend).'
        );
      })
      .finally(() => setLoading(false));
  }, [user?.role, user?.id]);

  const content =
    user?.role === 'admin' ? (
      <AdminDashboard stats={stats} reports={reports} loading={loading} />
    ) : user?.role === 'inspector' ? (
      <InspectorDashboard stats={stats} reports={reports} loading={loading} />
    ) : (
      <UserDashboard stats={stats} reports={reports} loading={loading} />
    );

  return (
    <div>
      {error && (
        <div className="mb-6">
          <Alert>{error}</Alert>
        </div>
      )}
      {content}
    </div>
  );
}
