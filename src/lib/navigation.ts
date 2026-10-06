import type { AppRole } from './types/auth';
import { getEnabledModules, type ModuleConfig } from '@/config/modules';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: AppRole[];
  badge?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: string;
  defaultExpanded?: boolean;
  items: NavItem[];
}

// Group icons (used as the collapsible section icon)
const GROUP_ICONS: Record<string, string> = {
  'Overview':               'LayoutDashboard',
  'Client Management':      'Building2',
  'Dispatch & Operations':  'MapPin',
  'Compliance':             'ShieldCheck',
  'Verification Network':   'BadgeCheck',
  'Revenue':                'Receipt',
  'Administration':         'Settings',
};

// Groups that start expanded by default
const EXPANDED_GROUPS = new Set(['Overview', 'Client Management', 'Dispatch & Operations']);

function modulesToGroups(modules: ModuleConfig[]): NavGroup[] {
  const groupMap = new Map<string, NavItem[]>();
  const groupOrder: string[] = [];

  for (const mod of modules) {
    if (!groupMap.has(mod.group)) {
      groupMap.set(mod.group, []);
      groupOrder.push(mod.group);
    }
    const roles: AppRole[] = mod.adminOnly ? ['admin'] : ['admin', 'staff'];
    groupMap.get(mod.group)!.push({
      label: mod.label,
      href: mod.href,
      icon: mod.icon,
      roles,
    });
  }

  return groupOrder.map((groupLabel) => ({
    id: groupLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    label: groupLabel,
    icon: GROUP_ICONS[groupLabel] ?? 'LayoutDashboard',
    defaultExpanded: EXPANDED_GROUPS.has(groupLabel),
    items: groupMap.get(groupLabel)!,
  }));
}

/** Build nav groups for admin/staff from the enabled module config */
export function getNavGroups(role: AppRole): NavGroup[] {
  if (role === 'client') return CLIENT_NAV_GROUPS;
  const modules = getEnabledModules(role as 'admin' | 'staff');
  const groups = modulesToGroups(modules);
  return groups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((g) => g.items.length > 0);
}

export function getNavItems(role: AppRole): NavItem[] {
  return getNavGroups(role).flatMap((g) => g.items);
}

// ── Client portal nav (not affected by module flags) ──

export const CLIENT_NAV_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'LayoutDashboard',
    defaultExpanded: true,
    items: [
      { label: 'Dashboard',  href: '/portal/dashboard', icon: 'LayoutDashboard', roles: ['client'] },
      { label: 'Calendar',   href: '/portal/calendar',  icon: 'Calendar',        roles: ['client'] },
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: 'ShieldCheck',
    defaultExpanded: true,
    items: [
      { label: 'Alerts',     href: '/portal/alerts',    icon: 'AlertTriangle', roles: ['client'] },
      { label: 'Documents',  href: '/portal/documents', icon: 'FileText',      roles: ['client'] },
      { label: 'Upload',     href: '/portal/upload',    icon: 'Upload',        roles: ['client'] },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: 'Receipt',
    items: [
      { label: 'Invoices',  href: '/portal/invoices',  icon: 'Receipt', roles: ['client'] },
    ],
  },
];