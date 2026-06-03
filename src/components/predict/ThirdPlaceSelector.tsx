'use client';
import { usePredictionStore, thirdPlacedCodes } from '@/lib/store';
import { TEAM_BY_CODE, GROUP_IDS } from '@/lib/tournament';
import { tierColor, cn } from '@/lib/utils';
import { Check } from 'lucide-react';

/**
 * Pick which 8 of the 12 third-placed teams advance. Only teams currently
 * sitting 3rd in their group are eligible; you cannot select more than 8.
 */
export default function ThirdPlaceSelector() {
  const { bracket, toggleThird } = usePredictionStore();

  // One row per group, showing that group's current 3rd-placed team (if ranked).
  const rows = GROUP_IDS.map((g) => ({
    group: g,
    code: bracket?.groupPredictions[g][2] ?? '',
  }));
  const eligibleCount = bracket ? thirdPlacedCodes(bracket).length : 0;
  const selected = bracket?.thirdPlaceQualifiers ?? [];
  const atCap = selected.length >= 8;

  return (
    <div className="rounded-2xl border p-5 glass" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold" style={{ color: '#f5f3ff' }}>Third-place qualifiers</h3>
        <span className="text-sm font-black"
          style={{ color: selected.length === 8 ? '#8b5cf6' : '#fb7185' }}>
          {selected.length}/8
        </span>
      </div>
      <p className="text-sm mb-4" style={{ color: '#c4bdec' }}>
        8 of the 12 third-placed teams advance. Pick the eight you think sneak through.
      </p>

      {eligibleCount < 12 && (
        <p className="text-xs mb-4 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(251,113,133,0.10)', color: '#fb7185' }}>
          Rank all 12 groups first — {12 - eligibleCount} still need a 3rd-placed team.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {rows.map(({ group, code }) => {
          const team = code ? TEAM_BY_CODE[code] : undefined;
          const isSelected = code !== '' && selected.includes(code);
          const disabled = !team || (!isSelected && atCap);
          return (
            <button
              key={group}
              disabled={disabled || !team}
              onClick={() => team && toggleThird(code)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all',
                !team && 'opacity-40 cursor-not-allowed',
                disabled && team && 'opacity-50 cursor-not-allowed',
                isSelected && 'ring-1',
              )}
              style={{
                background: isSelected ? 'rgba(139,92,246,0.16)' : 'rgba(255,255,255,0.03)',
                boxShadow: team ? `inset 3px 0 0 ${tierColor(team.tier)}` : 'none',
                // @ts-expect-error CSS custom prop for ring color
                '--tw-ring-color': isSelected ? 'rgba(139,92,246,0.40)' : 'transparent',
              }}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : 'rgba(255,255,255,0.06)',
                }}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </span>
              <span className="text-base leading-none">{team?.flag ?? '—'}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6f6796' }}>
                  3rd · {group}
                </span>
                <span className="block text-xs font-semibold truncate" style={{ color: team ? '#f5f3ff' : '#6f6796' }}>
                  {team?.name ?? 'Unranked'}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
