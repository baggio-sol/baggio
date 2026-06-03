'use client';
import { useState } from 'react';
import { Team, Match } from '@/lib/types';
import { usePredictionStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import TeamFlag from '@/components/ui/TeamFlag';
import Card from '@/components/ui/Card';

interface GroupCardProps {
  groupName: string;
  teams: Team[];
  matches: Match[];
}

export default function GroupCard({ groupName, teams, matches }: GroupCardProps) {
  const { groupPredictions, setGroupPrediction } = usePredictionStore();
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  const handleScore = (matchId: string, homeTeam: Team, awayTeam: Team, homeScore: number, awayScore: number) => {
    const winner = homeScore > awayScore ? homeTeam.id : awayScore > homeScore ? awayTeam.id : 'draw';
    setGroupPrediction(matchId, { matchId, homeScore, awayScore, winner });
  };

  // Calculate simple standings from predictions
  const standings = teams.map(team => {
    let pts = 0, gf = 0, ga = 0, w = 0, d = 0, l = 0;
    matches.forEach(m => {
      const pred = groupPredictions[m.id];
      if (!pred) return;
      if (m.homeTeam.id === team.id) {
        gf += pred.homeScore; ga += pred.awayScore;
        if (pred.homeScore > pred.awayScore) { pts += 3; w++; }
        else if (pred.homeScore === pred.awayScore) { pts++; d++; }
        else l++;
      } else if (m.awayTeam.id === team.id) {
        gf += pred.awayScore; ga += pred.homeScore;
        if (pred.awayScore > pred.homeScore) { pts += 3; w++; }
        else if (pred.homeScore === pred.awayScore) { pts++; d++; }
        else l++;
      }
    });
    return { team, pts, gf, ga, gd: gf - ga, w, d, l };
  }).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

  const completedMatches = matches.filter(m => groupPredictions[m.id]).length;
  const progress = Math.round((completedMatches / matches.length) * 100);

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600/30 to-cyan-600/20 px-5 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-black text-white text-lg shadow-lg">
              {groupName}
            </div>
            <div>
              <h3 className="font-bold text-white">Group {groupName}</h3>
              <p className="text-xs text-gray-400">{completedMatches}/{matches.length} predicted</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{progress}%</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Fixtures */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fixtures</h4>
          {matches.map(match => {
            const pred = groupPredictions[match.id];
            const isExpanded = expandedMatch === match.id;

            return (
              <div
                key={match.id}
                className={cn(
                  'rounded-xl border transition-all duration-200',
                  pred ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'
                )}
              >
                <button
                  className="w-full px-4 py-3 flex items-center gap-3"
                  onClick={() => setExpandedMatch(isExpanded ? null : match.id)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">{match.homeTeam.flag}</span>
                    <span className="text-sm font-medium text-white">{match.homeTeam.code}</span>
                  </div>

                  {pred ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-white">{pred.homeScore}</span>
                      <span className="text-gray-500 text-sm">–</span>
                      <span className="text-lg font-black text-white">{pred.awayScore}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm font-medium">vs</span>
                  )}

                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="text-sm font-medium text-white">{match.awayTeam.code}</span>
                    <span className="text-lg">{match.awayTeam.flag}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/10 pt-3">
                    <p className="text-xs text-gray-400 mb-3 text-center">Enter score prediction</p>
                    <div className="flex items-center gap-3 justify-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-xs text-gray-400">{match.homeTeam.name}</span>
                        <div className="flex items-center gap-1">
                          {[0, 1, 2, 3, 4, 5].map(n => (
                            <button
                              key={n}
                              onClick={() => handleScore(match.id, match.homeTeam, match.awayTeam, n, pred?.awayScore ?? 0)}
                              className={cn(
                                'w-9 h-9 rounded-lg text-sm font-bold transition-all',
                                pred?.homeScore === n
                                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
                              )}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                      <span className="text-gray-500 text-lg font-bold">–</span>
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-xs text-gray-400">{match.awayTeam.name}</span>
                        <div className="flex items-center gap-1">
                          {[0, 1, 2, 3, 4, 5].map(n => (
                            <button
                              key={n}
                              onClick={() => handleScore(match.id, match.homeTeam, match.awayTeam, pred?.homeScore ?? 0, n)}
                              className={cn(
                                'w-9 h-9 rounded-lg text-sm font-bold transition-all',
                                pred?.awayScore === n
                                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
                              )}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Standings */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Predicted Standings</h4>
          <div className="space-y-1.5">
            {standings.map((s, idx) => (
              <div
                key={s.team.id}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm',
                  idx < 2 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5'
                )}
              >
                <span className={cn('w-5 font-bold', idx < 2 ? 'text-emerald-400' : 'text-gray-500')}>
                  {idx + 1}
                </span>
                <span className="text-base">{s.team.flag}</span>
                <span className="font-medium text-white flex-1">{s.team.code}</span>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span>{s.w}W</span>
                  <span>{s.d}D</span>
                  <span>{s.l}L</span>
                  <span className="text-gray-500">{s.gd > 0 ? '+' : ''}{s.gd}</span>
                </div>
                <span className="font-black text-white w-6 text-right">{s.pts}</span>
                {idx < 2 && (
                  <span className="text-xs text-emerald-400 font-medium">Q</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Q = Qualifies to knockout stage</p>
        </div>
      </div>
    </Card>
  );
}
