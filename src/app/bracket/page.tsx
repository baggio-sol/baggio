'use client';
import { useEffect, useState } from 'react';
import BracketView from '@/components/bracket/BracketView';
import { usePredictionStore } from '@/lib/store';
import { Trophy, ArrowLeft, Share2, Download } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';

export default function BracketPage() {
  const { knockoutBracket, buildKnockoutFromGroups } = usePredictionStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const r32Done = knockoutBracket.r32.filter(m => m.winner).length;
  const r16Done = knockoutBracket.r16.filter(m => m.winner).length;
  const qfDone = knockoutBracket.qf.filter(m => m.winner).length;
  const sfDone = knockoutBracket.sf.filter(m => m.winner).length;
  const hasFinalWinner = !!knockoutBracket.winner;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/predict" className="p-2 rounded-xl bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-white">Knockout Bracket</h1>
              <p className="text-gray-400 mt-0.5">Click a match to predict the winner and score</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-gray-300 hover:text-white hover:bg-white/15 transition-all text-sm font-medium">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-gray-300 hover:text-white hover:bg-white/15 transition-all text-sm font-medium">
              <Download className="w-4 h-4" /> Save Image
            </button>
            <button
              onClick={buildKnockoutFromGroups}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm font-medium"
            >
              Rebuild from Groups
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {[
            { label: 'R32', total: 16, done: r32Done },
            { label: 'R16', total: 8, done: r16Done },
            { label: 'QF', total: 4, done: qfDone },
            { label: 'SF', total: 2, done: sfDone },
            { label: 'Final', total: 1, done: hasFinalWinner ? 1 : 0 },
            { label: 'Champion', total: 1, done: hasFinalWinner ? 1 : 0, icon: '🏆' },
          ].map(s => (
            <Card key={s.label} className="p-3 text-center">
              {s.icon && <div className="text-xl mb-1">{s.icon}</div>}
              <div className={`text-lg font-black ${s.done === s.total ? 'text-emerald-400' : 'text-white'}`}>
                {s.done}/{s.total}
              </div>
              <div className="text-xs text-gray-400">{s.label}</div>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${(s.done / s.total) * 100}%` }}
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Champion Banner */}
        {knockoutBracket.winner && (
          <div className="mb-8 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-2xl p-6 flex items-center gap-5">
            <Trophy className="w-12 h-12 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-yellow-400 text-sm font-semibold uppercase tracking-wider mb-1">Your Predicted World Champion</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{knockoutBracket.winner.flag}</span>
                <h2 className="text-2xl font-black text-white">{knockoutBracket.winner.name}</h2>
              </div>
            </div>
          </div>
        )}

        {/* Bracket */}
        <Card glass className="p-6">
          <BracketView />
        </Card>

        {/* Tips */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-300 text-sm">
            <strong>💡 Tip:</strong> Click on any match to select a winner and predict the score. Scroll right to see the full bracket. Winners automatically advance to the next round.
          </p>
        </div>
      </div>
    </div>
  );
}
