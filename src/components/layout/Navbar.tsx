'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useBracketSync } from '@/lib/supabase/useBracketSync';

const navLinks = [
  { href: '/predict', label: 'Predict' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/leagues', label: 'Leagues' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const supabase = createClient();

  useBracketSync(user?.id ?? null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
  };

  const displayName = user?.user_metadata?.display_name
    ?? user?.user_metadata?.full_name
    ?? user?.email?.split('@')[0]
    ?? 'Account';

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(255,255,255,0.10)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-display font-extrabold text-base tracking-tight" style={{ color: '#f1f0f7' }}>
            WC&apos;26 <span style={{ color: '#9d7fea' }}>Predictor</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-[#a09db8] hover:text-[#f1f0f7] hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth CTA + hamburger */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full pl-2 pr-4 py-1.5 text-sm font-bold transition-all hover:bg-white/10"
                  style={{ color: '#f1f0f7' }}
                >
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff' }}>
                    {displayName[0].toUpperCase()}
                  </span>
                  {displayName}
                </button>
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-2xl overflow-hidden border"
                    style={{
                      background: 'linear-gradient(160deg,#1a0d36,#120931)',
                      borderColor: 'rgba(255,255,255,0.10)',
                      boxShadow: '0 16px 40px -8px rgba(0,0,0,0.5)',
                    }}
                  >
                    <Link
                      href="/predict"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10"
                      style={{ color: '#a09db8' }}
                    >
                      <User className="w-4 h-4" /> My Bracket
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10 border-t"
                      style={{ color: '#a09db8', borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="hidden md:inline-flex items-center rounded-full px-5 py-2 text-sm font-bold transition-all hover:opacity-90"
                style={{ background: '#ffffff', color: '#111827' }}
              >
                Sign in
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-[#a09db8] hover:text-white hover:bg-white/10 transition-all"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{
            background: 'rgba(26,13,54,0.95)',
            backdropFilter: 'blur(16px)',
            borderColor: 'rgba(255,255,255,0.10)',
          }}
        >
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all text-[#a09db8] hover:text-white hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all text-[#a09db8] hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center rounded-full px-4 py-3 text-sm font-bold mt-2"
                style={{ background: '#ffffff', color: '#111827' }}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
