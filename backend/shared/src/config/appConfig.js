/** Single source of truth for domain enums and tunable app settings. */

export const EXTINGUISHER_TYPES = ["Water", "CO₂", "Foam", "Dry Chemical"];
export const EXTINGUISHER_SIZES = ["1.5 lb", "5 lb", "9 lb", "12 lb"];
export const EXTINGUISHER_STATUSES = [
  "active",
  "inactive",
  "maintenance",
  "expired",
  "decommissioned",
];

export const INSPECTION_STATUSES = ["not_started", "completed"];

/** Older records may still use these values until re-seeded or completed. */
export const INSPECTION_NOT_STARTED_STATUSES = [
  "not_started",
  "scheduled",
  "overdue",
  "cancelled",
];

export const USER_ROLES = ["admin", "inspector", "user"];

export const ROLE_LABELS = {
  admin: "Administrator",
  inspector: "Inspector",
  user: "Facility user",
};

export const REPORT_TABS = [
  { id: "inventory", label: "Inventory", loader: "inventory" },
  { id: "inspection", label: "Inspections", loader: "inspection" },
  { id: "compliance", label: "Compliance", loader: "compliance" },
  { id: "maintenance", label: "Maintenance", loader: "maintenance" },
];

export const REPORT_EXPORT_TYPE_BY_TAB = Object.fromEntries(
  REPORT_TABS.map((t) => [t.id, t.id === "inspection" ? "inspection" : t.id]),
);

export const ROLES_WITH_COMPLIANCE_REPORT = ["admin", "inspector"];
export const ROLES_WITH_REPORT_EXPORT = ["admin", "inspector"];

export const ADMIN_DASHBOARD_CARDS = [
  {
    id: "total",
    label: "Total Extinguishers",
    statKey: "total",
    href: "/extinguishers",
    icon: "Flame",
    color: "bg-red-50 text-red-700",
    format: "number",
  },
  {
    id: "pending",
    label: "Pending Inspections",
    statKey: "pending",
    href: "/inspections",
    icon: "ClipboardCheck",
    color: "bg-amber-50 text-amber-700",
    format: "number",
  },
  {
    id: "overdue",
    label: "Overdue Inspections",
    statKey: "overdue",
    href: "/inspections",
    icon: "AlertTriangle",
    color: "bg-orange-50 text-orange-700",
    format: "number",
  },
  {
    id: "compliance",
    label: "Compliance Rate",
    statKey: "compliance",
    href: "/reports",
    icon: "Shield",
    color: "bg-emerald-50 text-emerald-700",
    format: "percent",
  },
  {
    id: "expired",
    label: "Expired Units",
    statKey: "expired",
    href: "/reports",
    icon: "Flame",
    color: "bg-slate-100 text-slate-700",
    format: "number",
  },
];

export const USER_DASHBOARD_CARDS = [
  {
    id: "total",
    label: "My extinguishers",
    statKey: "total",
    href: "/extinguishers",
    icon: "Flame",
    color: "bg-red-50 text-red-700",
    format: "number",
  },
  {
    id: "pending",
    label: "Scheduled inspections",
    statKey: "pending",
    href: "/inspections",
    icon: "ClipboardCheck",
    color: "bg-amber-50 text-amber-700",
    format: "number",
  },
  {
    id: "overdue",
    label: "Overdue inspections",
    statKey: "overdue",
    href: "/inspections",
    icon: "AlertTriangle",
    color: "bg-orange-50 text-orange-700",
    format: "number",
  },
  {
    id: "completed",
    label: "Completed inspections",
    statKey: "completed",
    href: "/inspections",
    icon: "ClipboardCheck",
    color: "bg-emerald-50 text-emerald-700",
    format: "number",
  },
];

export const INSPECTOR_DASHBOARD_CARDS = [
  {
    id: "pending",
    label: "Pending inspections",
    statKey: "pending",
    icon: "ClipboardCheck",
    color: "bg-amber-50 text-amber-700",
    format: "number",
  },
  {
    id: "overdue",
    label: "Overdue",
    statKey: "overdue",
    icon: "AlertTriangle",
    color: "bg-orange-50 text-orange-700",
    format: "number",
  },
  {
    id: "total",
    label: "Units in inventory",
    statKey: "total",
    icon: "Flame",
    color: "bg-red-50 text-red-700",
    format: "number",
  },
];

export const ADMIN_DASHBOARD_SECTIONS = [
  {
    id: "system",
    title: "System management",
    description: "User accounts, roles, and platform settings.",
    links: [
      {
        href: "/users",
        label: "Manage users",
        variant: "primary",
        icon: "Users",
      },
      {
        href: "/reports",
        label: "Reports",
        variant: "secondary",
        icon: "BarChart3",
      },
    ],
  },
  {
    id: "integrity",
    title: "Data integrity",
    description: "Maintain extinguisher inventory and review compliance.",
    links: [
      { href: "/extinguishers", label: "Extinguishers", variant: "secondary" },
      { href: "/inspections", label: "Inspections", variant: "secondary" },
    ],
  },
];

export const INSPECTOR_DASHBOARD_ACTIONS = [
  {
    href: "/inspections",
    label: "View & complete inspections",
    variant: "primary",
  },
  {
    href: "/maintenance",
    label: "Log maintenance",
    variant: "primary",
    icon: "Wrench",
  },
  {
    href: "/extinguishers",
    label: "Extinguisher records",
    variant: "secondary",
  },
];

