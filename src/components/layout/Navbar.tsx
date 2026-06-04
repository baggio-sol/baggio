'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/predict', label: 'Predict' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/leagues', label: 'Leagues' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
          {/* Spacer (wordmark removed) */}
          <Link href="/" className="font-display font-extrabold text-base tracking-tight" style={{ color: '#f5f3ff' }}>
            WC&apos;26 <span style={{ color: '#fb7185' }}>Predictor</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all text-[#c4bdec] hover:text-[#f5f3ff] hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/predict"
              className="hidden md:inline-flex items-center rounded-full px-5 py-2 text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: '#fb7185' }}
            >
              Start Predicting
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-[#c4bdec] hover:text-white hover:bg-white/10 transition-all"
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
                className="flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all text-[#c4bdec] hover:text-white hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/predict"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center rounded-full px-4 py-3 text-sm font-bold text-white mt-2"
              style={{ background: '#fb7185' }}
            >
              Start Predicting
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
