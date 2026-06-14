import type { AppRole } from './types/auth';

type Permission = 'none' | 'read' | 'readwrite';

interface ModulePermission {
  admin: Permission;
  staff: Permission;
  client: Permission;
}

export const MODULE_PERMISSIONS: Record<string, ModulePermission> = {
  dashboard:      { admin: 'readwrite', staff: 'read',      client: 'none' },
  clients:        { admin: 'readwrite', staff: 'read',      client: 'none' },
  client_detail:  { admin: 'readwrite', staff: 'readwrite', client: 'none' },
  drivers:        { admin: 'readwrite', staff: 'readwrite', client: 'read' },
  vehicles:       { admin: 'readwrite', staff: 'readwrite', client: 'read' },
  documents:      { admin: 'readwrite', staff: 'readwrite', client: 'read' },
  alerts:         { admin: 'readwrite', staff: 'read',      client: 'read' },
  tasks:          { admin: 'readwrite', staff: 'readwrite', client: 'none' },
  calendar:       { admin: 'readwrite', staff: 'read',      client: 'read' },
  invoices:       { admin: 'readwrite', staff: 'read',      client: 'read' },
  mock_audit:     { admin: 'readwrite', staff: 'read',      client: 'read' },
  reports:        { admin: 'readwrite', staff: 'read',      client: 'read' },
  settings:       { admin: 'readwrite', staff: 'none',      client: 'none' },
  user_management:{ admin: 'readwrite', staff: 'none',      client: 'none' },
  // Portal-specific
  portal_dashboard:  { admin: 'none', staff: 'none', client: 'read' },
  portal_documents:  { admin: 'none', staff: 'none', client: 'readwrite' },
  portal_upload:     { admin: 'none', staff: 'none', client: 'readwrite' },
  portal_alerts:     { admin: 'none', staff: 'none', client: 'read' },
  portal_calendar:   { admin: 'none', staff: 'none', client: 'read' },
  portal_invoices:   { admin: 'none', staff: 'none', client: 'read' },
};

export function hasPermission(role: AppRole, module: string, level: 'read' | 'readwrite' = 'read'): boolean {
  const perms = MODULE_PERMISSIONS[module];
  if (!perms) return false;
  const userLevel = perms[role];
  if (level === 'read') return userLevel === 'read' || userLevel === 'readwrite';
  return userLevel === 'readwrite';
}

export function canAccessClient(role: AppRole, clientId: string, userClientId: string | null, assignedClientIds: string[]): boolean {
  if (role === 'admin') return true;
  if (role === 'staff') return assignedClientIds.includes(clientId);
  if (role === 'client') return clientId === userClientId;
  return false;
}