'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, getDay } from 'date-fns';

const severityColor: Record<string, string> = {
  critical: 'bg-status-red',
  high: 'bg-orange-500',
  medium: 'bg-status-yellow',
  low: 'bg-blue-400',
};

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'alert' | 'invoice' | 'event';
  severity?: string;
  company?: string;
}

interface Props {
  alerts: any[];
  invoices: any[];
  events: any[];
}

export function CalendarPage({ alerts, invoices, events }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    const items: CalendarEvent[] = [];

    alerts.forEach((a) => {
      if (a.due_date) {
        items.push({
          id: a.id,
          title: a.title,
          date: a.due_date,
          type: 'alert',
          severity: a.severity,
          company: a.clients?.company_legal_name,
        });
      }
    });

    invoices.forEach((inv) => {
      items.push({
        id: inv.id,
        title: `Invoice ${inv.invoice_number} due`,
        date: inv.due_date,
        type: 'invoice',
        company: inv.clients?.company_legal_name,
      });
    });

    events.forEach((e) => {
      items.push({
        id: e.id,
        title: e.title,
        date: e.event_date,
        type: 'event',
        severity: e.severity,
        company: e.clients?.company_legal_name,
      });
    });

    return items;
  }, [alerts, invoices, events]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-sm text-muted-foreground">Deadlines, renewals, and events</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="bg-muted px-2 py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
            ))}
            {Array.from({ length: startPadding }).map((_, i) => (
              <div key={`pad-${i}`} className="bg-background min-h-[80px]" />
            ))}
            {days.map((day) => {
              const dayEvents = calendarEvents.filter((e) => isSameDay(new Date(e.date), day));
              const isToday = isSameDay(day, new Date());

              return (
                <div key={day.toISOString()} className={`bg-background min-h-[80px] p-1 ${isToday ? 'ring-2 ring-inset ring-[#C41E3A]' : ''}`}>
                  <p className={`text-xs font-medium mb-1 ${isToday ? 'text-[#C41E3A] font-bold' : 'text-muted-foreground'}`}>
                    {format(day, 'd')}
                  </p>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((evt) => (
                      <div key={evt.id} className="flex items-center gap-1" title={`${evt.title} — ${evt.company}`}>
                        <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          evt.type === 'invoice' ? 'bg-blue-500' : severityColor[evt.severity ?? 'low'] ?? 'bg-gray-400'
                        }`} />
                        <span className="text-[10px] truncate">{evt.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming list view */}
      <Card>
        <CardHeader><CardTitle className="text-base">Upcoming Events</CardTitle></CardHeader>
        <CardContent>
          {calendarEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
          ) : (
            <div className="space-y-3">
              {calendarEvents
                .filter((e) => new Date(e.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 20)
                .map((evt) => (
                  <div key={evt.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        evt.type === 'invoice' ? 'bg-blue-500' : severityColor[evt.severity ?? 'low'] ?? 'bg-gray-400'
                      }`} />
                      <div>
                        <p className="font-medium">{evt.title}</p>
                        <p className="text-xs text-muted-foreground">{evt.company}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{format(new Date(evt.date), 'MMM d, yyyy')}</span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}