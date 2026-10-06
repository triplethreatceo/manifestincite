/**
 * Module feature-flag configuration.
 *
 * To re-enable a hidden module, set `enabled: true` on its entry.
 * That single-line change is all that's needed — the sidebar, route
 * guards and dashboard cards all read from this config.
 */

export interface ModuleConfig {
  /** Unique key — matches the route segment (e.g. 'invoices', 'alerts') */
  key: string;
  /** Display label in the sidebar */
  label: string;
  /** Sidebar group this module belongs to */
  group: string;
  /** Primary href for the nav item */
  href: string;
  /** Lucide icon name */
  icon: string;
  /** Whether the module is visible / accessible */
  enabled: boolean;
  /** If true, only admins can see this module even when enabled */
  adminOnly: boolean;
}

export const MODULE_CONFIG: ModuleConfig[] = [
  // ── Overview ──
  { key: 'dashboard',  label: 'Dashboard',  group: 'Overview',               href: '/dashboard',           icon: 'LayoutDashboard', enabled: true,  adminOnly: false },
  { key: 'analytics',  label: 'Analytics',  group: 'Overview',               href: '/dispatch/analytics',  icon: 'BarChart3',       enabled: false, adminOnly: false },
  { key: 'calendar',   label: 'Calendar',   group: 'Overview',               href: '/calendar',            icon: 'Calendar',        enabled: false, adminOnly: false },

  // ── Client Management ──
  { key: 'clients',    label: 'Clients',    group: 'Client Management',      href: '/clients',             icon: 'Building2',       enabled: true,  adminOnly: false },
  { key: 'drivers',    label: 'Drivers',    group: 'Client Management',      href: '/drivers',             icon: 'Users',           enabled: true,  adminOnly: false },
  { key: 'vehicles',   label: 'Vehicles',   group: 'Client Management',      href: '/vehicles',            icon: 'Truck',           enabled: true,  adminOnly: false },

  // ── Dispatch & Operations ──
  { key: 'dispatch',   label: 'Dispatch',   group: 'Dispatch & Operations',  href: '/dispatch',            icon: 'MapPin',          enabled: true,  adminOnly: false },
  { key: 'loads',      label: 'Loads',      group: 'Dispatch & Operations',  href: '/dispatch/loads',      icon: 'Package',         enabled: true,  adminOnly: false },
  { key: 'messages',   label: 'Messages',   group: 'Dispatch & Operations',  href: '/dispatch/messages',   icon: 'MessageSquare',   enabled: true,  adminOnly: false },

  // ── Compliance (hidden for now) ──
  { key: 'alerts',     label: 'Alerts',     group: 'Compliance',             href: '/alerts',              icon: 'AlertTriangle',   enabled: false, adminOnly: false },
  { key: 'documents',  label: 'Documents',  group: 'Compliance',             href: '/documents',           icon: 'FileText',        enabled: false, adminOnly: false },
  { key: 'tasks',      label: 'Tasks',      group: 'Compliance',             href: '/tasks',               icon: 'CheckSquare',     enabled: false, adminOnly: false },

  // ── Verification Network (hidden for now) ──
  { key: 'verification',          label: 'Overview',   group: 'Verification Network', href: '/verification',            icon: 'BadgeCheck', enabled: false, adminOnly: false },
  { key: 'verification_drivers',  label: 'Drivers',    group: 'Verification Network', href: '/verification/drivers',    icon: 'Users',      enabled: false, adminOnly: false },
  { key: 'verification_carriers', label: 'Carriers',   group: 'Verification Network', href: '/verification/carriers',   icon: 'Building2',  enabled: false, adminOnly: false },
  { key: 'verification_refs',     label: 'References', group: 'Verification Network', href: '/verification/references', icon: 'FileText',   enabled: false, adminOnly: false },

  // ── Revenue (hidden for now) ──
  { key: 'invoices',   label: 'Invoices',   group: 'Revenue',                href: '/invoices',            icon: 'Receipt',         enabled: false, adminOnly: false },

  // ── Administration ──
  { key: 'users',      label: 'Users',      group: 'Administration',         href: '/admin/users',         icon: 'Users',           enabled: true,  adminOnly: true  },
  { key: 'settings',   label: 'Settings',   group: 'Administration',         href: '/settings',            icon: 'Settings',        enabled: false, adminOnly: true  },
];

/** All enabled modules for a given role */
export function getEnabledModules(role: 'admin' | 'staff'): ModuleConfig[] {
  return MODULE_CONFIG.filter((m) => {
    if (!m.enabled) return false;
    if (m.adminOnly && role !== 'admin') return false;
    return true;
  });
}

/** Check if a module key is enabled (optionally for a specific role) */
export function isModuleEnabled(key: string, role?: 'admin' | 'staff'): boolean {
  const mod = MODULE_CONFIG.find((m) => m.key === key);
  if (!mod || !mod.enabled) return false;
  if (role && mod.adminOnly && role !== 'admin') return false;
  return true;
}

/** All disabled route prefixes — used by middleware to redirect */
export function getDisabledRoutePrefixes(): string[] {
  return MODULE_CONFIG
    .filter((m) => !m.enabled)
    .map((m) => m.href);
}