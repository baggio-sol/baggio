'use client';
import { useState } from 'react';
import Image from 'next/image';
import { usePredictionStore, thirdPlacedCodes } from '@/lib/store';
import { TEAM_BY_CODE, GROUP_IDS } from '@/lib/tournament';
import { cn } from '@/lib/utils';
import { Check, HelpCircle } from 'lucide-react';

// ISO-2 map for flagcdn.com (shared shape with FlagOrbit / GroupCard)
const ISO2: Record<string, string> = {
  MEX: 'mx', RSA: 'za', KOR: 'kr', CZE: 'cz',
  CAN: 'ca', BIH: 'ba', QAT: 'qa', SUI: 'ch',
  BRA: 'br', MAR: 'ma', HAI: 'ht', SCO: 'gb-sct',
  USA: 'us', PAR: 'py', AUS: 'au', TUR: 'tr',
  GER: 'de', CUW: 'cw', CIV: 'ci', ECU: 'ec',
  NED: 'nl', JPN: 'jp', SWE: 'se', TUN: 'tn',
  BEL: 'be', EGY: 'eg', IRN: 'ir', NZL: 'nz',
  ESP: 'es', CPV: 'cv', KSA: 'sa', URU: 'uy',
  FRA: 'fr', SEN: 'sn', IRQ: 'iq', NOR: 'no',
  ARG: 'ar', ALG: 'dz', AUT: 'at', JOR: 'jo',
  POR: 'pt', COD: 'cd', UZB: 'uz', COL: 'co',
  ENG: 'gb-eng', CRO: 'hr', GHA: 'gh', PAN: 'pa',
};

function FlagImg({ code, name }: { code: string; name: string }) {
  const iso = ISO2[code];
  if (!iso) return <span className="text-2xl">{TEAM_BY_CODE[code]?.flag}</span>;
  return (
    <Image
      src={`https://flagcdn.com/w80/${iso}.png`}
      alt={name}
      width={56}
      height={40}
      className="object-cover rounded-md"
      unoptimized
    />
  );
}

/**
 * Pick which 8 of the 12 third-placed teams advance. The candidates are
 * exactly the team each group is currently predicting in 3rd — so this
 * section is fully driven by the user's group-stage standings.
 */
export default function ThirdPlaceSelector({ onComplete }: { onComplete?: () => void }) {
  const { bracket, toggleThird } = usePredictionStore();
  const [showHelp, setShowHelp] = useState(true);

  const rows = GROUP_IDS.map((g) => ({ group: g, code: bracket?.groupPredictions[g][2] ?? '' }));
  const eligibleCount = bracket ? thirdPlacedCodes(bracket).length : 0;
  const selected = bracket?.thirdPlaceQualifiers ?? [];
  const atCap = selected.length >= 8;

  const handleToggle = (code: string) => {
    const wasSelected = selected.includes(code);
    toggleThird(code);
    if (!wasSelected && selected.length === 7) onComplete?.();
  };

  return (
    <div>
      {/* Explainer card */}
      {showHelp && (
        <div
          className="rounded-2xl p-5 mb-4"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-display font-extrabold text-lg" style={{ color: '#f5f3ff' }}>
              Pick 8 of 12 third-place teams
            </h3>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(167,139,250,0.20)' }}
            >
              <HelpCircle className="w-4 h-4" style={{ color: '#a78bfa' }} />
            </div>
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#c4bdec' }}>
            The 2026 World Cup is the first with 48 teams in 12 groups. The top 2 in each
            group advance automatically (24 teams), and the 8 best third-place teams (out of
            12) join them to fill the Round of 32. Pick which 8 third-place finishers you
            think will advance — they&apos;ll be slotted into your knockout bracket.
          </p>
          <button
            onClick={() => setShowHelp(false)}
            className="rounded-xl px-4 py-2 text-sm font-bold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', color: '#fff' }}
          >
            Got it, thanks
          </button>
        </div>
      )}

      {/* Gate message if groups not all ranked */}
      {eligibleCount < 12 && (
        <p
          className="text-sm mb-4 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(251,113,133,0.12)', color: '#fb7185' }}
        >
          Finish ranking your groups first — {12 - eligibleCount} group
          {12 - eligibleCount > 1 ? 's' : ''} still {12 - eligibleCount > 1 ? 'need' : 'needs'} a 3rd-placed team.
        </p>
      )}

      {/* Flag grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {rows.map(({ group, code }) => {
          const team = code ? TEAM_BY_CODE[code] : undefined;
          const isSelected = code !== '' && selected.includes(code);
          const disabled = !team || (!isSelected && atCap);

          return (
            <button
              key={group}
              disabled={!team || disabled}
              onClick={() => team && handleToggle(code)}
              className={cn(
                'relative flex flex-col items-center gap-2 rounded-2xl px-3 py-4 transition-all active:scale-[0.98]',
                (!team || disabled) && 'opacity-50 cursor-not-allowed',
              )}
              style={{
                background: isSelected ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${isSelected ? 'rgba(139,92,246,0.55)' : 'rgba(255,255,255,0.10)'}`,
              }}
            >
              {/* Selected check */}
              {isSelected && (
                <span
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' }}
                >
                  <Check className="w-3 h-3 text-white" />
                </span>
              )}

              {/* Flag */}
              <div className="w-14 h-10 rounded-md overflow-hidden flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                {team ? <FlagImg code={code} name={team.name} /> : <span className="text-xl">🏳️</span>}
              </div>

              {/* Name */}
              <span className="text-sm font-bold text-center leading-tight truncate w-full" style={{ color: team ? '#f5f3ff' : '#6f6796' }}>
                {team?.name ?? 'Unranked'}
              </span>

              {/* Group + rank */}
              <span className="text-[11px] font-medium" style={{ color: '#6f6796' }}>
                Grp {group}{team?.rank ? ` · #${team.rank}` : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
