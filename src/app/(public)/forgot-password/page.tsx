'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#C41E3A]">
          <Shield className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Reset Password</h1>
      </div>
      <Card className="border-0 bg-white/5 backdrop-blur-sm">
        <CardContent className="pt-6">
          {sent ? (
            <div className="text-center space-y-3">
              <p className="text-sm text-[#D4D8E0]/80">
                Check your email for a password reset link.
              </p>
              <Link href="/login" className="text-xs text-[#C41E3A] hover:underline">
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#D4D8E0]/80 text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#C41E3A]"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#C41E3A] hover:bg-[#A51830] text-white">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <div className="text-center">
                <Link href="/login" className="text-xs text-[#D4D8E0]/50 hover:text-[#D4D8E0]/80">
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}