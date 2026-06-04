'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { usePredictionStore, deriveTree } from '@/lib/store';
import { TEAM_BY_CODE } from '@/lib/tournament';
import type { KnockoutTree, KnockoutRound } from '@/lib/tournament';
import type { Bracket, GroupId } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, Info, Trophy, Share2 } from 'lucide-react';
import ShareModal from './ShareModal';

// ISO-2 map for flagcdn.com (shared shape with GroupCard / ThirdPlaceSelector)
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

function FlagImg({ code, name, size = 32 }: { code: string; name: string; size?: number }) {
  const iso = ISO2[code];
  if (!iso) return null;
  return (
    <Image
      src={`https://flagcdn.com/w40/${iso}.png`}
      alt={name}
      width={size}
      height={Math.round(size * 0.7)}
      className="object-cover rounded-sm"
      unoptimized
    />
  );
}

type RoundKey = KnockoutRound;

const ROUNDS: { key: RoundKey; short: string; name: string; total: number; nextName: string | null }[] = [
  { key: 'r32',   short: 'R32',   name: 'Round of 32',     total: 16, nextName: 'Round of 16' },
  { key: 'r16',   short: 'R16',   name: 'Round of 16',     total: 8,  nextName: 'the Quarter-finals' },
  { key: 'qf',    short: 'QF',    name: 'Quarter-finals',  total: 4,  nextName: 'the Semi-finals' },
  { key: 'sf',    short: 'SF',    name: 'Semi-finals',     total: 2,  nextName: 'the Final' },
  { key: 'final', short: 'Final', name: 'Final',           total: 1,  nextName: null },
];

/** Position label for a resolved team, e.g. '1E' (winner group E), '3C' (3rd of C). */
function standingLabel(code: string | null, standings: Bracket['groupPredictions']): string {
  if (!code) return '';
  const t = TEAM_BY_CODE[code];
  if (!t) return '';
  const g = t.group as GroupId;
  const pos = standings[g].indexOf(code);
  return pos >= 0 ? `${pos + 1}${g}` : '';
}

function matchIdsForRound(tree: KnockoutTree, key: RoundKey): string[] {
  if (key === 'final') return [tree.final];
  return tree[key];
}

const ROUND_ORDER: RoundKey[] = ['r32', 'r16', 'qf', 'sf', 'final'];

