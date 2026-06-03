import { Link } from 'react-router-dom';

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

function BreakdownList({ title, items, labelKey = '_id' }) {
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
                <span className="capitalize text-slate-700">{row[labelKey] || 'Unknown'}</span>
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

function SimpleTable({ columns, rows, emptyMessage = 'No records' }) {
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

function StatusPill({ status }) {
  const styles = {
    active: 'bg-emerald-100 text-emerald-800',
    inactive: 'bg-slate-100 text-slate-700',
    maintenance: 'bg-amber-100 text-amber-800',
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-emerald-100 text-emerald-800',
    overdue: 'bg-red-100 text-red-800',
    compliant: 'bg-emerald-100 text-emerald-800',
    at_risk: 'bg-orange-100 text-orange-800',
  };
  const label = String(status || '').replace(/_/g, ' ');
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
      {label || '—'}
    </span>
  );
}

function InventoryView({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total units" value={data.total} sub={`Period: ${data.period || 'all'}`} accent="text-red-700" />
        <StatCard label="Types tracked" value={data.byType?.length ?? 0} />
        <StatCard label="Status groups" value={data.byStatus?.length ?? 0} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <BreakdownList title="By type" items={data.byType} />
        <BreakdownList title="By status" items={data.byStatus} />
      </div>
      <div className="card !p-4">
        <h4 className="font-semibold">Recently added</h4>
        <div className="mt-3">
          <SimpleTable
            emptyMessage="No extinguishers in this period"
            rows={data.recent}
            columns={[
              { key: 'serialNumber', label: 'Serial' },
              { key: 'location', label: 'Location' },
              { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function InspectionView({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending" value={data.pending} accent="text-amber-700" />
        <StatCard label="Completed" value={data.completed} accent="text-emerald-700" />
        <StatCard label="Overdue" value={data.overdue} accent="text-red-700" />
      </div>
      <div className="card !p-4">
        <h4 className="font-semibold">Upcoming inspections</h4>
        <div className="mt-3">
          <SimpleTable
            emptyMessage="No upcoming inspections scheduled"
            rows={data.upcoming}
            columns={[
              {
                key: 'serial',
                label: 'Serial',
                render: (r) => r.extinguisherSnapshot?.serialNumber || r.fireExtinguisher?.serialNumber || '—',
              },
              { key: 'inspectionDate', label: 'Date', render: (r) => fmtDate(r.inspectionDate) },
              { key: 'inspectionTime', label: 'Time' },
              { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function ComplianceView({ data }) {
  const rate = data.complianceRate ?? 0;
  return (
    <div className="space-y-6">
      <div className="card !p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-600">Overall compliance</p>
            <p className="text-4xl font-bold text-slate-900">{rate}%</p>
          </div>
          <StatusPill status={data.complianceStatus} />
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${rate >= 80 ? 'bg-emerald-500' : 'bg-orange-500'}`}
            style={{ width: `${Math.min(rate, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {data.expiredCount ?? 0} expired unit(s) · Target: 80% or higher
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card !p-4">
          <h4 className="font-semibold text-red-800">Expired</h4>
          <div className="mt-3">
            <SimpleTable
              emptyMessage="No expired units"
              rows={data.expired}
              columns={[
                { key: 'serialNumber', label: 'Serial' },
                { key: 'location', label: 'Location' },
                { key: 'expiryDate', label: 'Expired', render: (r) => fmtDate(r.expiryDate) },
                { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
              ]}
            />
          </div>
        </div>
        <div className="card !p-4">
          <h4 className="font-semibold text-amber-800">Expiring within 30 days</h4>
          <div className="mt-3">
            <SimpleTable
              emptyMessage="No upcoming expirations"
              rows={data.upcomingExpirations}
              columns={[
                { key: 'serialNumber', label: 'Serial' },
                { key: 'location', label: 'Location' },
                { key: 'expiryDate', label: 'Expiry', render: (r) => fmtDate(r.expiryDate) },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MaintenanceView({ data }) {
  const serial = (m) =>
    m.extinguisherSnapshot?.serialNumber || m.fireExtinguisher?.serialNumber || '—';
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total maintenance records"
          value={data.pagination?.total ?? data.history?.length ?? 0}
          accent="text-blue-700"
        />
        <StatCard label="Recent activity" value={data.recent?.length ?? 0} />
      </div>
      <div className="card !p-4">
        <h4 className="font-semibold">Maintenance history</h4>
        <div className="mt-3">
          <SimpleTable
            emptyMessage="No maintenance logged yet"
            rows={data.history}
            columns={[
              { key: 'maintenanceDate', label: 'Date', render: (r) => fmtDate(r.maintenanceDate) },
              { key: 'serial', label: 'Serial', render: serial },
              { key: 'actionTaken', label: 'Action' },
              { key: 'issuesIdentified', label: 'Condition noted', render: (r) => r.issuesIdentified || '—' },
            ]}
          />
        </div>
        {data.pagination && (
          <p className="mt-3 text-xs text-slate-500">
            Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} records)
          </p>
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

export default function ReportDisplay({ tab, data }) {
  if (!data) return null;
  const views = {
    inventory: InventoryView,
    inspection: InspectionView,
    compliance: ComplianceView,
    maintenance: MaintenanceView,
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
export function DashboardReportSummary({ inventory, inspections, compliance }) {
  const rate = compliance?.complianceRate;
  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">Reports overview</h3>
        <Link to="/reports" className="text-sm font-medium text-brand-600 hover:underline">
          View full reports →
        </Link>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-red-50 p-3">
          <p className="text-xs text-slate-600">Inventory</p>
          <p className="text-xl font-bold text-red-800">{inventory?.total ?? '—'}</p>
          <p className="text-xs text-slate-500">total units</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-3">
          <p className="text-xs text-slate-600">Pending inspections</p>
          <p className="text-xl font-bold text-amber-800">{inspections?.pending ?? '—'}</p>
        </div>
        <div className="rounded-lg bg-orange-50 p-3">
          <p className="text-xs text-slate-600">Overdue</p>
          <p className="text-xl font-bold text-orange-800">{inspections?.overdue ?? '—'}</p>
        </div>
        {compliance != null && (
          <div className="rounded-lg bg-emerald-50 p-3">
            <p className="text-xs text-slate-600">Compliance</p>
            <p className="text-xl font-bold text-emerald-800">{rate != null ? `${rate}%` : '—'}</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/80">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{ width: `${Math.min(rate ?? 0, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
      {(inspections?.upcoming?.length > 0 || compliance?.expired?.length > 0) && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {inspections?.upcoming?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-700">Next inspections</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {inspections.upcoming.slice(0, 3).map((i) => (
                  <li key={i._id}>
                    {i.extinguisherSnapshot?.serialNumber || 'Unit'} — {fmtDate(i.inspectionDate)} at {i.inspectionTime || '—'}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {compliance?.expired?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-700">Expired units ({compliance.expiredCount})</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {compliance.expired.slice(0, 3).map((e) => (
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
