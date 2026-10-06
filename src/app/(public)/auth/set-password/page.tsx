'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // The magic link token is exchanged automatically by Supabase when
  // the user lands here. We wait for the session to be established.
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setReady(true);
      }
    });
    // Check if already signed in (e.g. token already exchanged)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
  }, [supabase.auth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F1B2D]">
        <Card className="w-full max-w-md border-0 bg-white/5 backdrop-blur-sm">
          <CardContent className="pt-6 text-center text-white/60">
            Verifying your invitation...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F1B2D]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">
            <span style={{ color: '#C41E3A' }}>Manifest</span>Incite
          </h1>
          <p className="mt-2 text-sm text-white/60">Set your password to get started</p>
        </div>

        <Card className="border-0 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base text-white">Create Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#C41E3A]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Confirm Password</Label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="Repeat password"
                  className="bg-white/10 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#C41E3A]"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C41E3A] hover:bg-[#A51830] text-white"
              >
                {loading ? 'Setting password...' : 'Set Password & Continue'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}