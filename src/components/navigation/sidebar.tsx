'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { AuthUser } from '@/lib/types/auth';
import { getNavGroups } from '@/lib/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Truck,
  FileText,
  AlertTriangle,
  CheckSquare,
  Calendar,
  Receipt,
  Settings,
  Upload,
  LogOut,
  BadgeCheck,
  MapPin,
  Package,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, Building2, Users, Truck, FileText,
  AlertTriangle, CheckSquare, Calendar, Receipt, Settings,
  Upload, BadgeCheck, MapPin, Package, MessageSquare, ShieldCheck, BarChart3,
};

const STORAGE_KEY = 'manifestincite_nav_expanded';
const COLLAPSE_KEY = 'manifestincite_sidebar_collapsed';

interface SidebarProps {
  user: AuthUser;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const groups = getNavGroups(user.role);
  const [collapsed, setCollapsed] = useState(false);

  // Initialize expanded state from localStorage or defaults
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    groups.forEach((g) => { defaults[g.id] = g.defaultExpanded ?? false; });
    return defaults;
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setExpanded((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
      const savedCollapse = localStorage.getItem(COLLAPSE_KEY);
      if (savedCollapse) setCollapsed(JSON.parse(savedCollapse));
    } catch {}
  }, []);

  // Auto-expand group containing active route
  useEffect(() => {
    for (const g of groups) {
      if (g.items.some((item) => pathname === item.href || pathname.startsWith(item.href + '/'))) {
        setExpanded((prev) => {
          if (prev[g.id]) return prev;
          const next = { ...prev, [g.id]: true };
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
          return next;
        });
      }
    }
  }, [pathname, groups]);

  function toggleGroup(id: string) {
    setExpanded((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  return (
    <aside
      className={cn(
        'hidden md:flex md:flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200',
        collapsed ? 'md:w-16' : 'md:w-64',
      )}
    >
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-sidebar-border">
        <Link href="/" className={cn('flex items-baseline gap-0.5', collapsed && 'hidden')}>
          <span className="text-lg font-bold tracking-tight" style={{ color: '#C41E3A' }}>
            Manifest
          </span>
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
            Incite
          </span>
        </Link>
        {collapsed && (
          <Link href="/" className="mx-auto">
            <span className="text-lg font-bold" style={{ color: '#C41E3A' }}>M</span>
            <span className="text-lg font-bold text-sidebar-foreground">I</span>
          </Link>
        )}
        <button
          onClick={toggleCollapse}
          className={cn(
            'text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors',
            collapsed && 'hidden',
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={toggleCollapse}
          className="mx-auto mt-2 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
          title="Expand sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className={cn('flex-1 overflow-y-auto py-4 space-y-1', collapsed ? 'px-1.5' : 'px-3')}>
        {groups.map((group) => {
          const GroupIcon = ICON_MAP[group.icon] ?? LayoutDashboard;
          const isExpanded = expanded[group.id] ?? false;
          const hasActiveItem = group.items.some(
            (item) => pathname === item.href || pathname.startsWith(item.href + '/')
          );

          // Collapsed: show only icons for items in active group or first item per group
          if (collapsed) {
            return (
              <div key={group.id} className="mb-1">
                {group.items.map((item) => {
                  const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.label}
                      className={cn(
                        'flex items-center justify-center rounded-md p-2.5 transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  );
                })}
              </div>
            );
          }

          return (
            <div key={group.id} className="mb-1">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  'flex items-center justify-between w-full rounded-md px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors',
                  hasActiveItem
                    ? 'text-sidebar-foreground'
                    : 'text-sidebar-foreground/50 hover:text-sidebar-foreground/70'
                )}
              >
                <div className="flex items-center gap-2">
                  <GroupIcon className="h-3.5 w-3.5" />
                  {group.label}
                </div>
                <ChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform',
                    isExpanded ? '' : '-rotate-90'
                  )}
                />
              </button>

              {/* Group Items */}
              {isExpanded && (
                <div className="ml-2 border-l border-sidebar-border/50 pl-2 space-y-0.5 mt-0.5">
                  {group.items.map((item) => {
                    const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User info */}
      <div className={cn('border-t border-sidebar-border py-4', collapsed ? 'px-2' : 'px-4')}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
              {user.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
              {user.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-[11px] text-sidebar-foreground/50 capitalize">{user.role}</p>
            </div>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}