'use client';
import { useEffect, useState } from 'react';
import BracketView from '@/components/bracket/BracketView';
import ShareCard from '@/components/spice/ShareCard';
import { usePredictionStore, groupStageReady } from '@/lib/store';
import { computeSpice } from '@/lib/spice';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';

export default function BracketPage() {
  const { bracket } = usePredictionStore();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const ready = groupStageReady(bracket);
  const spice = computeSpice(bracket);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/predict"
            className="p-2 rounded-xl border transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.10)', color: '#c4bdec' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-display font-extrabold" style={{ color: '#f5f3ff' }}>
              Knockout Bracket
            </h1>
            <p style={{ color: '#c4bdec' }}>Pick every winner — your Spice Score updates live.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 items-start">
          {/* Bracket */}
          <Card className="p-5 order-2 xl:order-1 overflow-hidden">
            <BracketView />
          </Card>

          {/* Live spice preview */}
          <div className="order-1 xl:order-2 xl:sticky xl:top-20">
            {ready ? (
              <ShareCard spice={spice} />
            ) : (
              <div className="rounded-3xl border p-6 text-center glass" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
                <div className="text-4xl mb-3">🌶️</div>
                <h3 className="font-display font-extrabold text-lg mb-1" style={{ color: '#f5f3ff' }}>
                  Your Spice Score is waiting
                </h3>
                <p className="text-sm" style={{ color: '#c4bdec' }}>
                  Finish the group stage and pick your bracket to reveal your persona and share card.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
