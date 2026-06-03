import { Link } from 'react-router-dom';
import { Flame, ClipboardCheck, Shield, Users, BarChart3, AlertTriangle } from 'lucide-react';
import { DashboardReportSummary } from '../../components/reports/ReportDisplay';

export default function AdminDashboard({ stats, reports, loading }) {
  const cards = [
    { label: 'Total Extinguishers', value: stats?.total, icon: Flame, to: '/extinguishers', color: 'bg-red-50 text-red-700' },
    { label: 'Pending Inspections', value: stats?.pending, icon: ClipboardCheck, to: '/inspections', color: 'bg-amber-50 text-amber-700' },
    { label: 'Overdue Inspections', value: stats?.overdue, icon: AlertTriangle, to: '/inspections', color: 'bg-orange-50 text-orange-700' },
    { label: 'Compliance Rate', value: stats ? `${stats.compliance}%` : '—', icon: Shield, to: '/reports', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Expired Units', value: stats?.expired, icon: Flame, to: '/reports', color: 'bg-slate-100 text-slate-700' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">Admin dashboard</h2>
      <p className="mt-1 text-slate-600">
        System overview — manage users, data integrity, compliance, and operations.
      </p>
      {loading ? (
        <p className="mt-8 text-slate-500">Loading...</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ label, value, icon: Icon, to, color }) => (
            <Link key={label} to={to} className="card flex items-center gap-4 transition hover:shadow-md">
              <div className={`rounded-xl p-3 ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-600">{label}</p>
                <p className="text-2xl font-bold">{value ?? '—'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      {!loading && reports && (
        <div className="mt-8">
          <DashboardReportSummary
            inventory={reports.inventory}
            inspections={reports.inspections}
            compliance={reports.compliance}
          />
        </div>
      )}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="card">
          <h3 className="font-semibold">System management</h3>
          <p className="mt-2 text-sm text-slate-600">User accounts, roles, and platform settings.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/users" className="btn-primary"><Users className="h-4 w-4" /> Manage users</Link>
            <Link to="/reports" className="btn-secondary"><BarChart3 className="h-4 w-4" /> Reports</Link>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold">Data integrity</h3>
          <p className="mt-2 text-sm text-slate-600">Maintain extinguisher inventory and review compliance.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/extinguishers" className="btn-secondary">Extinguishers</Link>
            <Link to="/inspections" className="btn-secondary">Inspections</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
