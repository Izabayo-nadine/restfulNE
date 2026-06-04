import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { configApi } from '../api/services';

const ConfigContext = createContext(null);

function ConfigLoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-6">
      <div className="card w-full max-w-md text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="mt-4 font-medium text-slate-800">Loading application settings…</p>
        <p className="mt-1 text-sm text-slate-500">Connecting to the API gateway</p>
      </div>
    </div>
  );
}

function ConfigErrorScreen({ message, onRetry }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-6">
      <div className="card w-full max-w-md">
        <h2 className="text-lg font-bold text-red-800">Could not load settings</h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <p className="mt-2 text-sm text-slate-500">
          Ensure the backend is running: <code className="rounded bg-slate-100 px-1">cd backend && npm run dev</code>
        </p>
        <button type="button" className="btn-primary mt-4 w-full" onClick={onRetry}>
          Retry
        </button>
      </div>
    </div>
  );
}

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return configApi
      .get()
      .then((res) => {
        if (!res.data?.data) throw new Error('Invalid config response from server');
        setConfig(res.data.data);
      })
      .catch((err) => {
        setConfig(null);
        setError(err.message || 'Failed to load configuration');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <ConfigLoadingScreen />;
  if (error || !config) {
    return <ConfigErrorScreen message={error || 'Configuration unavailable'} onRetry={load} />;
  }

  return (
    <ConfigContext.Provider value={{ config, loading: false, error: null, reload: load }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx?.config) {
    throw new Error('useConfig must be used within ConfigProvider after config has loaded');
  }
  return ctx;
}
