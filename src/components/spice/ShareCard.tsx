'use client';
import type { SpiceResult } from '@/lib/types';
import { TEAM_BY_CODE } from '@/lib/tournament';
import { tierColor } from '@/lib/utils';

/**
 * The live share card. The numbers here come from computeSpice() — the SAME
 * function the server OG image will call (Phase 6), so the preview and the
 * unfurled card can never disagree.
 */
export default function ShareCard({ spice, handle }: { spice: SpiceResult; handle?: string }) {
  const heroes: { key: string; label: string; icon: string; code: string }[] = [
    { key: 'champion', label: 'Champion', icon: '🏆', code: spice.champion },
    { key: 'runnerUp', label: 'Runner-up', icon: '🥈', code: spice.runnerUp },
    { key: 'darkHorse', label: 'Dark horse', icon: '🐎', code: spice.darkHorse },
    { key: 'earlyExit', label: 'Crashes out', icon: '💀', code: spice.earlyExit },
  ];

  return (
    <div
      className="rounded-3xl border overflow-hidden w-full max-w-md mx-auto"
      style={{
        borderColor: 'rgba(255,255,255,0.12)',
        background:
          'radial-gradient(600px 300px at 90% -10%, rgba(139,92,246,0.35), transparent 60%), radial-gradient(500px 320px at -10% 120%, rgba(59,130,246,0.30), transparent 55%), linear-gradient(160deg,#1a0d36,#120931 55%,#080f28)',
        boxShadow: '0 24px 60px -20px rgba(139,92,246,0.45)',
      }}
    >
      <div className="p-6">
        {/* Persona + score */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: '#c4bdec' }}>
              Certified
            </p>
            <h2 className="text-2xl font-display font-extrabold leading-tight" style={{ color: '#f5f3ff' }}>
              {spice.persona} {spice.personaEmoji}
            </h2>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-5xl font-display font-extrabold spice-glow" style={{ color: '#fb7185' }}>
              {spice.score}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6f6796' }}>
              Spice / 100
            </p>
          </div>
        </div>

        {/* Score bar (segmented by category) */}
        <SpiceBar spice={spice} />

        {/* Boldest call */}
        <div
          className="rounded-2xl px-4 py-3 my-5 border"
          style={{ background: 'rgba(251,113,133,0.10)', borderColor: 'rgba(251,113,133,0.25)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#fb7185' }}>
            Boldest call
          </p>
          <p className="text-sm font-semibold" style={{ color: '#f5f3ff' }}>
            {spice.boldestCall}
          </p>
        </div>

        {/* Hero picks */}
        <div className="grid grid-cols-2 gap-2.5">
          {heroes.map((h) => {
            const team = h.code ? TEAM_BY_CODE[h.code] : undefined;
            return (
              <div
                key={h.key}
                className="rounded-2xl px-3 py-2.5 border"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.10)',
                  boxShadow: team ? `inset 3px 0 0 ${tierColor(team.tier)}` : 'none',
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#6f6796' }}>
                  {h.icon} {h.label}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none">{team?.flag ?? '—'}</span>
                  <span className="text-sm font-bold truncate" style={{ color: team ? '#f5f3ff' : '#6f6796' }}>
                    {team?.name ?? 'TBD'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <span className="text-sm font-display font-extrabold gradient-text">WC&apos;26 Predictor</span>
          <span className="text-xs font-semibold" style={{ color: '#c4bdec' }}>
            {handle ? `@${handle}` : 'WC2026 Spice Bracket'}
          </span>
        </div>
      </div>
    </div>
  );
}

function SpiceBar({ spice }: { spice: SpiceResult }) {
  return (
    <div>
      <div className="h-3 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.07)' }}>
        {spice.categories.map((c) => (
          <div
            key={c.key}
            title={`${c.label}: ${c.value.toFixed(1)}`}
            style={{
              width: `${c.value}%`,
              background: SEGMENT_COLORS[c.key],
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {spice.categories
          .filter((c) => c.value >= 0.5)
          .map((c) => (
            <span key={c.key} className="text-[10px] font-medium flex items-center gap-1" style={{ color: '#c4bdec' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: SEGMENT_COLORS[c.key] }} />
              {c.label}
            </span>
          ))}
      </div>
    </div>
  );
}

const SEGMENT_COLORS: Record<string, string> = {
  champion: '#fb7185',
  finalist: '#f472b6',
  deepRuns: '#a78bfa',
  earlyExits: '#818cf8',
  groupUpsets: '#60a5fa',
};
