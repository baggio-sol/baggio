'use client';
import { useState, useEffect, useRef } from 'react';
import { GROUP_IDS, getTeamsByGroup } from '@/lib/tournament';
import { usePredictionStore, completedGroupCount, groupStageReady, groupComplete } from '@/lib/store';
import GroupCard from '@/components/predict/GroupCard';
import ThirdPlaceSelector from '@/components/predict/ThirdPlaceSelector';
import { GroupId } from '@/lib/types';
import { Lock, ArrowRight, RotateCcw } from 'lucide-react';
import Link from 'next/link';

type Tab = 'groups' | 'thirds' | 'knockout';

export default function PredictPage() {
  const { bracket, resetPredictions } = usePredictionStore();
  const [mounted, setMounted] = useState(false);
  const [activeGroup, setActiveGroup] = useState<GroupId>('A');
  const [tab, setTab] = useState<Tab>('groups');
  const tabBarRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const done = completedGroupCount(bracket);
  const thirds = bracket?.thirdPlaceQualifiers.length ?? 0;
  const allGroupsDone = done === GROUP_IDS.length;
  const ready = groupStageReady(bracket);

  // Scroll active group tab into view
  useEffect(() => {
    if (!tabBarRef.current) return;
    const el = tabBarRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
    el?.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
  }, [activeGroup]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'transparent' }}>
      {/* ── Header card ──────────────────────────────────────────────── */}
      <div className="max-w-2xl w-full mx-auto px-4 pt-6 pb-3">
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6f6796' }}>
              Your Bracket
            </p>
            <button
              onClick={resetPredictions}
              className="flex items-center gap-1.5 text-xs font-semibold transition-colors hover:opacity-80"
              style={{ color: '#fb7185' }}
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
          <h1 className="font-display font-extrabold text-2xl mb-3" style={{ color: '#f5f3ff' }}>
            {tab === 'thirds'
              ? `Best 3rd ${thirds}/8`
              : tab === 'knockout'
              ? 'Knockout'
              : `Groups ${done}/${GROUP_IDS.length}`}
          </h1>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${
                  tab === 'thirds'
                    ? Math.round((thirds / 8) * 100)
                    : Math.round((done / GROUP_IDS.length) * 100)
                }%`,
                background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Group letter tabs ─────────────────────────────────────────── */}
      {tab === 'groups' && (
        <div className="max-w-2xl w-full mx-auto px-4 py-3">
          <div
            ref={tabBarRef}
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
          >
            {GROUP_IDS.map((g) => {
              const complete = groupComplete(bracket, g as GroupId);
              const isActive = activeGroup === g;
              return (
                <button
                  key={g}
                  data-active={isActive}
                  onClick={() => setActiveGroup(g as GroupId)}
                  className="flex-shrink-0 w-11 h-11 rounded-full font-display font-extrabold text-base transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
                      : complete
                      ? 'rgba(139,92,246,0.20)'
                      : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#fff' : complete ? '#a78bfa' : '#c4bdec',
                    border: isActive ? 'none' : '1px solid rgba(255,255,255,0.10)',
                  }}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 pb-32">
        {tab === 'groups' && (
          <GroupCard
            groupId={activeGroup}
            teams={getTeamsByGroup(activeGroup)}
            onComplete={() => {
              const idx = GROUP_IDS.indexOf(activeGroup);
              if (idx < GROUP_IDS.length - 1) setActiveGroup(GROUP_IDS[idx + 1] as GroupId);
            }}
          />
        )}
        {tab === 'thirds' && <ThirdPlaceSelector />}
        {tab === 'knockout' && ready && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="font-display font-extrabold text-xl" style={{ color: '#f5f3ff' }}>
              Ready for the knockout stage!
            </p>
            <Link
              href="/bracket"
              className="flex items-center gap-2 font-display font-extrabold px-8 py-4 rounded-2xl text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
            >
              Go to bracket <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>

      {/* ── Bottom nav ───────────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'rgba(12,8,28,0.92)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="max-w-2xl mx-auto flex">
          {(
            [
              { id: 'groups',   label: 'Groups',   locked: false,          count: `${done}/12` },
              { id: 'thirds',   label: 'Best 3rd',  locked: !allGroupsDone, count: `${thirds}/8` },
              { id: 'knockout', label: 'Knockout',  locked: !ready,         count: null },
            ] as { id: Tab; label: string; locked: boolean; count: string | null }[]
          ).map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                disabled={t.locked}
                onClick={() => !t.locked && setTab(t.id)}
                className="flex-1 flex flex-col items-center justify-center py-3.5 gap-0.5 transition-all"
                style={{ color: t.locked ? '#3a3358' : isActive ? '#a78bfa' : '#6f6796' }}
              >
                {t.locked && <Lock className="w-3.5 h-3.5 mb-0.5" />}
                <span className="text-xs font-bold">{t.label}</span>
                {t.count && !t.locked && (
                  <span className="text-[10px]" style={{ color: isActive ? '#8b5cf6' : '#6f6796' }}>
                    {t.count}
                  </span>
                )}
                {isActive && (
                  <div
                    className="absolute bottom-0 h-0.5 w-12 rounded-full"
                    style={{ background: '#8b5cf6' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
