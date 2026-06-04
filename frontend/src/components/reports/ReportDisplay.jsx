import { Link } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import Pagination from '../Pagination';
import { applyLabelTemplate } from '../../utils/dashboardIcons';

function fmtDate(value) {
  if (!value) return '—';
  const s = typeof value === 'string' ? value : value?.toISOString?.() || String(value);
  return s.slice(0, 10);
}

function StatCard({ label, value, sub, accent = 'text-slate-900' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-600">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value ?? '—'}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function BreakdownList({ title, items, labelKey = '_id', unknownLabel }) {
  const rows = items || [];
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="font-semibold text-slate-900">{title}</h4>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No data</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((row) => (
            <li key={row[labelKey] || row.label}>
              <div className="flex justify-between text-sm">
                <span className="capitalize text-slate-700">{row[labelKey] || unknownLabel}</span>
                <span className="font-medium">{row.count}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-600"
                  style={{ width: `${(row.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SimpleTable({ columns, rows, emptyMessage }) {
  if (!rows?.length) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-slate-600">
            {columns.map((col) => (
              <th key={col.key} className="pb-3 text-left font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row._id || idx} className="border-b border-slate-100">
              {columns.map((col) => (
                <td key={col.key} className="py-3 capitalize">
                  {col.render ? col.render(row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status, styles }) {
  const label = String(status || '').replace(/_/g, ' ');
  const fallback = styles?.inactive || 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles?.[status] || fallback}`}>
      {label || '—'}
    </span>
  );
}

function InventoryView({ data, labels, statusStyles }) {
  const L = labels?.columns ?? {};
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label={labels?.totalUnits}
          value={data.total}
          sub={`${labels?.periodPrefix}: ${data.period || ''}`}
          accent="text-red-700"
        />
        <StatCard label={labels?.typesTracked} value={data.byType?.length ?? 0} />
        <StatCard label={labels?.statusGroups} value={data.byStatus?.length ?? 0} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <BreakdownList title={labels?.byType} items={data.byType} unknownLabel={labels?.unknownGroup} />
        <BreakdownList title={labels?.byStatus} items={data.byStatus} unknownLabel={labels?.unknownGroup} />
      </div>
      <div className="card !p-4">
        <h4 className="font-semibold">{labels?.recentlyAdded}</h4>
        <div className="mt-3">
          <SimpleTable
            emptyMessage={labels?.emptyRecent}
            rows={data.recent}
            columns={[
              { key: 'serialNumber', label: L.serial },
              { key: 'location', label: L.location },
              { key: 'status', label: L.status, render: (r) => <StatusPill status={r.status} styles={statusStyles} /> },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function InspectionView({ data, labels, statusStyles }) {
  const L = labels?.columns ?? {};
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={labels?.pending} value={data.pending} accent="text-amber-700" />
        <StatCard label={labels?.completed} value={data.completed} accent="text-emerald-700" />
        <StatCard label={labels?.overdue} value={data.overdue} accent="text-red-700" />
      </div>
      <div className="card !p-4">
        <h4 className="font-semibold">{labels?.upcomingTitle}</h4>
        <div className="mt-3">
          <SimpleTable
            emptyMessage={labels?.emptyUpcoming}
            rows={data.upcoming}
            columns={[
              {
                key: 'serial',
                label: L.serial,
                render: (r) => r.extinguisherSnapshot?.serialNumber || r.fireExtinguisher?.serialNumber || '—',
              },
              { key: 'inspectionDate', label: L.date, render: (r) => fmtDate(r.inspectionDate) },
              { key: 'inspectionTime', label: L.time },
              { key: 'status', label: L.status, render: (r) => <StatusPill status={r.status} styles={statusStyles} /> },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function ComplianceView({ data, labels, statusStyles, complianceTargetPercent }) {
  const rate = data.complianceRate ?? 0;
  const target = data.complianceTargetPercent ?? complianceTargetPercent ?? 0;
  const warningDays = data.expiryWarningDays ?? 0;
  const L = labels?.columns ?? {};
  return (
    <div className="space-y-6">
      <div className="card !p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-600">{labels?.overall}</p>
            <p className="text-4xl font-bold text-slate-900">{rate}%</p>
          </div>
          <StatusPill status={data.complianceStatus} styles={statusStyles} />
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${rate >= target ? 'bg-emerald-500' : 'bg-orange-500'}`}
            style={{ width: `${Math.min(rate, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {applyLabelTemplate(labels?.targetNote, { count: data.expiredCount ?? 0, target })}
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card !p-4">
          <h4 className="font-semibold text-red-800">{labels?.expiredTitle}</h4>
          <div className="mt-3">
            <SimpleTable
              emptyMessage={labels?.emptyExpired}
              rows={data.expired}
              columns={[
                { key: 'serialNumber', label: L.serial },
                { key: 'location', label: L.location },
                { key: 'expiryDate', label: L.expired, render: (r) => fmtDate(r.expiryDate) },
                { key: 'status', label: L.status, render: (r) => <StatusPill status={r.status} styles={statusStyles} /> },
              ]}
            />
          </div>
        </div>
        <div className="card !p-4">
          <h4 className="font-semibold text-amber-800">
            {applyLabelTemplate(labels?.expiringWithin, { days: warningDays })}
          </h4>
          <div className="mt-3">
            <SimpleTable
              emptyMessage={labels?.emptyExpiring}
              rows={data.upcomingExpirations}
              columns={[
                { key: 'serialNumber', label: L.serial },
                { key: 'location', label: L.location },
                { key: 'expiryDate', label: L.expiry, render: (r) => fmtDate(r.expiryDate) },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MaintenanceView({ data, labels, onPageChange }) {
  const L = labels?.columns ?? {};
  const serial = (m) =>
    m.extinguisherSnapshot?.serialNumber || m.fireExtinguisher?.serialNumber || '—';
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label={labels?.totalRecords}
          value={data.pagination?.total ?? data.history?.length ?? 0}
          accent="text-blue-700"
        />
        <StatCard label={labels?.recentActivity} value={data.recent?.length ?? 0} />
      </div>
      <div className="card !p-4">
        <h4 className="font-semibold">{labels?.historyTitle}</h4>
        <div className="mt-3">
          <SimpleTable
            emptyMessage={labels?.emptyHistory}
            rows={data.history}
            columns={[
              { key: 'maintenanceDate', label: L.date, render: (r) => fmtDate(r.maintenanceDate) },
              { key: 'serial', label: L.serial, render: serial },
              { key: 'actionTaken', label: L.action },
              { key: 'issuesIdentified', label: L.condition, render: (r) => r.issuesIdentified || '—' },
            ]}
          />
        </div>
        {data.pagination && onPageChange && (
          <div className="mt-4">
            <Pagination pagination={data.pagination} onPageChange={onPageChange} />
          </div>
        )}
      </div>
    </div>
  );
}

export function ReportGeneratedAt({ generatedAt }) {
  if (!generatedAt) return null;
  return (
    <p className="text-xs text-slate-500">
      Generated {new Date(generatedAt).toLocaleString()}
    </p>
  );
}

export default function ReportDisplay({ tab, data, onMaintenancePageChange }) {
  const { config } = useConfig();
  const reportLabels = config?.reports?.labels ?? {};
  const statusStyles = config?.ui?.statusPillStyles ?? {};
  const complianceTargetPercent = config?.reports?.complianceTargetPercent;

  if (!data) return null;
  const views = {
    inventory: (props) => (
      <InventoryView {...props} labels={reportLabels.inventory} statusStyles={statusStyles} />
    ),
    inspection: (props) => (
      <InspectionView {...props} labels={reportLabels.inspection} statusStyles={statusStyles} />
    ),
    compliance: (props) => (
      <ComplianceView
        {...props}
        labels={reportLabels.compliance}
        statusStyles={statusStyles}
        complianceTargetPercent={complianceTargetPercent}
      />
    ),
    maintenance: (props) => (
      <MaintenanceView
        {...props}
        labels={reportLabels.maintenance}
        onPageChange={onMaintenancePageChange}
      />
    ),
  };
  const View = views[tab];
  if (!View) return null;
  return (
    <div>
      <ReportGeneratedAt generatedAt={data.generatedAt} />
      <div className="mt-4">
        <View data={data} />
      </div>
    </div>
  );
}

/** Compact summary for dashboard */
export function DashboardReportSummary({ inventory, inspections, compliance, variant = 'admin' }) {
  const { config } = useConfig();
  const labels = config.reports.labels.dashboardSummary;
  const rate = compliance?.complianceRate;
  const target = compliance?.complianceTargetPercent ?? config.reports.complianceTargetPercent ?? 0;
  const previewLimit = config.ui.dashboardPreviewLimit ?? 0;
  const highThreshold = config.ui.complianceProgressHighThreshold ?? target;
  const isUser = variant === 'user';
  const title = isUser ? labels.userTitle : labels.title;

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        {!isUser && (
          <Link to="/reports" className="text-sm font-medium text-brand-600 hover:underline">
            {labels.viewAll}
          </Link>
        )}
      </div>
      <div className={`mt-4 grid gap-4 ${isUser ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
        <div className="rounded-lg bg-red-50 p-3">
          <p className="text-xs text-slate-600">{labels.inventory}</p>
          <p className="text-xl font-bold text-red-800">{inventory?.total ?? '—'}</p>
          <p className="text-xs text-slate-500">
            {isUser ? labels.inventorySubUser : labels.inventorySub}
          </p>
        </div>
        <div className="rounded-lg bg-amber-50 p-3">
          <p className="text-xs text-slate-600">{labels.pending}</p>
          <p className="text-xl font-bold text-amber-800">{inspections?.pending ?? '—'}</p>
        </div>
        <div className="rounded-lg bg-orange-50 p-3">
          <p className="text-xs text-slate-600">{labels.overdue}</p>
          <p className="text-xl font-bold text-orange-800">{inspections?.overdue ?? '—'}</p>
        </div>
        {compliance != null && (
          <div className="rounded-lg bg-emerald-50 p-3">
            <p className="text-xs text-slate-600">{labels.compliance}</p>
            <p className="text-xl font-bold text-emerald-800">{rate != null ? `${rate}%` : '—'}</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/80">
              <div
                className={`h-full rounded-full ${(rate ?? 0) >= highThreshold ? 'bg-emerald-600' : 'bg-orange-500'}`}
                style={{ width: `${Math.min(rate ?? 0, 100)}%`, maxWidth: '100%' }}
              />
            </div>
          </div>
        )}
      </div>
      {(inspections?.upcoming?.length > 0 ||
        compliance?.expired?.length > 0 ||
        (isUser && inventory?.recent?.length > 0)) &&
        previewLimit > 0 && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {isUser && inventory?.recent?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-700">Your extinguishers</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {inventory.recent.slice(0, previewLimit).map((e) => (
                  <li key={e._id}>
                    {e.serialNumber} — {e.location} ({e.status})
                  </li>
                ))}
              </ul>
            </div>
          )}
          {inspections?.upcoming?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-700">{labels.nextInspections}</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {inspections.upcoming.slice(0, previewLimit).map((i) => (
                  <li key={i._id}>
                    {i.extinguisherSnapshot?.serialNumber || labels.unknownUnit} — {fmtDate(i.inspectionDate)} at {i.inspectionTime || '—'}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {compliance?.expired?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-700">
                {applyLabelTemplate(labels.expiredUnits, { count: compliance.expiredCount })}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {compliance.expired.slice(0, previewLimit).map((e) => (
                  <li key={e._id}>
                    {e.serialNumber} — {e.location}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
