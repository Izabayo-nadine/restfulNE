import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportApi } from '../api/services';
import AdminDashboard from './dashboards/AdminDashboard';
import InspectorDashboard from './dashboards/InspectorDashboard';
import UserDashboard from './dashboards/UserDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requests = [reportApi.inventory('all'), reportApi.inspections()];
    const showReports = user?.role === 'admin' || user?.role === 'inspector';
    if (user?.role === 'admin' || user?.role === 'inspector') {
      requests.push(reportApi.compliance());
    }
    Promise.all(requests)
      .then((results) => {
        const inv = results[0].data.data;
        const insp = results[1].data.data;
        const comp = results[2]?.data?.data;
        setStats({
          total: inv.total,
          pending: insp.pending,
          overdue: insp.overdue,
          compliance: comp?.complianceRate,
          expired: comp?.expiredCount,
        });
        if (showReports) {
          setReports({ inventory: inv, inspections: insp, compliance: comp });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.role]);

  if (user?.role === 'admin') {
    return <AdminDashboard stats={stats} reports={reports} loading={loading} />;
  }
  if (user?.role === 'inspector') {
    return <InspectorDashboard stats={stats} reports={reports} loading={loading} />;
  }
  return <UserDashboard stats={stats} loading={loading} />;
}
