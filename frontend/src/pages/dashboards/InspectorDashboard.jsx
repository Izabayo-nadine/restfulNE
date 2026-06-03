import { Link } from 'react-router-dom';
import { ClipboardCheck, Wrench, Flame, AlertTriangle } from 'lucide-react';
import { DashboardReportSummary } from '../../components/reports/ReportDisplay';

export default function InspectorDashboard({ stats, reports, loading }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">Inspector dashboard</h2>
      <p className="mt-1 text-slate-600">
        Conduct inspections, log results, and schedule maintenance activities.
      </p>
      {loading ? (
        <p className="mt-8 text-slate-500">Loading...</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card flex items-center gap-4">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Pending inspections</p>
              <p className="text-2xl font-bold">{stats?.pending ?? '—'}</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="rounded-xl bg-orange-50 p-3 text-orange-700">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Overdue</p>
              <p className="text-2xl font-bold">{stats?.overdue ?? '—'}</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="rounded-xl bg-red-50 p-3 text-red-700">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Units in inventory</p>
              <p className="text-2xl font-bold">{stats?.total ?? '—'}</p>
            </div>
          </div>
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
      <div className="mt-8 card">
        <h3 className="font-semibold">Inspector actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/inspections" className="btn-primary">View & complete inspections</Link>
          <Link to="/maintenance" className="btn-primary"><Wrench className="h-4 w-4" /> Log maintenance</Link>
          <Link to="/extinguishers" className="btn-secondary">Extinguisher records</Link>
        </div>
      </div>
    </div>
  );
}