export const STATUS_PILL_STYLES = {
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-slate-100 text-slate-700",
  maintenance: "bg-amber-100 text-amber-800",
  not_started: "bg-blue-100 text-blue-800",
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-slate-100 text-slate-700",
  compliant: "bg-emerald-100 text-emerald-800",
  at_risk: "bg-orange-100 text-orange-800",
  decommissioned: "bg-slate-100 text-slate-700",
  expired: "bg-red-100 text-red-800",
};

export const REPORT_LABELS = {
  inventory: {
    totalUnits: "Total units",
    typesTracked: "Types tracked",
    statusGroups: "Status groups",
    byType: "By type",
    byStatus: "By status",
    recentlyAdded: "Recently added",
    periodPrefix: "Period",
    unknownGroup: "Unknown",
    emptyRecent: "No extinguishers in this period",
    columns: { serial: "Serial", location: "Location", status: "Status" },
  },
  inspection: {
    pending: "Pending",
    completed: "Completed",
    overdue: "Overdue",
    upcomingTitle: "Upcoming inspections",
    emptyUpcoming: "No upcoming inspections scheduled",
    columns: { serial: "Serial", date: "Date", time: "Time", status: "Status" },
  },
  compliance: {
    overall: "Overall compliance",
    expiredTitle: "Expired",
    expiringWithin: "Expiring within {days} days",
    targetNote: "{count} expired unit(s) · Target: {target}% or higher",
    emptyExpired: "No expired units",
    emptyExpiring: "No upcoming expirations",
    columns: {
      serial: "Serial",
      location: "Location",
      expired: "Expired",
      expiry: "Expiry",
      status: "Status",
    },
  },
  maintenance: {
    totalRecords: "Total maintenance records",
    recentActivity: "Recent activity",
    historyTitle: "Maintenance history",
    emptyHistory: "No maintenance logged yet",
    columns: {
      date: "Date",
      serial: "Serial",
      action: "Action",
      condition: "Condition noted",
    },
  },
    dashboardSummary: {
    title: "Reports overview",
    viewAll: "View full reports →",
    userTitle: "Your facility overview",
    inventory: "Inventory",
    inventorySub: "total units",
    inventorySubUser: "assigned to you",
    pending: "Pending inspections",
    overdue: "Overdue",
    compliance: "Compliance",
    nextInspections: "Next inspections",
    expiredUnits: "Expired units ({count})",
    unknownUnit: "Unit",
  },
};

export const INVENTORY_PERIODS = [
  { value: "all", label: "All time" },
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

function envInt(name, fallback) {
  const n = parseInt(process.env[name], 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function getComplianceTargetPercent() {
  return envInt("COMPLIANCE_TARGET_PERCENT", 80);
}

export function getExpiryWarningDays() {
  return envInt("EXPIRY_WARNING_DAYS", 30);
}

export function getPaginationDefaults() {
  return {
    defaultLimit: envInt("PAGINATION_DEFAULT_LIMIT", 10),
    maxLimit: envInt("PAGINATION_MAX_LIMIT", 100),
  };
}

export function getDashboardPreviewLimit() {
  return envInt("DASHBOARD_PREVIEW_LIMIT", 3);
}

export function getReportRecentLimit() {
  return envInt("REPORT_RECENT_LIMIT", 5);
}

export function getReportUpcomingLimit() {
  return envInt("REPORT_UPCOMING_LIMIT", 10);
}

export function getDefaultInventoryPeriod() {
  return INVENTORY_PERIODS[0]?.value ?? "all";
}

/** Public metadata exposed to the frontend (no secrets). */
export function getPublicConfig() {
  const { defaultLimit, maxLimit } = getPaginationDefaults();
  return {
    extinguisher: {
      types: EXTINGUISHER_TYPES,
      sizes: EXTINGUISHER_SIZES,
      statuses: EXTINGUISHER_STATUSES,
    },
    inspection: {
      statuses: INSPECTION_STATUSES,
    },
    auth: {
      roles: USER_ROLES,
      roleLabels: ROLE_LABELS,
      rolesWithComplianceReport: ROLES_WITH_COMPLIANCE_REPORT,
    },
    reports: {
      tabs: REPORT_TABS,
      inventoryPeriods: INVENTORY_PERIODS,
      defaultInventoryPeriod: getDefaultInventoryPeriod(),
      exportTypeByTab: REPORT_EXPORT_TYPE_BY_TAB,
      rolesWithExport: ROLES_WITH_REPORT_EXPORT,
      labels: REPORT_LABELS,
      complianceTargetPercent: getComplianceTargetPercent(),
      expiryWarningDays: getExpiryWarningDays(),
      recentLimit: getReportRecentLimit(),
      upcomingLimit: getReportUpcomingLimit(),
    },
    dashboard: {
      admin: {
        title: "Admin dashboard",
        subtitle:
          "System overview — manage users, data integrity, compliance, and operations.",
        cards: ADMIN_DASHBOARD_CARDS,
        sections: ADMIN_DASHBOARD_SECTIONS,
      },
      inspector: {
        title: "Inspector dashboard",
        subtitle:
          "Conduct inspections, log results, and schedule maintenance activities.",
        cards: INSPECTOR_DASHBOARD_CARDS,
        actionsTitle: "Inspector actions",
        actions: INSPECTOR_DASHBOARD_ACTIONS,
      },
      user: {
        title: "My dashboard",
        subtitle: "View fire extinguisher status and schedule inspections for your facility.",
        cards: USER_DASHBOARD_CARDS,
      },
    },
    pagination: {
      defaultLimit,
      maxLimit,
    },
    ui: {
      dashboardPreviewLimit: getDashboardPreviewLimit(),
      complianceProgressHighThreshold: getComplianceTargetPercent(),
      statusPillStyles: STATUS_PILL_STYLES,
    },
  };
}
