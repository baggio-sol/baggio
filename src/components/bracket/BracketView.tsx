'use client';
import { usePredictionStore } from '@/lib/store';
import { Trophy } from 'lucide-react';

export default function BracketView() {
  const { bracket } = usePredictionStore();

  const champion = bracket?.knockout.champion;

  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex flex-col items-center gap-8 py-8">
        <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 min-w-[180px]">
          <Trophy className="w-10 h-10 text-yellow-400" />
          {champion ? (
            <span className="text-white font-bold text-center text-sm">{champion}</span>
          ) : (
            <span className="text-[#6f6796] text-sm text-center">Complete bracket to reveal champion</span>
          )}
        </div>
        <p className="text-[#c4bdec] text-sm text-center max-w-md">
          Bracket builder coming soon. Fill out your group predictions to get started.
        </p>
      </div>
    </div>
  );
}
