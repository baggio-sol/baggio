'use client';
import { useEffect, useState } from 'react';
import BracketView from '@/components/bracket/BracketView';
import { usePredictionStore, deriveTree } from '@/lib/store';
import { TEAM_BY_CODE } from '@/lib/tournament';
import { Trophy, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';

export default function BracketPage() {
  const { bracket } = usePredictionStore();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const championCode = deriveTree(bracket)?.winners['M104'];
  const champion = championCode ? TEAM_BY_CODE[championCode] : undefined;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/predict"
              className="p-2 rounded-xl border transition-all"
              style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.10)', color: '#c4bdec' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-black" style={{ color: '#f5f3ff' }}>Knockout Bracket</h1>
              <p style={{ color: '#c4bdec' }}>Your WC2026 bracket predictions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.10)', color: '#c4bdec' }}
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {/* Champion Banner */}
        {champion && (
          <div
            className="mb-8 rounded-2xl border p-6 flex items-center gap-5"
            style={{ background: 'rgba(251,191,36,0.10)', borderColor: 'rgba(251,191,36,0.30)' }}
          >
            <Trophy className="w-12 h-12 flex-shrink-0" style={{ color: '#fbbf24' }} />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: '#fbbf24' }}>
                Your Predicted World Champion
              </p>
              <h2 className="text-2xl font-black" style={{ color: '#f5f3ff' }}>
                {champion.flag} {champion.name}
              </h2>
            </div>
          </div>
        )}

        {/* Bracket */}
        <Card className="p-6">
          <BracketView />
        </Card>
      </div>
    </div>
  );
}
