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

export default function AdminDashboard({ stats, reports, loading }) {
  const { config } = useConfig();
  const dash = config.dashboard.admin;
  const cards = dash.cards;
  const sections = dash.sections;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">{dash.title}</h2>
      <p className="mt-1 text-slate-600">{dash.subtitle}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
            compliance={reports.compliance}
            variant="admin"
          />
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <div key={section.id} className="card">
            <h3 className="font-semibold">{section.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{section.description}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={link.variant === 'primary' ? 'btn-primary' : 'btn-secondary'}
                >
                  {link.icon && <DashboardIcon name={link.icon} className="h-4 w-4" />}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
