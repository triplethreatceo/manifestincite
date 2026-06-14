import { LoginForm } from '@/components/auth/login-form';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#C41E3A]">
          <Shield className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">ManifestIncite</h1>
        <p className="text-sm text-[#D4D8E0]/60">FMCSA/DOT Compliance Portal</p>
      </div>
      <LoginForm />
    </div>
  );
}