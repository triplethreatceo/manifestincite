import type { AppRole } from './types/auth';

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

// Grouped admin/staff navigation — ordered by client-facing importance
export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'LayoutDashboard',
    defaultExpanded: true,
    items: [
      { label: 'Dashboard',  href: '/dashboard',  icon: 'LayoutDashboard', roles: ['admin', 'staff'] },
      { label: 'Analytics', href: '/dispatch/analytics', icon: 'BarChart3', roles: ['admin', 'staff'] },
      { label: 'Calendar',   href: '/calendar',   icon: 'Calendar',        roles: ['admin', 'staff'] },
    ],
  },
  {
    id: 'clients',
    label: 'Client Management',
    icon: 'Building2',
    defaultExpanded: true,
    items: [
      { label: 'Clients',   href: '/clients',   icon: 'Building2', roles: ['admin', 'staff'] },
      { label: 'Drivers',   href: '/drivers',   icon: 'Users',     roles: ['admin', 'staff'] },
      { label: 'Vehicles',  href: '/vehicles',  icon: 'Truck',     roles: ['admin', 'staff'] },
    ],
  },
  {
    id: 'dispatch',
    label: 'Dispatch & Operations',
    icon: 'MapPin',
    defaultExpanded: true,
    items: [
      { label: 'Dispatch',  href: '/dispatch',          icon: 'MapPin',         roles: ['admin', 'staff'] },
      { label: 'Loads',     href: '/dispatch/loads',    icon: 'Package',        roles: ['admin', 'staff'] },
      { label: 'Messages',  href: '/dispatch/messages', icon: 'MessageSquare',  roles: ['admin', 'staff'] },
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: 'ShieldCheck',
    items: [
      { label: 'Alerts',     href: '/alerts',     icon: 'AlertTriangle', roles: ['admin', 'staff'] },
      { label: 'Documents',  href: '/documents',  icon: 'FileText',      roles: ['admin', 'staff'] },
      { label: 'Tasks',      href: '/tasks',      icon: 'CheckSquare',   roles: ['admin', 'staff'] },
    ],
  },
  {
    id: 'verification',
    label: 'Verification Network',
    icon: 'BadgeCheck',
    items: [
      { label: 'Overview',    href: '/verification',            icon: 'BadgeCheck',  roles: ['admin', 'staff'] },
      { label: 'Drivers',     href: '/verification/drivers',    icon: 'Users',       roles: ['admin', 'staff'] },
      { label: 'Carriers',    href: '/verification/carriers',   icon: 'Building2',   roles: ['admin', 'staff'] },
      { label: 'References',  href: '/verification/references', icon: 'FileText',    roles: ['admin', 'staff'] },
    ],
  },
  {
    id: 'revenue',
    label: 'Revenue',
    icon: 'Receipt',
    items: [
      { label: 'Invoices',  href: '/invoices',  icon: 'Receipt', roles: ['admin', 'staff'] },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: 'Settings',
    items: [
      { label: 'Settings',  href: '/settings',  icon: 'Settings', roles: ['admin'] },
    ],
  },
];

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

// Flat list helpers (for mobile nav and backwards compat)
export const ADMIN_NAV: NavItem[] = ADMIN_NAV_GROUPS.flatMap((g) => g.items);
export const CLIENT_NAV: NavItem[] = CLIENT_NAV_GROUPS.flatMap((g) => g.items);

export function getNavItems(role: AppRole): NavItem[] {
  if (role === 'client') return CLIENT_NAV;
  return ADMIN_NAV.filter((item) => item.roles.includes(role));
}

export function getNavGroups(role: AppRole): NavGroup[] {
  const groups = role === 'client' ? CLIENT_NAV_GROUPS : ADMIN_NAV_GROUPS;
  return groups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((g) => g.items.length > 0);
}