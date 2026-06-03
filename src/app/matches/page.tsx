'use client';
import { useState } from 'react';
import { GROUPS_DATA, TEAMS, buildGroupMatches } from '@/lib/data';
import { usePredictionStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import { Clock, MapPin, BarChart3 } from 'lucide-react';

const VENUES = ['MetLife Stadium', 'Rose Bowl', 'AT&T Stadium', 'Estadio Azteca', 'BC Place', 'SoFi Stadium', 'Mercedes-Benz Stadium', 'Lumen Field'];

const STAGE_DATES: Record<string, string[]> = {
  A: ['Jun 12', 'Jun 17', 'Jun 22'],
  B: ['Jun 13', 'Jun 18', 'Jun 23'],
  C: ['Jun 14', 'Jun 19', 'Jun 24'],
  D: ['Jun 15', 'Jun 20', 'Jun 25'],
  E: ['Jun 12', 'Jun 17', 'Jun 22'],
  F: ['Jun 13', 'Jun 18', 'Jun 23'],
  G: ['Jun 14', 'Jun 19', 'Jun 24'],
  H: ['Jun 15', 'Jun 20', 'Jun 25'],
};

export default function MatchesPage() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const { groupPredictions } = usePredictionStore();

  const allGroups = GROUPS_DATA.map(g => {
    const teams = g.teamIds.map(id => TEAMS.find(t => t.id === id)!).filter(Boolean);
    const matches = buildGroupMatches(g.name, teams).map((m, mi) => ({
      ...m,
      id: `group-${g.name}-${m.homeTeam.id}-${m.awayTeam.id}`,
      venue: VENUES[mi % VENUES.length],
      date: STAGE_DATES[g.name]?.[Math.floor(mi / 2)] || 'Jun 15',
      time: ['12:00 ET', '15:00 ET', '18:00 ET', '21:00 ET'][mi % 4],
    }));
    return { name: g.name, teams, matches };
  });

  const groups = selectedGroup ? allGroups.filter(g => g.name === selectedGroup) : allGroups;

  // Community prediction percentages (mock)
  const getCommunityPct = (matchId: string) => {
    const seed = matchId.charCodeAt(matchId.length - 1);
    const home = 30 + (seed % 40);
    const draw = 10 + (seed % 20);
    const away = 100 - home - draw;
    return { home, draw, away: Math.max(5, away) };
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white">Match Center</h1>
          <p className="text-gray-400 mt-1">All 64 World Cup 2026 fixtures</p>
        </div>

        {/* Group filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedGroup(null)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',
              !selectedGroup ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
            )}
          >
            All Groups
          </button>
          {GROUPS_DATA.map(g => (
            <button
              key={g.name}
              onClick={() => setSelectedGroup(selectedGroup === g.name ? null : g.name)}
              className={cn(
                'w-10 h-10 rounded-xl text-sm font-bold transition-all whitespace-nowrap',
                selectedGroup === g.name ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
              )}
            >
              {g.name}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {groups.map(group => (
            <div key={group.name}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm">
                  {group.name}
                </div>
                <h2 className="text-lg font-bold text-white">Group {group.name}</h2>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="space-y-3">
                {group.matches.map(match => {
                  const pred = groupPredictions[match.id];
                  const pct = getCommunityPct(match.id);

                  return (
                    <Card key={match.id} className="overflow-hidden hover:border-emerald-500/20 transition-all">
                      <div className="p-4">
                        {/* Match info */}
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                          <Clock className="w-3 h-3" />
                          <span>{match.date} · {match.time}</span>
                          <span>·</span>
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{match.venue}</span>
                        </div>

                        {/* Teams & Score */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <span className="font-semibold text-white text-sm md:text-base">{match.homeTeam.name}</span>
                            <span className="text-2xl">{match.homeTeam.flag}</span>
                          </div>

                          <div className="flex-shrink-0 text-center">
                            {pred ? (
                              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-4 py-2">
                                <span className="text-xl font-black text-white">{pred.homeScore} – {pred.awayScore}</span>
                                <p className="text-xs text-emerald-400 mt-0.5">Your prediction</p>
                              </div>
                            ) : (
                              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                                <span className="text-sm text-gray-400 font-medium">VS</span>
                                <p className="text-xs text-gray-500 mt-0.5">Not predicted</p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-2xl">{match.awayTeam.flag}</span>
                            <span className="font-semibold text-white text-sm md:text-base">{match.awayTeam.name}</span>
                          </div>
                        </div>

                        {/* Community predictions */}
                        <div className="mt-4 pt-3 border-t border-white/10">
                          <div className="flex items-center gap-1 mb-1.5">
                            <BarChart3 className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">Community predictions</span>
                          </div>
                          <div className="flex rounded-lg overflow-hidden h-2">
                            <div className="bg-blue-500 transition-all" style={{ width: `${pct.home}%` }} />
                            <div className="bg-gray-500 transition-all" style={{ width: `${pct.draw}%` }} />
                            <div className="bg-red-500 transition-all" style={{ width: `${pct.away}%` }} />
                          </div>
                          <div className="flex justify-between mt-1 text-xs text-gray-400">
                            <span className="text-blue-400">{pct.home}% {match.homeTeam.code}</span>
                            <span>{pct.draw}% Draw</span>
                            <span className="text-red-400">{match.awayTeam.code} {pct.away}%</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
