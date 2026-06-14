'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { AuthUser } from '@/lib/types/auth';
import { getNavGroups } from '@/lib/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu,
  Shield,
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
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, Building2, Users, Truck, FileText,
  AlertTriangle, CheckSquare, Calendar, Receipt, Settings,
  Upload, Shield, BadgeCheck, MapPin, Package, MessageSquare, ShieldCheck,
};

export function MobileNav({ user }: { user: AuthUser }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const groups = getNavGroups(user.role);

  // All groups expanded in mobile for simplicity
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    groups.forEach((g) => { defaults[g.id] = true; });
    return defaults;
  });

  function toggleGroup(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="flex md:hidden items-center justify-between border-b bg-sidebar text-sidebar-foreground px-4 py-3">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-sidebar-primary" />
        <span className="text-sm font-bold">ManifestIncite</span>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="p-1">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-sidebar text-sidebar-foreground p-0">
          <nav className="flex flex-col gap-1 p-4 pt-8 overflow-y-auto max-h-[calc(100vh-80px)]">
            {groups.map((group) => {
              const GroupIcon = ICON_MAP[group.icon] ?? LayoutDashboard;
              const isExpanded = expanded[group.id] ?? true;

              return (
                <div key={group.id} className="mb-1">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="flex items-center justify-between w-full px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50"
                  >
                    <div className="flex items-center gap-2">
                      <GroupIcon className="h-3.5 w-3.5" />
                      {group.label}
                    </div>
                    <ChevronDown className={cn('h-3 w-3 transition-transform', isExpanded ? '' : '-rotate-90')} />
                  </button>
                  {isExpanded && (
                    <div className="ml-2 border-l border-sidebar-border/50 pl-2 space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium',
                              isActive
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
                            )}
                          >
                            <Icon className="h-4 w-4" />
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
          <div className="absolute bottom-4 left-4 right-4 border-t border-sidebar-border pt-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold">
                {user.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.fullName}</p>
                <p className="text-[11px] text-sidebar-foreground/50 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}