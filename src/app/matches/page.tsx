'use client';
import { useState } from 'react';
import { GROUP_IDS, getTeamsByGroup } from '@/lib/data';
import { GroupId } from '@/lib/types';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import { Clock, MapPin } from 'lucide-react';

const VENUES = ['MetLife Stadium', 'Rose Bowl', 'AT&T Stadium', 'Estadio Azteca', 'BC Place', 'SoFi Stadium', 'Mercedes-Benz Stadium', 'Lumen Field'];

export default function MatchesPage() {
  const [selectedGroup, setSelectedGroup] = useState<GroupId | null>(null);

  const allGroups = GROUP_IDS.map(gid => {
    const teams = getTeamsByGroup(gid as GroupId);
    const matches: { id: string; home: typeof teams[0]; away: typeof teams[0]; venue: string; date: string }[] = [];
    let mi = 0;
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          id: `group-${gid}-${teams[i].code}-${teams[j].code}`,
          home: teams[i],
          away: teams[j],
          venue: VENUES[mi % VENUES.length],
          date: `Jun ${12 + (mi % 14)}`,
        });
        mi++;
      }
    }
    return { gid: gid as GroupId, teams, matches };
  });

  const groups = selectedGroup ? allGroups.filter(g => g.gid === selectedGroup) : allGroups;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black" style={{ color: '#f1f0f7' }}>Match Center</h1>
          <p className="mt-1" style={{ color: '#a09db8' }}>All WC2026 fixtures — 12 groups, 104 matches</p>
        </div>

        {/* Group filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedGroup(null)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border',
              !selectedGroup
                ? 'border-[rgba(139,92,246,0.40)] text-[#7c3aed]'
                : 'border-white/10 text-[#a09db8] hover:text-[#a09db8]'
            )}
            style={{ background: !selectedGroup ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)' }}
          >
            All Groups
          </button>
          {GROUP_IDS.map(gid => (
            <button
              key={gid}
              onClick={() => setSelectedGroup(selectedGroup === gid ? null : gid as GroupId)}
              className={cn(
                'w-10 h-10 rounded-xl text-sm font-bold transition-all border',
                selectedGroup === gid
                  ? 'border-[rgba(139,92,246,0.40)] text-[#7c3aed]'
                  : 'border-white/10 text-[#a09db8] hover:text-[#a09db8]'
              )}
              style={{ background: selectedGroup === gid ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)' }}
            >
              {gid}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {groups.map(group => (
            <div key={group.gid}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
                >
                  {group.gid}
                </div>
                <h2 className="text-lg font-bold" style={{ color: '#f1f0f7' }}>Group {group.gid}</h2>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.10)' }} />
              </div>

              <div className="space-y-3">
                {group.matches.map(match => (
                  <Card key={match.id} className="overflow-hidden transition-all">
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs mb-3" style={{ color: '#a09db8' }}>
                        <Clock className="w-3 h-3" />
                        <span>{match.date}</span>
                        <span>·</span>
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{match.venue}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="font-semibold text-sm md:text-base" style={{ color: '#f1f0f7' }}>{match.home.name}</span>
                          <span className="text-2xl">{match.home.flag}</span>
                        </div>

                        <div
                          className="flex-shrink-0 text-center rounded-xl px-4 py-2 border"
                          style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.10)' }}
                        >
                          <span className="text-sm font-medium" style={{ color: '#a09db8' }}>VS</span>
                        </div>

                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-2xl">{match.away.flag}</span>
                          <span className="font-semibold text-sm md:text-base" style={{ color: '#f1f0f7' }}>{match.away.name}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
