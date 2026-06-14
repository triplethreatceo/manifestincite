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
  Shield,
  BadgeCheck,
  MapPin,
  Package,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, Building2, Users, Truck, FileText,
  AlertTriangle, CheckSquare, Calendar, Receipt, Settings,
  Upload, Shield, BadgeCheck, MapPin, Package, MessageSquare, ShieldCheck,
};

const STORAGE_KEY = 'manifestincite_nav_expanded';

interface SidebarProps {
  user: AuthUser;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const groups = getNavGroups(user.role);

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

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wide text-sidebar-foreground">
            ManifestIncite
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
            Compliance Portal
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {groups.map((group) => {
          const GroupIcon = ICON_MAP[group.icon] ?? LayoutDashboard;
          const isExpanded = expanded[group.id] ?? false;
          const hasActiveItem = group.items.some(
            (item) => pathname === item.href || pathname.startsWith(item.href + '/')
          );

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
      <div className="border-t border-sidebar-border px-4 py-4">
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
      </div>
    </aside>
  );
}