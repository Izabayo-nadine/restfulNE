import { Link } from 'react-router-dom';
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

export default function InspectorDashboard({ stats, reports, loading }) {
  const { config } = useConfig();
  const dash = config.dashboard.inspector;
  const cards = dash.cards;
  const actions = dash.actions;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">{dash.title}</h2>
      <p className="mt-1 text-slate-600">{dash.subtitle}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? cards.map((card) => <StatCardSkeleton key={card.id} />)
          : cards.map((card) => (
              <div key={card.id} className="card flex items-center gap-4">
                <div className={`rounded-xl p-3 ${card.color}`}>
                  <DashboardIcon name={card.icon} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">{card.label}</p>
                  <p className="text-2xl font-bold">{formatDashboardStat(card, stats)}</p>
                </div>
              </div>
            ))}
      </div>

      {!loading && reports && (
        <div className="mt-8">
          <DashboardReportSummary
            inventory={reports.inventory}
            inspections={reports.inspections}
            compliance={reports.compliance}
            variant="admin"
          />
        </div>
      )}

      <div className="mt-8 card">
        <h3 className="font-semibold">{dash.actionsTitle}</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              to={action.href}
              className={action.variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
            >
              {action.icon && <DashboardIcon name={action.icon} className="h-4 w-4" />}
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
