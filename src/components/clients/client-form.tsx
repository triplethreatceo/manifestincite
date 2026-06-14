'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientFormSchema, type ClientFormValues } from '@/lib/validations/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { DbClient } from '@/lib/types/database';

interface ClientFormProps {
  client?: DbClient;
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const isEditing = !!client;

  const form = useForm<ClientFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(clientFormSchema) as any,
    defaultValues: {
      company_legal_name: client?.company_legal_name ?? '',
      dba_name: client?.dba_name ?? '',
      dot_number: client?.dot_number ?? '',
      mc_number: client?.mc_number ?? '',
      ein: client?.ein ?? '',
      business_address: client?.business_address ?? '',
      mailing_address: client?.mailing_address ?? '',
      contact_person: client?.contact_person ?? '',
      phone: client?.phone ?? '',
      email: client?.email ?? '',
      start_date: client?.start_date ?? '',
      status: client?.status ?? 'active',
      monthly_service_fee: client?.monthly_service_fee?.toString() ?? '',
      white_label_partner: client?.white_label_partner ?? '',
      internal_notes: client?.internal_notes ?? '',
    },
  });

  async function onSubmit(values: ClientFormValues) {
    const url = isEditing ? `/api/clients/${client!.id}` : '/api/clients';
    const method = isEditing ? 'PATCH' : 'POST';

    const body = {
      ...values,
      monthly_service_fee: values.monthly_service_fee
        ? parseFloat(values.monthly_service_fee)
        : null,
      dba_name: values.dba_name || null,
      dot_number: values.dot_number || null,
      mc_number: values.mc_number || null,
      ein: values.ein || null,
      business_address: values.business_address || null,
      mailing_address: values.mailing_address || null,
      contact_person: values.contact_person || null,
      phone: values.phone || null,
      email: values.email || null,
      start_date: values.start_date || null,
      white_label_partner: values.white_label_partner || null,
      internal_notes: values.internal_notes || null,
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? 'Failed to save client');
      return;
    }

    toast.success(isEditing ? 'Client updated' : 'Client created');
    router.push('/clients');
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="company_legal_name">Company Legal Name *</Label>
              <Input id="company_legal_name" {...form.register('company_legal_name')} />
              {form.formState.errors.company_legal_name && (
                <p className="text-xs text-destructive">{form.formState.errors.company_legal_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dba_name">DBA Name</Label>
              <Input id="dba_name" {...form.register('dba_name')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(v) => form.setValue('status', (v ?? 'active') as any)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Identifiers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dot_number">DOT Number</Label>
              <Input id="dot_number" {...form.register('dot_number')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mc_number">MC Number</Label>
              <Input id="mc_number" {...form.register('mc_number')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ein">EIN</Label>
              <Input id="ein" {...form.register('ein')} />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input id="contact_person" {...form.register('contact_person')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" {...form.register('phone')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" type="date" {...form.register('start_date')} />
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_address">Business Address</Label>
              <Textarea id="business_address" rows={2} {...form.register('business_address')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mailing_address">Mailing Address</Label>
              <Textarea id="mailing_address" rows={2} {...form.register('mailing_address')} />
            </div>
          </div>

          {/* Billing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly_service_fee">Monthly Service Fee</Label>
              <Input
                id="monthly_service_fee"
                type="number"
                step="0.01"
                min="0"
                {...form.register('monthly_service_fee')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="white_label_partner">White-Label Partner</Label>
              <Input id="white_label_partner" {...form.register('white_label_partner')} />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="internal_notes">Internal Notes</Label>
            <Textarea id="internal_notes" rows={3} {...form.register('internal_notes')} />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={form.formState.isSubmitting} className="bg-[#C41E3A] hover:bg-[#A51830] text-white">
              {form.formState.isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Update Client'
                : 'Create Client'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}