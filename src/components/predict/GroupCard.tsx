'use client';
import { Team, GroupId } from '@/lib/types';
import { usePredictionStore } from '@/lib/store';
import Card from '@/components/ui/Card';

interface GroupCardProps {
  groupId: GroupId;
  teams: Team[];
}

export default function GroupCard({ groupId, teams }: GroupCardProps) {
  const { bracket, setGroupPrediction } = usePredictionStore();
  const picks = bracket?.groupPredictions[groupId] ?? ['', '', '', ''];

  const handlePick = (position: number, teamCode: string) => {
    const next = [...picks] as [string, string, string, string];
    next[position] = teamCode;
    setGroupPrediction(groupId, next);
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10" style={{ background: 'rgba(139,92,246,0.10)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
          >
            {groupId}
          </div>
          <h3 className="font-bold" style={{ color: '#f5f3ff' }}>Group {groupId}</h3>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6f6796' }}>
          Rank teams 1–4
        </p>
        {[0, 1, 2, 3].map(pos => {
          const currentCode = picks[pos];
          return (
            <div key={pos} className="flex items-center gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: pos < 2 ? 'rgba(139,92,246,0.20)' : 'rgba(255,255,255,0.05)',
                  color: pos < 2 ? '#8b5cf6' : '#6f6796',
                }}
              >
                {pos + 1}
              </span>
              <select
                value={currentCode}
                onChange={e => handlePick(pos, e.target.value)}
                className="flex-1 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: currentCode ? '#f5f3ff' : '#6f6796',
                }}
              >
                <option value="">— Pick team —</option>
                {teams.map(t => (
                  <option key={t.code} value={t.code}>
                    {t.flag} {t.name}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
