import {
  Flame,
  ClipboardCheck,
  Shield,
  Users,
  BarChart3,
  AlertTriangle,
  Wrench,
} from 'lucide-react';

export const DASHBOARD_ICONS = {
  Flame,
  ClipboardCheck,
  Shield,
  Users,
  BarChart3,
  AlertTriangle,
  Wrench,
};

export function DashboardIcon({ name, className = 'h-6 w-6' }) {
  const Icon = DASHBOARD_ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

export function formatDashboardStat(card, stats) {
  if (!stats) return '—';
  const raw = stats[card.statKey];
  if (raw == null) return '—';
  if (card.format === 'percent') return `${raw}%`;
  return raw;
}

export function applyLabelTemplate(template, vars) {
  if (!template) return '';
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value ?? '')),
    template
  );
}
