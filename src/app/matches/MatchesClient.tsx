'use client';
import { useState } from 'react';
import { GROUPS_DATA, TEAMS, buildGroupMatches } from '@/lib/data';
import { usePredictionStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import { Clock, MapPin, BarChart3, Wifi, WifiOff } from 'lucide-react';
import type { GroupData } from '@/lib/footballData';

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
  I: ['Jun 12', 'Jun 17', 'Jun 22'],
  J: ['Jun 13', 'Jun 18', 'Jun 23'],
  K: ['Jun 14', 'Jun 19', 'Jun 24'],
  L: ['Jun 15', 'Jun 20', 'Jun 25'],
};

interface Props {
  liveGroups: GroupData[] | null;
}

export default function MatchesClient({ liveGroups }: Props) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const { groupPredictions } = usePredictionStore();

  // Build match list from local data; overlay live scores if available
  const liveMap = new Map<string, GroupData>();
  liveGroups?.forEach(g => liveMap.set(g.group, g));
  const hasLive = !!liveGroups;

  const allGroups = GROUPS_DATA.map(g => {
    const teams = g.teamIds.map(id => TEAMS.find(t => t.id === id)!).filter(Boolean);
    const liveGroup = liveMap.get(g.name);

    const matches = buildGroupMatches(g.name, teams).map((m, mi) => {
      const liveMatch = liveGroup?.matches.find(lm => lm.home === m.homeTeam.name && lm.away === m.awayTeam.name);
      return {
        ...m,
        id: `group-${g.name}-${m.homeTeam.id}-${m.awayTeam.id}`,
        venue: VENUES[mi % VENUES.length],
        date: liveMatch?.date
          ? new Date(liveMatch.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : (STAGE_DATES[g.name]?.[Math.floor(mi / 2)] ?? 'Jun 15'),
        time: ['12:00 ET', '15:00 ET', '18:00 ET', '21:00 ET'][mi % 4],
        liveHomeScore: liveMatch?.homeScore ?? null,
        liveAwayScore: liveMatch?.awayScore ?? null,
        liveStatus: liveMatch?.status ?? 'SCHEDULED',
      };
    });

    return { name: g.name, teams, matches, standings: liveGroup?.standings ?? null };
  });

  const groups = selectedGroup ? allGroups.filter(g => g.name === selectedGroup) : allGroups;

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
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white">Match Centre</h1>
            <p className="text-gray-400 mt-1">All 72 group stage fixtures · World Cup 2026</p>
          </div>
          <div className={cn(
            'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border mt-1',
            hasLive
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-gray-700/50 border-white/10 text-gray-500'
          )}>
            {hasLive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {hasLive ? 'Live data' : 'Offline'}
          </div>
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
                'w-10 h-10 rounded-xl text-sm font-bold transition-all',
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

              {/* Live standings if available */}
              {group.standings && group.standings.length > 0 && (
                <div className="mb-4 overflow-x-auto">
                  <table className="w-full text-xs text-gray-400">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-1.5 pl-2 font-semibold text-gray-500 uppercase tracking-wider">#</th>
                        <th className="text-left py-1.5 font-semibold text-gray-500 uppercase tracking-wider">Team</th>
                        <th className="text-center py-1.5 font-semibold text-gray-500">P</th>
                        <th className="text-center py-1.5 font-semibold text-gray-500">W</th>
                        <th className="text-center py-1.5 font-semibold text-gray-500">D</th>
                        <th className="text-center py-1.5 font-semibold text-gray-500">L</th>
                        <th className="text-center py-1.5 font-semibold text-gray-500">GD</th>
                        <th className="text-center py-1.5 font-semibold text-gray-500 pr-2">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.standings.map((row, idx) => {
                        const team = TEAMS.find(t => t.name === row.team);
                        return (
                          <tr key={row.team} className={cn('border-b border-white/5', idx < 2 ? 'bg-emerald-500/5' : '')}>
                            <td className={cn('py-1.5 pl-2 font-bold', idx < 2 ? 'text-emerald-400' : 'text-gray-500')}>{row.position}</td>
                            <td className="py-1.5 flex items-center gap-2">
                              <span>{team?.flag ?? '🏳'}</span>
                              <span className="text-white font-medium">{team?.code ?? row.team.slice(0, 3).toUpperCase()}</span>
                            </td>
                            <td className="text-center py-1.5">{row.playedGames}</td>
                            <td className="text-center py-1.5">{row.won}</td>
                            <td className="text-center py-1.5">{row.draw}</td>
                            <td className="text-center py-1.5">{row.lost}</td>
                            <td className="text-center py-1.5">{row.goalDifference > 0 ? '+' : ''}{row.goalDifference}</td>
                            <td className="text-center py-1.5 pr-2 font-black text-white">{row.points}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="space-y-3">
                {group.matches.map(match => {
                  const pred = groupPredictions[match.id];
                  const pct = getCommunityPct(match.id);
                  const hasLiveScore = match.liveHomeScore !== null && match.liveAwayScore !== null;
                  const isFinished = match.liveStatus === 'FINISHED';
                  const isLive = match.liveStatus === 'IN_PLAY' || match.liveStatus === 'PAUSED';

                  return (
                    <Card key={match.id} className="overflow-hidden hover:border-emerald-500/20 transition-all">
                      <div className="p-4">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                          <Clock className="w-3 h-3" />
                          <span>{match.date} · {match.time}</span>
                          <span>·</span>
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{match.venue}</span>
                          {isLive && (
                            <span className="ml-auto flex items-center gap-1 text-red-400 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                              LIVE
                            </span>
                          )}
                          {isFinished && <span className="ml-auto text-gray-500">FT</span>}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <span className="font-semibold text-white text-sm md:text-base">{match.homeTeam.name}</span>
                            <span className="text-2xl">{match.homeTeam.flag}</span>
                          </div>

                          <div className="flex-shrink-0 text-center">
                            {hasLiveScore ? (
                              <div className={cn(
                                'rounded-xl px-4 py-2 border',
                                isFinished ? 'bg-white/10 border-white/20' : 'bg-red-500/10 border-red-500/20'
                              )}>
                                <span className="text-xl font-black text-white">{match.liveHomeScore} – {match.liveAwayScore}</span>
                                <p className="text-xs mt-0.5" style={{ color: isFinished ? '#9ca3af' : '#f87171' }}>
                                  {isFinished ? 'Full Time' : 'Live'}
                                </p>
                              </div>
                            ) : pred ? (
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
