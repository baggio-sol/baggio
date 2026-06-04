'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(errorParam ? 'Sign-in failed. Please try again.' : '');

  const supabase = createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSent(true);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">📬</div>
        <h2 className="font-display font-extrabold text-2xl mb-2" style={{ color: '#f5f3ff' }}>
          Check your inbox
        </h2>
        <p className="text-sm mb-6" style={{ color: '#c4bdec' }}>
          We sent a magic link to <strong style={{ color: '#f5f3ff' }}>{email}</strong>.<br />
          Click the link to sign in — no password needed.
        </p>
        <button
          onClick={() => setSent(false)}
          className="text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: '#a78bfa' }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' }}>
            ⚽
          </div>
          <span className="font-display font-extrabold text-lg" style={{ color: '#f5f3ff' }}>
            WC&apos;26 Predictor
          </span>
        </Link>
        <h1 className="font-display font-extrabold text-3xl mb-1" style={{ color: '#f5f3ff' }}>
          Sign in
        </h1>
        <p className="text-sm" style={{ color: '#c4bdec' }}>
          Save your bracket, join leagues, track your score
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl px-4 py-3 text-sm font-medium text-center"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.30)', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 rounded-2xl py-3.5 mb-4 font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        style={{ background: '#ffffff', color: '#111827' }}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: 'rgba(255,255,255,0.10)' }} />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 text-xs font-medium" style={{ background: '#120931', color: '#c4bdec' }}>
            or continue with email
          </span>
        </div>
      </div>

      {/* Magic link form */}
      <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6f6796' }} />
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1.5px solid rgba(255,255,255,0.10)',
              color: '#f5f3ff',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="flex items-center justify-center gap-2 rounded-2xl py-3.5 font-display font-extrabold text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', color: '#fff' }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send magic link <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/predict"
          className="text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: '#6f6796' }}
        >
          Continue without account →
        </Link>
      </div>
    </>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Suspense>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}
