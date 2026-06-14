'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Props {
  clients: { id: string; company_legal_name: string }[];
  defaultClientId?: string;
  driver?: any;
}

export function DriverForm({ clients, defaultClientId, driver }: Props) {
  const router = useRouter();
  const isEditing = !!driver;

  const form = useForm({
    defaultValues: {
      client_id: driver?.client_id ?? defaultClientId ?? '',
      full_name: driver?.full_name ?? '',
      phone: driver?.phone ?? '',
      email: driver?.email ?? '',
      cdl_number: driver?.cdl_number ?? '',
      cdl_state: driver?.cdl_state ?? '',
      cdl_expiration_date: driver?.cdl_expiration_date ?? '',
      medical_card_expiration_date: driver?.medical_card_expiration_date ?? '',
      mvr_date: driver?.mvr_date ?? '',
      background_check_date: driver?.background_check_date ?? '',
      drug_test_date: driver?.drug_test_date ?? '',
      clearinghouse_query_date: driver?.clearinghouse_query_date ?? '',
      employment_application_status: driver?.employment_application_status ?? '',
      driver_qualification_file_status: driver?.driver_qualification_file_status ?? '',
      status: driver?.status ?? 'active',
      notes: driver?.notes ?? '',
    },
  });

  async function onSubmit(values: any) {
    const url = isEditing ? `/api/drivers/${driver.id}` : '/api/drivers';
    const method = isEditing ? 'PATCH' : 'POST';

    // Convert empty strings to null
    const body = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === '' ? null : v])
    );

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? 'Failed to save driver');
      return;
    }

    toast.success(isEditing ? 'Driver updated' : 'Driver added');
    router.push('/drivers');
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label>Company *</Label>
              <Select value={form.watch('client_id')} onValueChange={(v) => form.setValue('client_id', v ?? '')}>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.company_legal_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input {...form.register('full_name', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.watch('status')} onValueChange={(v) => form.setValue('status', v ?? 'active')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" {...form.register('phone')} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...form.register('email')} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>CDL Number</Label>
              <Input {...form.register('cdl_number')} />
            </div>
            <div className="space-y-2">
              <Label>CDL State</Label>
              <Input {...form.register('cdl_state')} maxLength={2} placeholder="NC" />
            </div>
            <div className="space-y-2">
              <Label>CDL Expiration</Label>
              <Input type="date" {...form.register('cdl_expiration_date')} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Medical Card Exp</Label>
              <Input type="date" {...form.register('medical_card_expiration_date')} />
            </div>
            <div className="space-y-2">
              <Label>MVR Date</Label>
              <Input type="date" {...form.register('mvr_date')} />
            </div>
            <div className="space-y-2">
              <Label>Background Check Date</Label>
              <Input type="date" {...form.register('background_check_date')} />
            </div>
            <div className="space-y-2">
              <Label>Drug Test Date</Label>
              <Input type="date" {...form.register('drug_test_date')} />
            </div>
            <div className="space-y-2">
              <Label>Clearinghouse Query Date</Label>
              <Input type="date" {...form.register('clearinghouse_query_date')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={3} {...form.register('notes')} />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={form.formState.isSubmitting} className="bg-[#C41E3A] hover:bg-[#A51830] text-white">
              {form.formState.isSubmitting ? 'Saving...' : isEditing ? 'Update Driver' : 'Add Driver'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}