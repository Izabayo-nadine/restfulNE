import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { reportApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import ReportDisplay from '../components/reports/ReportDisplay';

const TABS = [
  { id: 'inventory', label: 'Inventory' },
  { id: 'inspection', label: 'Inspections' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'maintenance', label: 'Maintenance' },
];

export default function Reports() {
  const { hasRole } = useAuth();
  const [tab, setTab] = useState('inventory');
  const [period, setPeriod] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    setLoading(true);
    setData(null);
    const loaders = {
      inventory: () => reportApi.inventory(period),
      inspection: () => reportApi.inspections(),
      compliance: () => reportApi.compliance(),
      maintenance: () => reportApi.maintenance({ page: 1, limit: 10 }),
    };
    loaders[tab]()
      .then((res) => setData(res.data.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tab, period]);

  const exportReport = async (format) => {
    try {
      const res = await reportApi.export(tab === 'inspection' ? 'inspection' : tab, format);
      const blob = new Blob([res.data], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fems-${tab}-${Date.now()}.${format}`;
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
        {hasRole('admin', 'inspector') && (
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
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === t.id ? 'bg-brand-600 text-white' : 'border bg-white text-slate-700'}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'inventory' && (
        <select className="input-field mt-4 max-w-xs" value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="all">All time</option>
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      )}
      <div className="mt-6">
        {loading ? (
          <div className="card">
            <p className="text-slate-500">Loading report...</p>
          </div>
        ) : data ? (
          <ReportDisplay tab={tab} data={data} />
        ) : null}
      </div>
    </div>
  );
}