export default function KnockoutBracket() {
  const { bracket, setKnockoutWinner } = usePredictionStore();
  const [round, setRound] = useState<RoundKey>('r32');
  const [shareOpen, setShareOpen] = useState(false);

  const derived = useMemo(() => deriveTree(bracket), [bracket]);

  if (!bracket || !derived) {
    return (
      <p className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff' }}>
        Finish your groups and best-3rd picks to unlock the knockout bracket.
      </p>
    );
  }

  const { tree, winners } = derived;
  const standings = bracket.groupPredictions;

  const pickedInRound = (key: RoundKey) =>
    matchIdsForRound(tree, key).filter((id) => winners[id]).length;

  const active = ROUNDS.find((r) => r.key === round)!;
  const matchIds = matchIdsForRound(tree, round);
  const pickedHere = pickedInRound(round);
  const champion = winners[tree.final] ?? null;

  return (
    <div>
      {/* ── Round tab strip ───────────────────────────────────────────── */}
      <div className="flex gap-1.5 mb-4">
        {ROUNDS.map((r) => {
          const isActive = r.key === round;
          const picked = pickedInRound(r.key);
          return (
            <button
              key={r.key}
              onClick={() => setRound(r.key)}
              className="flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition-all"
              style={{
                background: isActive ? 'linear-gradient(135deg,#8b5cf6,#3b82f6)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isActive ? 'transparent' : 'rgba(0,0,0,0.08)'}`,
              }}
            >
              <span
                className="font-display font-extrabold text-sm leading-none"
                style={{ color: isActive ? '#fff' : '#c4bdec' }}
              >
                {r.short}
              </span>
              <span
                className="text-[10px] font-bold mt-1 tabular-nums"
                style={{ color: isActive ? 'rgba(255,255,255,0.85)' : '#c4bdec' }}
              >
                {picked}/{r.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Round header + segmented progress ─────────────────────────── */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="font-display font-extrabold text-lg" style={{ color: '#f5f3ff' }}>
            {active.name}
          </h2>
          <span className="text-xs font-bold" style={{ color: '#c4bdec' }}>
            {pickedHere} of {active.total} picked
          </span>
        </div>
        <div className="flex gap-1">
          {matchIds.map((id, i) => (
            <div
              key={id}
              className="flex-1 h-1.5 rounded-full transition-all"
              style={{
                background: winners[id]
                  ? 'linear-gradient(90deg,#8b5cf6,#3b82f6)'
                  : 'rgba(255,255,255,0.08)',
              }}
              data-i={i}
            />
          ))}
        </div>
      </div>

      {/* ── Match cards ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {matchIds.map((id) => {
          const m = tree.matches[id];
          const winner = winners[id] ?? null;
          const bothKnown = !!m.home && !!m.away;
          const picked = !!winner;

          return (
            <div
              key={id}
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                background: '#ffffff',
                border: `1px solid ${
                  picked
                    ? 'rgba(139,92,246,0.40)'
                    : bothKnown
                    ? 'rgba(255,255,255,0.15)'
                    : 'rgba(0,0,0,0.08)'
                }`,
              }}
            >
              {(['home', 'away'] as const).map((slot, idx) => {
                const code = m[slot];
                const team = code ? TEAM_BY_CODE[code] : undefined;
                const isWinner = !!code && winner === code;
                const isLoser = picked && !isWinner;
                const label = standingLabel(code, standings);

                return (
                  <button
                    key={slot}
                    disabled={!bothKnown || !code}
                    onClick={() => {
                      if (!code) return;
                      // Check if this is the last unpicked match in the round
                      const remainingInRound = matchIds.filter((mid) => !winners[mid] && mid !== id).length;
                      setKnockoutWinner(id, code);
                      if (remainingInRound === 0) {
                        const nextIdx = ROUND_ORDER.indexOf(round) + 1;
                        if (nextIdx < ROUND_ORDER.length) setRound(ROUND_ORDER[nextIdx]);
                      }
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all',
                      idx === 0 && 'border-b',
                      bothKnown && code && 'active:scale-[0.995]',
                      (!bothKnown || !code) && 'cursor-default',
                    )}
                    style={{
                      borderColor: 'rgba(0,0,0,0.06)',
                      background: isWinner ? 'rgba(139,92,246,0.16)' : 'transparent',
                      opacity: isLoser ? 0.45 : 1,
                    }}
                  >
                    {/* Standing label */}
                    <span
                      className="w-8 text-xs font-bold tabular-nums flex-shrink-0"
                      style={{ color: isWinner ? '#a78bfa' : '#6b7280' }}
                    >
                      {label || '—'}
                    </span>

                    {/* Flag */}
                    <div
                      className="rounded overflow-hidden flex items-center justify-center flex-shrink-0"
                      style={{ width: 57, height: 40, background: 'rgba(0,0,0,0.06)' }}
                    >
                      {team ? <FlagImg code={code!} name={team.name} size={57} /> : null}
                    </div>

                    {/* Name */}
                    <span
                      className="flex-1 min-w-0 text-sm font-bold truncate"
                      style={{ color: team ? '#111827' : '#6b7280' }}
                    >
                      {team?.name ?? `Winner of ${m[slot === 'home' ? 'homeSource' : 'awaySource'].replace('W:', '')}`}
                    </span>

                    {/* Winner check or rank */}
                    {isWinner ? (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    ) : team?.rank ? (
                      <span className="text-xs font-bold tabular-nums flex-shrink-0" style={{ color: '#6b7280' }}>
                        #{team.rank}
                      </span>
                    ) : (
                      <span className="w-5 flex-shrink-0" />
                    )}
                  </button>
                );
              })}

              {/* Footer */}
              <div
                className="px-4 py-2 flex items-center gap-1.5"
                style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
              >
                {round === 'final' ? (
                  <>
                    <Trophy className="w-3.5 h-3.5" style={{ color: winner ? '#ffffff' : '#6b7280' }} />
                    <span className="text-[11px] font-semibold" style={{ color: winner ? '#ffffff' : '#6b7280' }}>
                      {winner ? `${TEAM_BY_CODE[winner]?.name} are your champions` : 'Pick your World Cup champion'}
                    </span>
                  </>
                ) : (
                  <>
                    <Info className="w-3.5 h-3.5" style={{ color: '#6b7280' }} />
<span className="text-[11px] font-medium" style={{ color: '#6b7280' }}>
                      {winner
                        ? `${TEAM_BY_CODE[winner]?.name} advance to ${active.nextName}`
                        : bothKnown
                        ? `Winner advances to ${active.nextName}`
                        : 'Waiting on earlier results'}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Confirm & share (appears once a champion is crowned) ───────── */}
      {champion && (
        <button
          onClick={() => setShareOpen(true)}
          className="w-full mt-5 flex items-center justify-center gap-2 rounded-2xl py-4 font-display font-extrabold text-white transition-all hover:scale-[1.02] active:scale-95"
          style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' }}
        >
          <Share2 className="w-5 h-5" />
          Confirm bracket &amp; share
        </button>
      )}

      {shareOpen && <ShareModal onClose={() => setShareOpen(false)} />}
    </div>
  );
}
