'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MessageSquare, Search } from 'lucide-react';
import { format } from 'date-fns';

const statusColor: Record<string, string> = {
  created: 'bg-status-gray/10 text-status-gray',
  assigned: 'bg-blue-100 text-blue-800',
  accepted: 'bg-blue-100 text-blue-800',
  en_route_pickup: 'bg-status-yellow/10 text-status-yellow',
  at_pickup: 'bg-status-yellow/10 text-status-yellow',
  loaded: 'bg-orange-100 text-orange-700',
  in_transit: 'bg-[#C41E3A]/10 text-[#C41E3A]',
  at_delivery: 'bg-status-green/10 text-status-green',
  delivered: 'bg-status-green/10 text-status-green',
  completed: 'bg-status-green/10 text-status-green',
  cancelled: 'bg-status-red/10 text-status-red',
};

function formatStatus(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Props {
  loadThreads: any[];
  recentMessages: any[];
  userId: string;
}

export function DispatchMessagesPage({ loadThreads, recentMessages, userId }: Props) {
  const [search, setSearch] = useState('');

  const filteredThreads = loadThreads.filter((l) =>
    l.load_number.toLowerCase().includes(search.toLowerCase()) ||
    l.clients?.company_legal_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.drivers?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Group messages by load
  const messagesByLoad = new Map<string, any[]>();
  for (const msg of recentMessages) {
    const loadId = msg.load_id;
    if (!loadId) continue;
    if (!messagesByLoad.has(loadId)) messagesByLoad.set(loadId, []);
    messagesByLoad.get(loadId)!.push(msg);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dispatch"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground">Load-scoped messaging threads</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by load #, company, or driver..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-3">
        {filteredThreads.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>No message threads found</p>
            </CardContent>
          </Card>
        ) : (
          filteredThreads.map((load) => {
            const threadMsgs = messagesByLoad.get(load.id) ?? [];
            const lastMsg = threadMsgs[0];
            const unread = threadMsgs.filter((m: any) => !m.is_read && m.sender_id !== userId).length;

            return (
              <Link key={load.id} href={`/dispatch/loads/${load.id}`}>
                <Card className="hover:border-[#C41E3A]/30 transition-colors cursor-pointer">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-sm">{load.load_number}</span>
                          <Badge className={statusColor[load.status] ?? ''} variant="secondary" >{formatStatus(load.status)}</Badge>
                          {unread > 0 && <Badge className="bg-[#C41E3A] text-white text-[10px]">{unread} new</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {load.clients?.company_legal_name}
                          {load.drivers?.full_name && ` · ${load.drivers.full_name}`}
                        </p>
                      </div>
                      {lastMsg && (
                        <span className="text-[10px] text-muted-foreground">{format(new Date(lastMsg.created_at), 'MM/dd h:mm a')}</span>
                      )}
                    </div>
                    {lastMsg && (
                      <p className="text-sm text-muted-foreground mt-2 truncate">
                        <span className="font-medium">{lastMsg.users?.full_name}:</span> {lastMsg.body}
                      </p>
                    )}
                    {!lastMsg && (
                      <p className="text-xs text-muted-foreground mt-2">No messages yet</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}