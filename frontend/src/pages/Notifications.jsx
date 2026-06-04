import { useEffect, useState } from 'react';
import { notificationApi } from '../api/services';
import { useConfig } from '../context/ConfigContext';
import Pagination from '../components/Pagination';
import Alert from '../components/Alert';

export default function Notifications() {
  const { config } = useConfig();
  const pageLimit = config?.pagination?.defaultLimit ?? 10;
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError(null);
    notificationApi
      .list({ page, limit: pageLimit })
      .then((res) => {
        setItems(res.data.data || []);
        setPagination(res.data.pagination);
      })
      .catch((err) => setError(err.message || 'Failed to load notifications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [page, pageLimit]);

  const markRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const markAll = async () => {
    try {
      await notificationApi.markAllRead();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="mt-1 text-sm text-slate-600">
            Inspection and maintenance alerts for your account.
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={markAll}>
          Mark all read
        </button>
      </div>

      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-slate-500">Loading notifications...</p>
      ) : items.length === 0 ? (
        <div className="card mt-6 text-center text-slate-600">
          <p>No notifications yet.</p>
          <p className="mt-2 text-sm">
            Inspectors receive alerts when inspections are scheduled. Facility users receive alerts when maintenance is logged on their extinguishers.
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-6 space-y-3">
            {items.map((n) => (
              <li
                key={n._id}
                className={`card ${!n.isRead ? 'border-brand-200 bg-brand-50/30' : ''}`}
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{n.title}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-600">
                        {n.type}
                      </span>
                      {!n.isRead && (
                        <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white">New</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.isRead && (
                    <button
                      type="button"
                      className="btn-secondary !py-1 text-xs shrink-0"
                      onClick={() => markRead(n._id)}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
