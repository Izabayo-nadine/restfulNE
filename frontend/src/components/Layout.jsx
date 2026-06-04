import { useState, useEffect } from 'react';
import { notificationApi } from '../api/services';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Flame,
  ClipboardCheck,
  Wrench,
  BarChart3,
  Users,
  User,
  Bell,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import ConfirmDialog from './ConfirmDialog';

const NAV_ITEMS = {
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/extinguishers', icon: Flame, label: 'Extinguishers' },
    { to: '/inspections', icon: ClipboardCheck, label: 'Inspections' },
    { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/profile', icon: User, label: 'Profile' },
  ],
  inspector: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/extinguishers', icon: Flame, label: 'Extinguishers' },
    { to: '/inspections', icon: ClipboardCheck, label: 'Inspections' },
    { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/profile', icon: User, label: 'Profile' },
  ],
  user: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/extinguishers', icon: Flame, label: 'Extinguishers' },
    { to: '/inspections', icon: ClipboardCheck, label: 'Inspections' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/profile', icon: User, label: 'Profile' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const { config } = useConfig();
  const roleLabels = config?.auth?.roleLabels ?? {};
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const links = NAV_ITEMS[user?.role] || NAV_ITEMS.user;

  useEffect(() => {
    if (!user) return;
    notificationApi
      .unreadCount()
      .then((res) => setUnreadCount(res.data.data?.count ?? 0))
      .catch(() => setUnreadCount(0));
  }, [user, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-brand-900 text-white transition lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-brand-800 px-6">
          <Flame className="h-8 w-8 text-brand-100" />
          <div>
            <p className="font-bold leading-tight">FEMS</p>
            <p className="text-xs text-brand-200">TZW LTD</p>
          </div>
          <button type="button" className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 p-4">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-700 text-white' : 'text-brand-100 hover:bg-brand-800'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{label}</span>
              {to === '/notifications' && unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-brand-800 p-4">
          <p className="truncate text-xs text-brand-300">{user?.email}</p>
          <p className="text-sm font-medium">{roleLabels[user?.role] || user?.role}</p>
          <button
            type="button"
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-100 hover:bg-brand-800"
            onClick={() => setLogoutConfirm(true)}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 shadow-sm lg:px-8">
          <button type="button" className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-slate-800">
            {roleLabels[user?.role] || 'FEMS'} — {user?.firstName} {user?.lastName}
          </h1>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        open={logoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out of the system?"
        confirmLabel="Logout"
        danger
        onCancel={() => setLogoutConfirm(false)}
        onConfirm={() => {
          setLogoutConfirm(false);
          handleLogout();
        }}
      />
    </div>
  );
}
