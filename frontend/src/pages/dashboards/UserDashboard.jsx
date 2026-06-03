import { Link } from 'react-router-dom';
import { Flame, ClipboardCheck, Eye } from 'lucide-react';

export default function UserDashboard({ stats, loading }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">My dashboard</h2>
      <p className="mt-1 text-slate-600">
        View fire extinguisher status and schedule inspections for your facility.
      </p>
      {loading ? (
        <p className="mt-8 text-slate-500">Loading...</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link to="/extinguishers" className="card flex items-center gap-4 transition hover:shadow-md">
            <div className="rounded-xl bg-red-50 p-3 text-red-700">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Extinguishers available</p>
              <p className="text-2xl font-bold">{stats?.total ?? '—'}</p>
            </div>
          </Link>
          <Link to="/inspections" className="card flex items-center gap-4 transition hover:shadow-md">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Scheduled inspections</p>
              <p className="text-2xl font-bold">{stats?.pending ?? '—'}</p>
            </div>
          </Link>
        </div>
      )}
      <div className="mt-8 card border-brand-100 bg-brand-50/30">
        <div className="flex items-start gap-3">
          <Eye className="mt-0.5 h-5 w-5 text-brand-600" />
          <div>
            <h3 className="font-semibold text-slate-900">What you can do</h3>
            <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
              <li>Browse extinguisher status and locations</li>
              <li>Schedule inspections for your building</li>
              <li>View inspection history</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/extinguishers" className="btn-primary">View extinguishers</Link>
              <Link to="/inspections" className="btn-secondary">Schedule inspection</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
