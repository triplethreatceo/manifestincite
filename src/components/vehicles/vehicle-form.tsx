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
  vehicle?: any;
}

export function VehicleForm({ clients, defaultClientId, vehicle }: Props) {
  const router = useRouter();
  const isEditing = !!vehicle;

  const form = useForm({
    defaultValues: {
      client_id: vehicle?.client_id ?? defaultClientId ?? '',
      unit_number: vehicle?.unit_number ?? '',
      vin: vehicle?.vin ?? '',
      year: vehicle?.year?.toString() ?? '',
      make: vehicle?.make ?? '',
      model: vehicle?.model ?? '',
      plate_number: vehicle?.plate_number ?? '',
      registration_state: vehicle?.registration_state ?? '',
      registration_expiration_date: vehicle?.registration_expiration_date ?? '',
      insurance_expiration_date: vehicle?.insurance_expiration_date ?? '',
      annual_inspection_due_date: vehicle?.annual_inspection_due_date ?? '',
      maintenance_status: vehicle?.maintenance_status ?? '',
      status: vehicle?.status ?? 'active',
      notes: vehicle?.notes ?? '',
    },
  });

  async function onSubmit(values: any) {
    const url = isEditing ? `/api/vehicles/${vehicle.id}` : '/api/vehicles';
    const method = isEditing ? 'PATCH' : 'POST';

    const body = Object.fromEntries(
      Object.entries(values).map(([k, v]) => {
        if (k === 'year' && v) return [k, parseInt(v as string)];
        return [k, v === '' ? null : v];
      })
    );

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? 'Failed to save vehicle');
      return;
    }

    toast.success(isEditing ? 'Vehicle updated' : 'Vehicle added');
    router.push('/vehicles');
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
                  {clients.map((c) => (<SelectItem key={c.id} value={c.id}>{c.company_legal_name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unit Number</Label>
              <Input {...form.register('unit_number')} />
            </div>
            <div className="space-y-2">
              <Label>VIN</Label>
              <Input {...form.register('vin')} maxLength={17} />
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input type="number" {...form.register('year')} />
            </div>
            <div className="space-y-2">
              <Label>Make</Label>
              <Input {...form.register('make')} />
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Input {...form.register('model')} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.watch('status')} onValueChange={(v) => form.setValue('status', v ?? 'active')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="removed">Removed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plate Number</Label>
              <Input {...form.register('plate_number')} />
            </div>
            <div className="space-y-2">
              <Label>Registration State</Label>
              <Input {...form.register('registration_state')} maxLength={2} placeholder="NC" />
            </div>
            <div className="space-y-2">
              <Label>Registration Expiration</Label>
              <Input type="date" {...form.register('registration_expiration_date')} />
            </div>
            <div className="space-y-2">
              <Label>Insurance Expiration</Label>
              <Input type="date" {...form.register('insurance_expiration_date')} />
            </div>
            <div className="space-y-2">
              <Label>Annual Inspection Due</Label>
              <Input type="date" {...form.register('annual_inspection_due_date')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={3} {...form.register('notes')} />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={form.formState.isSubmitting} className="bg-[#C41E3A] hover:bg-[#A51830] text-white">
              {form.formState.isSubmitting ? 'Saving...' : isEditing ? 'Update Vehicle' : 'Add Vehicle'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}