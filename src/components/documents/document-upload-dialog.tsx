'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DOCUMENT_CATEGORIES } from '@/lib/types/auth';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: { id: string; company_legal_name: string }[];
  userId: string;
}

export function DocumentUploadDialog({ open, onOpenChange, clients, userId }: Props) {
  const router = useRouter();
  const [clientId, setClientId] = useState('');
  const [category, setCategory] = useState('');
  const [visibility, setVisibility] = useState('admin_only');
  const [expirationDate, setExpirationDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!file || !clientId || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploading(true);

    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const filePath = `${clientId}/${category}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document record
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          category,
          document_name: file.name,
          document_type: file.type,
          file_path: filePath,
          file_size: file.size,
          visibility,
          uploaded_by: userId,
          expiration_date: expirationDate || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to save document record');

      toast.success('Document uploaded');
      onOpenChange(false);
      router.refresh();

      // Reset form
      setClientId('');
      setCategory('');
      setVisibility('admin_only');
      setExpirationDate('');
      setFile(null);
    } catch (err: any) {
      toast.error(err.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Company *</Label>
            <Select value={clientId} onValueChange={(v) => setClientId(v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.company_legal_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v ?? 'admin_only')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin_only">Admin Only</SelectItem>
                <SelectItem value="client_visible">Client Visible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Expiration Date</Label>
            <Input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>File *</Label>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <Button onClick={handleUpload} disabled={uploading} className="w-full bg-[#C41E3A] hover:bg-[#A51830] text-white">
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}