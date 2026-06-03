'use client';
import { useState } from 'react';
import { PLAYERS, TEAMS } from '@/lib/data';
import { usePredictionStore } from '@/lib/store';
import { TournamentAwards } from '@/lib/types';
import Card from '@/components/ui/Card';
import { Star, Target, Shield, Zap, TrendingUp, AlertCircle, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const AWARD_CONFIG: { key: keyof TournamentAwards; label: string; description: string; icon: React.ReactNode; type: 'player' | 'team'; points: number }[] = [
  { key: 'goldenBoot', label: 'Golden Boot', description: 'Top scorer of the tournament', icon: <Target className="w-5 h-5" />, type: 'player', points: 15 },
  { key: 'goldenBall', label: 'Golden Ball', description: 'Best player of the tournament', icon: <Star className="w-5 h-5" />, type: 'player', points: 15 },
  { key: 'bestYoungPlayer', label: 'Best Young Player', description: 'Rising star under 21', icon: <Zap className="w-5 h-5" />, type: 'player', points: 10 },
  { key: 'goldenGlove', label: 'Golden Glove', description: 'Best goalkeeper', icon: <Shield className="w-5 h-5" />, type: 'player', points: 10 },
  { key: 'mostAssists', label: 'Most Assists', description: 'Most assists in tournament', icon: <TrendingUp className="w-5 h-5" />, type: 'player', points: 10 },
  { key: 'surpriseTeam', label: 'Surprise Team', description: 'Biggest overperformer', icon: <Award className="w-5 h-5" />, type: 'team', points: 15 },
  { key: 'biggestFlop', label: 'Biggest Flop', description: 'Most disappointing team', icon: <AlertCircle className="w-5 h-5" />, type: 'team', points: 10 },
];

const GK_IDS = ['alisson', 'courtois', 'lloris', 'pickford'];
const YOUNG_IDS = ['bellingham', 'pedri2', 'pedros', 'vini', 'saka'];

export default function AwardsSection() {
  const { awards, setAward } = usePredictionStore();
  const [activeAward, setActiveAward] = useState<keyof TournamentAwards | null>(null);

  const completed = Object.keys(awards).length;
  const total = AWARD_CONFIG.length;

  const getOptions = (award: typeof AWARD_CONFIG[0]) => {
    if (award.type === 'team') return TEAMS.slice(0, 16);
    if (award.key === 'goldenGlove') return PLAYERS.filter(p => GK_IDS.includes(p.id));
    if (award.key === 'bestYoungPlayer') return PLAYERS.filter(p => YOUNG_IDS.includes(p.id));
    if (award.key === 'goldenBoot' || award.key === 'mostAssists') return PLAYERS.filter(p => p.position === 'FW' || p.position === 'MF');
    return PLAYERS;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Tournament Awards</h2>
          <p className="text-gray-400 mt-1">Predict the award winners for bonus points</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-emerald-400">{completed}/{total}</span>
          <p className="text-xs text-gray-400">completed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AWARD_CONFIG.map(award => {
          const current = awards[award.key];
          const isActive = activeAward === award.key;
          const options = getOptions(award);

          return (
            <Card key={award.key} className="overflow-hidden">
              <button
                className="w-full p-5 flex items-start gap-4 hover:bg-white/5 transition-all text-left"
                onClick={() => setActiveAward(isActive ? null : award.key)}
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  current ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-gray-400'
                )}>
                  {award.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-white">{award.label}</h3>
                    <span className="text-xs text-emerald-400 font-bold">+{award.points}pts</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{award.description}</p>
                  {current && (
                    <div className="mt-2 flex items-center gap-2">
                      {'flag' in current && <span className="text-lg">{current.flag}</span>}
                      <span className="text-sm font-medium text-emerald-300">{current.name}</span>
                    </div>
                  )}
                </div>
              </button>

              {isActive && (
                <div className="border-t border-white/10 p-4">
                  <p className="text-xs text-gray-400 mb-3">Select your prediction:</p>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {options.map(option => {
                      const isSelected = current?.id === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => {
                            setAward(award.key, option as any);
                            setActiveAward(null);
                          }}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left',
                            isSelected
                              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                              : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                          )}
                        >
                          {'flag' in option && <span className="text-base">{option.flag}</span>}
                          <span className="truncate">{option.name}</span>
                          {'position' in option && (
                            <span className="text-xs text-gray-500 ml-auto">{option.position}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
