'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

import type { AppRole } from '@/lib/types/auth';

interface Props {
  clients: { id: string; company_legal_name: string }[];
  drivers: { id: string; full_name: string; client_id: string }[];
  vehicles: { id: string; unit_number: string; make: string; model: string; client_id: string }[];
  userId: string;
  userRole: AppRole;
  load?: any;
}

const EQUIPMENT_TYPES = [
  'Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Box Truck', 'Power Only',
  'Hotshot', 'Sprinter Van', 'Conestoga', 'Lowboy', 'RGN', 'Tanker', 'Other',
];

const FREIGHT_TYPES = [
  'General Freight', 'Refrigerated', 'Hazmat', 'Oversize/Overweight',
  'Auto Transport', 'Household Goods', 'Machinery', 'Building Materials',
  'Agricultural', 'Livestock', 'Intermodal', 'LTL', 'Other',
];

export function LoadForm({ clients, drivers, vehicles, userId, userRole, load }: Props) {
  const isAdmin = userRole === 'admin';
  const router = useRouter();
  const isEditing = !!load;

  const form = useForm({
    defaultValues: {
      client_id: load?.client_id ?? '',
      load_number: load?.load_number ?? '',
      driver_id: load?.driver_id ?? '',
      vehicle_id: load?.vehicle_id ?? '',
      origin_name: load?.origin_name ?? '',
      origin_address: load?.origin_address ?? '',
      origin_city: load?.origin_city ?? '',
      origin_state: load?.origin_state ?? '',
      origin_zip: load?.origin_zip ?? '',
      destination_name: load?.destination_name ?? '',
      destination_address: load?.destination_address ?? '',
      destination_city: load?.destination_city ?? '',
      destination_state: load?.destination_state ?? '',
      destination_zip: load?.destination_zip ?? '',
      pickup_date: load?.pickup_date ?? '',
      pickup_window_start: load?.pickup_window_start ?? '',
      pickup_window_end: load?.pickup_window_end ?? '',
      delivery_date: load?.delivery_date ?? '',
      delivery_window_start: load?.delivery_window_start ?? '',
      delivery_window_end: load?.delivery_window_end ?? '',
      rate: load?.rate?.toString() ?? '',
      rate_type: load?.rate_type ?? 'flat',
      miles: load?.miles?.toString() ?? '',
      deadhead_miles: load?.deadhead_miles?.toString() ?? '',
      weight: load?.weight?.toString() ?? '',
      commodity: load?.commodity ?? '',
      equipment_type: load?.equipment_type ?? '',
      freight_type: load?.freight_type ?? '',
      broker_name: load?.broker_name ?? '',
      broker_email: load?.broker_email ?? '',
      broker_phone: load?.broker_phone ?? '',
      dispatch_fee_percent: load?.dispatch_fee_percent?.toString() ?? '8',
      driver_pay: load?.driver_pay?.toString() ?? '',
      shipping_hours: load?.shipping_hours ?? '',
      receiving_hours: load?.receiving_hours ?? '',
      reference_numbers: load?.reference_numbers ?? '',
      special_instructions: load?.special_instructions ?? '',
      notes: load?.notes ?? '',
    },
  });

  const selectedClientId = form.watch('client_id');
  const filteredDrivers = drivers.filter((d) => !selectedClientId || d.client_id === selectedClientId);
  const filteredVehicles = vehicles.filter((v) => !selectedClientId || v.client_id === selectedClientId);

  // Auto-calculate RPM and dispatch fee
  const rate = parseFloat(form.watch('rate') || '0');
  const miles = parseInt(form.watch('miles') || '0');
  const feePercent = parseFloat(form.watch('dispatch_fee_percent') || '0');
  const rpm = miles > 0 ? (rate / miles).toFixed(2) : '—';
  const dispatchFee = rate > 0 ? (rate * feePercent / 100).toFixed(2) : '—';

  async function onSubmit(values: any) {
    const url = isEditing ? `/api/dispatch/loads/${load.id}` : '/api/dispatch/loads';
    const method = isEditing ? 'PATCH' : 'POST';

    const numericFields = ['rate', 'miles', 'deadhead_miles', 'weight', 'dispatch_fee_percent', 'driver_pay'];
    const body: Record<string, any> = {};
    for (const [k, v] of Object.entries(values)) {
      if (numericFields.includes(k) && v) body[k] = parseFloat(v as string);
      else body[k] = v === '' ? null : v;
    }

    // Auto-calc fields
    if (body.rate && body.miles) body.rate_per_mile = parseFloat((body.rate / body.miles).toFixed(2));
    if (body.rate && body.dispatch_fee_percent) body.dispatch_fee_amount = parseFloat((body.rate * body.dispatch_fee_percent / 100).toFixed(2));

    if (!isEditing) {
      body.dispatcher_id = userId;
      if (body.driver_id) body.status = 'assigned';
    }

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? 'Failed to save load');
      return;
    }

    const result = await res.json();
    toast.success(isEditing ? 'Load updated' : 'Load created');
    router.push(`/dispatch/loads/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Load Info</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-2">
            <Label>Company *</Label>
            <Select value={form.watch('client_id')} onValueChange={(v) => form.setValue('client_id', v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_legal_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Load Number *</Label>
            <Input {...form.register('load_number')} required placeholder="LD-001" />
          </div>
          <div className="space-y-2">
            <Label>Equipment Type</Label>
            <Select value={form.watch('equipment_type')} onValueChange={(v) => form.setValue('equipment_type', v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {EQUIPMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Freight Type</Label>
            <Select value={form.watch('freight_type')} onValueChange={(v) => form.setValue('freight_type', v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {FREIGHT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Commodity</Label>
            <Input {...form.register('commodity')} placeholder="e.g. Paper Products" />
          </div>
          <div className="space-y-2">
            <Label>Driver</Label>
            <Select value={form.watch('driver_id')} onValueChange={(v) => form.setValue('driver_id', v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Assign driver" /></SelectTrigger>
              <SelectContent>
                {filteredDrivers.map((d) => <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Vehicle</Label>
            <Select value={form.watch('vehicle_id')} onValueChange={(v) => form.setValue('vehicle_id', v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Assign vehicle" /></SelectTrigger>
              <SelectContent>
                {filteredVehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.unit_number ? `Unit ${v.unit_number}` : `${v.make} ${v.model}`}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Broker */}
      <Card>
        <CardHeader><CardTitle className="text-base">Broker</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Broker Name</Label><Input {...form.register('broker_name')} placeholder="e.g. TQL, Landstar" /></div>
          <div className="space-y-2"><Label>Broker Email</Label><Input type="email" {...form.register('broker_email')} /></div>
          <div className="space-y-2"><Label>Broker Phone</Label><Input {...form.register('broker_phone')} /></div>
        </CardContent>
      </Card>

      {/* Origin */}
      <Card>
        <CardHeader><CardTitle className="text-base">Origin</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-2"><Label>Location Name *</Label><Input {...form.register('origin_name')} required placeholder="Warehouse A" /></div>
          <div className="sm:col-span-2 space-y-2"><Label>Address *</Label><Input {...form.register('origin_address')} required /></div>
          <div className="space-y-2"><Label>City *</Label><Input {...form.register('origin_city')} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>State *</Label><Input {...form.register('origin_state')} required maxLength={2} placeholder="NC" /></div>
            <div className="space-y-2"><Label>ZIP</Label><Input {...form.register('origin_zip')} /></div>
          </div>
          <div className="space-y-2"><Label>Pickup Date *</Label><Input type="date" {...form.register('pickup_date')} required /></div>
          <div className="space-y-2"><Label>Shipping Hours</Label><Input {...form.register('shipping_hours')} placeholder="e.g. 8am-3pm" /></div>
        </CardContent>
      </Card>

      {/* Destination */}
      <Card>
        <CardHeader><CardTitle className="text-base">Destination</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-2"><Label>Location Name *</Label><Input {...form.register('destination_name')} required placeholder="Distribution Center B" /></div>
          <div className="sm:col-span-2 space-y-2"><Label>Address *</Label><Input {...form.register('destination_address')} required /></div>
          <div className="space-y-2"><Label>City *</Label><Input {...form.register('destination_city')} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>State *</Label><Input {...form.register('destination_state')} required maxLength={2} placeholder="GA" /></div>
            <div className="space-y-2"><Label>ZIP</Label><Input {...form.register('destination_zip')} /></div>
          </div>
          <div className="space-y-2"><Label>Delivery Date</Label><Input type="date" {...form.register('delivery_date')} /></div>
          <div className="space-y-2"><Label>Receiving Hours</Label><Input {...form.register('receiving_hours')} placeholder="e.g. 6am-2pm" /></div>
        </CardContent>
      </Card>

      {/* Rate & Financials — operational fields always visible, financial fields admin-only */}
      <Card>
        <CardHeader><CardTitle className="text-base">{isAdmin ? 'Rate & Financials' : 'Load Details'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {isAdmin && <div className="space-y-2"><Label>Rate ($)</Label><Input type="number" step="0.01" {...form.register('rate')} /></div>}
            <div className="space-y-2"><Label>Miles</Label><Input type="number" {...form.register('miles')} /></div>
            <div className="space-y-2"><Label>Deadhead (DH)</Label><Input type="number" {...form.register('deadhead_miles')} /></div>
            <div className="space-y-2"><Label>Weight (lbs)</Label><Input type="number" {...form.register('weight')} /></div>
          </div>
          {isAdmin && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>RPM</Label>
                <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm font-medium">{rpm}</div>
              </div>
              <div className="space-y-2"><Label>Dispatch Fee %</Label><Input type="number" step="0.01" {...form.register('dispatch_fee_percent')} /></div>
              <div className="space-y-2">
                <Label>Dispatch Fee ($)</Label>
                <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm font-medium">{dispatchFee}</div>
              </div>
              <div className="space-y-2"><Label>Driver Pay ($)</Label><Input type="number" step="0.01" {...form.register('driver_pay')} /></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional */}
      <Card>
        <CardHeader><CardTitle className="text-base">Additional Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <div className="space-y-2"><Label>Reference Numbers</Label><Input {...form.register('reference_numbers')} placeholder="PO#, BOL#, etc." /></div>
          <div className="space-y-2"><Label>Special Instructions</Label><Textarea rows={2} {...form.register('special_instructions')} /></div>
          <div className="space-y-2"><Label>Notes</Label><Textarea rows={2} {...form.register('notes')} /></div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting} className="bg-[#C41E3A] hover:bg-[#A51830] text-white">
          {form.formState.isSubmitting ? 'Saving...' : isEditing ? 'Update Load' : 'Create Load'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}