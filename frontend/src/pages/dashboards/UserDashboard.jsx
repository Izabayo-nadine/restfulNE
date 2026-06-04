import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import { DashboardReportSummary } from '../../components/reports/ReportDisplay';
import { DashboardIcon, formatDashboardStat } from '../../utils/dashboardIcons';

function StatCardSkeleton() {
  return (
    <div className="card flex animate-pulse items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="h-8 w-16 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export default function UserDashboard({ stats, reports, loading }) {
  const { config } = useConfig();
  const dash = config.dashboard.user;
  const cards = dash.cards;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">{dash.title}</h2>
      <p className="mt-1 text-slate-600">{dash.subtitle}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {loading
          ? cards.map((card) => <StatCardSkeleton key={card.id} />)
          : cards.map((card) => (
              <Link
                key={card.id}
                to={card.href}
                className="card flex items-center gap-4 transition hover:shadow-md"
              >
                <div className={`rounded-xl p-3 ${card.color}`}>
                  <DashboardIcon name={card.icon} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">{card.label}</p>
                  <p className="text-2xl font-bold">{formatDashboardStat(card, stats)}</p>
                </div>
              </Link>
            ))}
      </div>

      {!loading && reports && (
        <div className="mt-8">
          <DashboardReportSummary
            inventory={reports.inventory}
            inspections={reports.inspections}
            compliance={null}
            variant="user"
          />
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
