'use client';
import { useState, useEffect } from 'react';
import { GROUP_IDS, getTeamsByGroup } from '@/lib/data';
import { usePredictionStore } from '@/lib/store';
import GroupCard from '@/components/predict/GroupCard';
import AwardsSection from '@/components/predict/AwardsSection';
import { GroupId } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CheckCircle, ArrowRight, Trophy, Users, Star } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  { id: 'groups', label: 'Group Stage', icon: <Users className="w-4 h-4" /> },
  { id: 'awards', label: 'Awards', icon: <Star className="w-4 h-4" /> },
  { id: 'review', label: 'Review', icon: <Trophy className="w-4 h-4" /> },
];

export default function PredictPage() {
  const { currentStep, setStep, bracket, resetPredictions } = usePredictionStore();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const totalGroups = GROUP_IDS.length;
  const predictedGroups = GROUP_IDS.filter(gid => {
    const picks = bracket?.groupPredictions[gid] ?? ['', '', '', ''];
    return picks.every(p => p !== '');
  }).length;
  const groupProgress = Math.round((predictedGroups / totalGroups) * 100);

  if (!mounted) return null;

  const handleNext = () => {
    if (currentStep === 'groups') setStep('awards');
    else if (currentStep === 'awards') setStep('review');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black" style={{ color: '#f5f3ff' }}>Your Predictions</h1>
          <p className="mt-2" style={{ color: '#c4bdec' }}>FIFA World Cup 2026 — Rank all 12 groups to get your Spice Score</p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isDone = STEPS.findIndex(s => s.id === currentStep) > idx;
            return (
              <button
                key={step.id}
                onClick={() => setStep(step.id as typeof currentStep)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',
                  isActive
                    ? 'border text-[#8b5cf6]'
                    : isDone
                    ? 'border text-[#c4bdec]'
                    : 'border text-[#6f6796]'
                )}
                style={{
                  background: isActive ? 'rgba(139,92,246,0.15)' : isDone ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  borderColor: isActive ? 'rgba(139,92,246,0.40)' : 'rgba(255,255,255,0.08)',
                }}
              >
                {isDone ? <CheckCircle className="w-4 h-4 text-[#8b5cf6]" /> : step.icon}
                {step.label}
              </button>
            );
          })}
        </div>

        {/* Group Stage */}
        {currentStep === 'groups' && (
          <div className="space-y-8">
            {/* Progress bar */}
            <div
              className="rounded-2xl border p-5"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold" style={{ color: '#f5f3ff' }}>Group Stage Progress</h3>
                  <p className="text-sm" style={{ color: '#c4bdec' }}>{predictedGroups} of {totalGroups} groups completed</p>
                </div>
                <span className="text-2xl font-black" style={{ color: '#8b5cf6' }}>{groupProgress}%</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${groupProgress}%`, background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {GROUP_IDS.map(gid => (
                <GroupCard
                  key={gid}
                  groupId={gid as GroupId}
                  teams={getTeamsByGroup(gid as GroupId)}
                />
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 text-white font-bold px-8 py-4 rounded-2xl transition-all active:scale-95"
                style={{ background: '#fb7185' }}
              >
                Continue to Awards <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Awards */}
        {currentStep === 'awards' && (
          <div className="space-y-8">
            <AwardsSection />
            <div className="flex justify-between">
              <button onClick={() => setStep('groups')} className="font-medium transition-colors" style={{ color: '#c4bdec' }}>
                ← Back to Groups
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 text-white font-bold px-8 py-4 rounded-2xl transition-all active:scale-95"
                style={{ background: '#fb7185' }}
              >
                Review Predictions <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Review */}
        {currentStep === 'review' && (
          <div className="space-y-6">
            <div
              className="rounded-2xl border p-6"
              style={{ background: 'rgba(139,92,246,0.10)', borderColor: 'rgba(139,92,246,0.30)' }}
            >
              <div className="flex items-start gap-4">
                <Trophy className="w-10 h-10 flex-shrink-0 mt-1" style={{ color: '#8b5cf6' }} />
                <div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: '#f5f3ff' }}>Predictions Summary</h3>
                  <p className="text-sm mb-4" style={{ color: '#c4bdec' }}>
                    {predictedGroups} of {totalGroups} groups completed.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Groups Done', value: `${predictedGroups}/${totalGroups}`, icon: '✅' },
                      { label: 'Progress', value: `${groupProgress}%`, icon: '📊' },
                      { label: 'Spice Score', value: 'Pending', icon: '🌶️' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="text-2xl mb-1">{s.icon}</div>
                        <div className="text-xl font-black" style={{ color: '#f5f3ff' }}>{s.value}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#6f6796' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/bracket"
                className="flex items-center justify-center gap-3 text-white font-bold px-6 py-4 rounded-2xl transition-all"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
              >
                <Trophy className="w-5 h-5" /> View Bracket
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center justify-center gap-3 font-bold px-6 py-4 rounded-2xl transition-all glass"
                style={{ color: '#f5f3ff' }}
              >
                See Leaderboard
              </Link>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep('groups')} className="font-medium transition-colors" style={{ color: '#c4bdec' }}>
                ← Edit Group Predictions
              </button>
              <button onClick={resetPredictions} className="font-medium transition-colors" style={{ color: '#fb7185' }}>
                Reset All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
