'use client';
import { Team, GroupId } from '@/lib/types';
import { usePredictionStore, groupComplete } from '@/lib/store';
import { tierColor, tierLabel, cn } from '@/lib/utils';
import { RotateCcw } from 'lucide-react';

interface GroupCardProps {
  groupId: GroupId;
  teams: Team[];
}

const POS_LABEL = ['1st', '2nd', '3rd', '4th'];

export default function GroupCard({ groupId, teams }: GroupCardProps) {
  const { bracket, setRanking, clearGroup } = usePredictionStore();
  const picks = bracket?.groupPredictions[groupId] ?? ['', '', '', ''];
  // Current ranked order (codes), preserving sequence, no blanks.
  const order = picks.filter(Boolean);
  const complete = groupComplete(bracket, groupId);

  const rankOf = (code: string) => order.indexOf(code); // -1 if unranked

  const handleTap = (code: string) => {
    let nextOrder: string[];
    if (order.includes(code)) {
      nextOrder = order.filter((c) => c !== code); // unrank
    } else if (order.length < 4) {
      nextOrder = [...order, code]; // assign next position
    } else {
      return;
    }
    const padded = [...nextOrder, '', '', '', ''].slice(0, 4) as [string, string, string, string];
    setRanking(groupId, padded);
  };

  return (
    <div
      className="rounded-2xl border overflow-hidden glass"
      style={{ borderColor: complete ? 'rgba(139,92,246,0.40)' : 'rgba(255,255,255,0.10)' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between"
        style={{ background: 'rgba(139,92,246,0.10)', borderColor: 'rgba(255,255,255,0.10)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
            {groupId}
          </div>
          <div>
            <h3 className="font-bold leading-tight" style={{ color: '#f5f3ff' }}>Group {groupId}</h3>
            <p className="text-[11px]" style={{ color: '#6f6796' }}>
              {complete ? 'Ranked 1–4' : `Tap teams in order · ${order.length}/4`}
            </p>
          </div>
        </div>
        {order.length > 0 && (
          <button onClick={() => clearGroup(groupId)}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: '#6f6796' }} title="Clear group" aria-label={`Clear group ${groupId}`}>
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-3 space-y-2">
        {teams.map((t) => {
          const rank = rankOf(t.code);
          const ranked = rank >= 0;
          const isThird = rank === 2;
          return (
            <button
              key={t.code}
              onClick={() => handleTap(t.code)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all active:scale-[0.99]',
                ranked ? 'ring-1' : 'hover:bg-white/[0.03]',
              )}
              style={{
                background: ranked ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)',
                boxShadow: ranked ? `inset 3px 0 0 ${tierColor(t.tier)}` : 'none',
                // @ts-expect-error CSS custom prop for ring color
                '--tw-ring-color': ranked ? 'rgba(139,92,246,0.35)' : 'transparent',
              }}
            >
              {/* rank badge */}
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{
                  background: ranked ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : 'rgba(255,255,255,0.05)',
                  color: ranked ? '#fff' : '#6f6796',
                }}>
                {ranked ? rank + 1 : '·'}
              </span>
              <span className="text-xl leading-none">{t.flag}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold truncate" style={{ color: ranked ? '#f5f3ff' : '#c4bdec' }}>
                  {t.name}
                </span>
                <span className="block text-[10px] uppercase tracking-wider" style={{ color: tierColor(t.tier) }}>
                  {tierLabel(t.tier)}
                </span>
              </span>
              {ranked && (
                <span className="text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
                  style={{ color: isThird ? '#fb7185' : '#8b5cf6' }}>
                  {POS_LABEL[rank]}
                  {isThird && ' 🎟️'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
