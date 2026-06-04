import { useEffect, useState, useMemo } from 'react';
import { Download, FileText } from 'lucide-react';
import { reportApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import Alert from '../components/Alert';
import ReportDisplay from '../components/reports/ReportDisplay';

export default function Reports() {
  const { hasRole } = useAuth();
  const { config } = useConfig();
  const tabs = config.reports.tabs;
  const periods = config.reports.inventoryPeriods;
  const pageLimit = config.pagination.defaultLimit;
  const defaultPeriod = config.reports.defaultInventoryPeriod;
  const defaultTab = tabs[0]?.id;
  const exportTypeByTab = config.reports.exportTypeByTab;
  const rolesWithExport = config.reports.rolesWithExport;
  const canExport = hasRole(...rolesWithExport);

  const [tab, setTab] = useState(defaultTab);
  const [period, setPeriod] = useState(defaultPeriod);
  const [maintenancePage, setMaintenancePage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeTab = useMemo(() => tabs.find((t) => t.id === tab), [tabs, tab]);

  useEffect(() => {
    if (defaultTab && !tabs.some((t) => t.id === tab)) {
      setTab(defaultTab);
    }
    if (defaultPeriod && !periods.some((p) => p.value === period)) {
      setPeriod(defaultPeriod);
    }
  }, [tabs, periods, defaultTab, defaultPeriod, tab, period]);

  useEffect(() => {
    if (!activeTab?.loader || !pageLimit) return;
    setError(null);
    setLoading(true);
    setData(null);

    const loaders = {
      inventory: () => reportApi.inventory(period),
      inspection: () => reportApi.inspections(),
      compliance: () => reportApi.compliance(),
      maintenance: () => reportApi.maintenance({ page: maintenancePage, limit: pageLimit }),
    };

    const load = loaders[activeTab.loader];
    if (!load) {
      setLoading(false);
      return;
    }

    load()
      .then((res) => setData(res.data.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeTab, period, pageLimit, maintenancePage]);

  const exportReport = async (format) => {
    const exportType = exportTypeByTab[tab];
    if (!exportType) return;
    try {
      const res = await reportApi.export(exportType, format);
      const blob = new Blob([res.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fems-${exportType}-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reports</h2>
          <p className="mt-1 text-sm text-slate-600">Summary charts and tables — export when you need a file.</p>
        </div>
        {canExport && (
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={() => exportReport('csv')}>
              <Download className="h-4 w-4" /> CSV
            </button>
            <button type="button" className="btn-secondary" onClick={() => exportReport('pdf')}>
              <FileText className="h-4 w-4" /> PDF
            </button>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === t.id ? 'bg-brand-600 text-white' : 'border bg-white text-slate-700'}`}
            onClick={() => {
              setTab(t.id);
              if (t.id === 'maintenance') setMaintenancePage(1);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {activeTab?.loader === 'inventory' && (
        <select className="input-field mt-4 max-w-xs" value={period} onChange={(e) => setPeriod(e.target.value)}>
          {periods.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      )}
      <div className="mt-6">
        {loading ? (
          <div className="card">
            <p className="text-slate-500">Loading report...</p>
          </div>
        ) : data ? (
          <ReportDisplay
            tab={tab}
            data={data}
            onMaintenancePageChange={setMaintenancePage}
          />
        ) : null}
      </div>
    </div>
  );
}
