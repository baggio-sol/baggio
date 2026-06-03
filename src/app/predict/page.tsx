'use client';
import { useState, useEffect } from 'react';
import { GROUPS_DATA, TEAMS, buildGroupMatches } from '@/lib/data';
import { usePredictionStore } from '@/lib/store';
import GroupCard from '@/components/predict/GroupCard';
import AwardsSection from '@/components/predict/AwardsSection';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, ArrowRight, Trophy, Users, Star } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  { id: 'groups', label: 'Group Stage', icon: <Users className="w-4 h-4" /> },
  { id: 'awards', label: 'Awards', icon: <Star className="w-4 h-4" /> },
  { id: 'review', label: 'Review', icon: <Trophy className="w-4 h-4" /> },
];

export default function PredictPage() {
  const { currentStep, setStep, groupPredictions, awards, buildKnockoutFromGroups } = usePredictionStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const groups = GROUPS_DATA.map(g => {
    const teams = g.teamIds.map(id => TEAMS.find(t => t.id === id)!).filter(Boolean);
    return {
      name: g.name,
      teams,
      matches: buildGroupMatches(g.name, teams).map(m => ({
        ...m,
        id: `group-${g.name}-${m.homeTeam.id}-${m.awayTeam.id}`,
      })),
    };
  });

  const totalGroupMatches = groups.reduce((s, g) => s + g.matches.length, 0);
  const predictedMatches = Object.keys(groupPredictions).length;
  const groupProgress = Math.round((predictedMatches / totalGroupMatches) * 100);
  const awardsCompleted = Object.keys(awards).length;

  if (!mounted) return null;

  const handleNext = () => {
    if (currentStep === 'groups') {
      buildKnockoutFromGroups();
      setStep('awards');
    } else if (currentStep === 'awards') {
      setStep('review');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white">Your Predictions</h1>
          <p className="text-gray-400 mt-2">FIFA World Cup 2026 – Complete all predictions for maximum points</p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isDone = STEPS.findIndex(s => s.id === currentStep) > idx;
            return (
              <button
                key={step.id}
                onClick={() => setStep(step.id as any)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',
                  isActive ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' :
                    isDone ? 'bg-white/10 border border-white/10 text-gray-300' :
                      'bg-white/5 border border-white/5 text-gray-500'
                )}
              >
                {isDone ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : step.icon}
                {step.label}
              </button>
            );
          })}
        </div>

        {/* Group Stage */}
        {currentStep === 'groups' && (
          <div className="space-y-8">
            {/* Progress bar */}
            <div className="bg-gray-800/60 rounded-2xl border border-white/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">Group Stage Progress</h3>
                  <p className="text-sm text-gray-400">{predictedMatches} of {totalGroupMatches} matches predicted</p>
                </div>
                <span className="text-2xl font-black text-emerald-400">{groupProgress}%</span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${groupProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {groups.map(group => (
                <GroupCard
                  key={group.name}
                  groupName={group.name}
                  teams={group.teams}
                  matches={group.matches}
                />
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-xl shadow-emerald-500/25 active:scale-95"
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
              <button onClick={() => setStep('groups')} className="text-gray-400 hover:text-white flex items-center gap-2 font-medium transition-colors">
                ← Back to Groups
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-xl shadow-emerald-500/25 active:scale-95"
              >
                Review Predictions <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Review */}
        {currentStep === 'review' && (
          <div className="space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <Trophy className="w-10 h-10 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Predictions Summary</h3>
                  <p className="text-gray-400 text-sm mb-4">Here&apos;s a summary of your predictions so far.</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Group Matches', value: `${predictedMatches}/${totalGroupMatches}`, icon: '⚽' },
                      { label: 'Awards Picked', value: `${awardsCompleted}/7`, icon: '🏅' },
                      { label: 'Groups Done', value: `${groups.filter(g => g.matches.every(m => groupPredictions[m.id])).length}/${groups.length}`, icon: '✅' },
                      { label: 'Potential Points', value: `${predictedMatches * 3 + awardsCompleted * 12}+`, icon: '⭐' },
                    ].map(s => (
                      <div key={s.label} className="bg-white/5 rounded-xl p-4 text-center">
                        <div className="text-2xl mb-1">{s.icon}</div>
                        <div className="text-xl font-black text-white">{s.value}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/bracket"
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold px-6 py-4 rounded-2xl hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-xl shadow-emerald-500/25"
              >
                <Trophy className="w-5 h-5" /> View & Edit Bracket
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center justify-center gap-3 bg-white/10 border border-white/20 text-white font-bold px-6 py-4 rounded-2xl hover:bg-white/15 transition-all"
              >
                See Leaderboard
              </Link>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep('groups')} className="text-gray-400 hover:text-white font-medium transition-colors">
                ← Edit Group Predictions
              </button>
              <button onClick={() => setStep('awards')} className="text-gray-400 hover:text-white font-medium transition-colors">
                ← Edit Awards
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
