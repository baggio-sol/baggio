'use client';
import { useState, useEffect } from 'react';
import { GROUP_IDS, getTeamsByGroup } from '@/lib/tournament';
import {
  usePredictionStore,
  completedGroupCount,
  groupStageReady,
} from '@/lib/store';
import GroupCard from '@/components/predict/GroupCard';
import ThirdPlaceSelector from '@/components/predict/ThirdPlaceSelector';
import { GroupId } from '@/lib/types';
import { ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';

export default function PredictPage() {
  const { bracket, resetPredictions } = usePredictionStore();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const totalGroups = GROUP_IDS.length;
  const done = completedGroupCount(bracket);
  const groupProgress = Math.round((done / totalGroups) * 100);
  const thirds = bracket?.thirdPlaceQualifiers.length ?? 0;
  const ready = groupStageReady(bracket);

  if (!mounted) return null;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-extrabold" style={{ color: '#f5f3ff' }}>
            Group Stage
          </h1>
          <p className="mt-2" style={{ color: '#c4bdec' }}>
            Rank all 12 groups 1st→4th, then pick the 8 third-placed teams that advance.
          </p>
        </div>

        {/* Progress */}
        <div className="rounded-2xl border p-5 mb-8 glass" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold" style={{ color: '#f5f3ff' }}>Group Stage Progress</h3>
              <p className="text-sm" style={{ color: '#c4bdec' }}>
                {done} of {totalGroups} groups ranked · {thirds}/8 third-place picks
              </p>
            </div>
            <span className="text-2xl font-black" style={{ color: '#8b5cf6' }}>{groupProgress}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${groupProgress}%`, background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)' }} />
          </div>
        </div>

        {/* Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
          {GROUP_IDS.map((gid) => (
            <GroupCard key={gid} groupId={gid as GroupId} teams={getTeamsByGroup(gid as GroupId)} />
          ))}
        </div>

        {/* Third-place selection */}
        <div className="mb-10">
          <ThirdPlaceSelector />
        </div>

        {/* Continue / reset */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6"
          style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
          <button onClick={resetPredictions} className="text-sm font-medium transition-colors" style={{ color: '#fb7185' }}>
            Reset all picks
          </button>

          {ready ? (
            <Link href="/bracket"
              className="flex items-center gap-2 text-white font-bold px-8 py-4 rounded-2xl transition-all active:scale-95"
              style={{ background: '#fb7185' }}>
              Build your knockout bracket <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2 font-bold px-8 py-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#6f6796' }}>
              <Lock className="w-5 h-5" />
              {done < totalGroups
                ? `Rank ${totalGroups - done} more group${totalGroups - done > 1 ? 's' : ''}`
                : `Pick ${8 - thirds} more third-place team${8 - thirds > 1 ? 's' : ''}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
