'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { UserPlus, Mail, Shield, ShieldOff } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface EnrichedUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  invite_status: string;
}

interface Props {
  users: EnrichedUser[];
  currentUserId: string;
}

const roleBadge: Record<string, string> = {
  admin: 'bg-[#C41E3A]/10 text-[#C41E3A]',
  staff: 'bg-blue-100 text-blue-800',
  client: 'bg-status-green/10 text-status-green',
};

const inviteBadge: Record<string, string> = {
  active: 'bg-status-green/10 text-status-green',
  invited: 'bg-status-yellow/10 text-status-yellow',
  pending: 'bg-status-gray/10 text-status-gray',
};

export function UsersPage({ users, currentUserId }: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('admin');
  const [submitting, setSubmitting] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: inviteName, email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Invited ${inviteEmail}`);
      setDialogOpen(false);
      setInviteName('');
      setInviteEmail('');
      setInviteRole('admin');
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to invite user');
    } finally {
      setSubmitting(false);
    }
  }

  async function resendInvite(userId: string, email: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success(`Invite resent to ${email}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend invite');
    }
  }

  async function toggleActive(userId: string, currentlyActive: boolean) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentlyActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(currentlyActive ? 'User deactivated' : 'User reactivated');
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user');
    }
  }

  async function changeRole(userId: string, newRole: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Role updated to ${newRole}`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update role');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage team access and invitations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button className="bg-[#C41E3A] hover:bg-[#A51830] text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} required placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required placeholder="jane@company.com" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v ?? 'admin')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-[#C41E3A] hover:bg-[#A51830] text-white">
                {submitting ? 'Sending...' : 'Send Invite'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Members ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invite</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isYou = u.id === currentUserId;
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.full_name}
                      {isYou && <span className="text-xs text-muted-foreground ml-2">(you)</span>}
                    </TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell>
                      {isYou ? (
                        <Badge className={roleBadge[u.role]} variant="secondary">{u.role}</Badge>
                      ) : (
                        <Select value={u.role} onValueChange={(v) => changeRole(u.id, v ?? u.role)}>
                          <SelectTrigger className="h-7 w-24 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">admin</SelectItem>
                            <SelectItem value="staff">staff</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.is_active ? 'default' : 'secondary'}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={inviteBadge[u.invite_status] ?? ''} variant="secondary">
                        {u.invite_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u.last_sign_in_at ? format(new Date(u.last_sign_in_at), 'MMM d, yyyy h:mm a') : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {u.invite_status === 'invited' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Resend invite"
                            onClick={() => resendInvite(u.id, u.email)}
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {!isYou && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title={u.is_active ? 'Deactivate' : 'Reactivate'}
                            onClick={() => toggleActive(u.id, u.is_active)}
                          >
                            {u.is_active ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}