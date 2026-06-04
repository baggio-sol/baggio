'use client';
import Image from 'next/image';
import { usePredictionStore, deriveTree } from '@/lib/store';
import { TEAM_BY_CODE, type KnockoutMatch, type KnockoutTree } from '@/lib/tournament';
import { tierColor, cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import Link from 'next/link';

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
  if (!iso) return null;
  return (
    <Image
      src={`https://flagcdn.com/w40/${iso}.png`}
      alt={name}
      width={57}
      height={40}
      className="object-cover rounded-sm"
      unoptimized
    />
  );
}

const ROUNDS: { key: 'r32' | 'r16' | 'qf' | 'sf'; label: string }[] = [
  { key: 'r32', label: 'Round of 32' },
  { key: 'r16', label: 'Round of 16' },
  { key: 'qf', label: 'Quarter-finals' },
  { key: 'sf', label: 'Semi-finals' },
];

function TeamSlot({
  code,
  isWinner,
  picked,
  onPick,
  placeholder,
}: {
  code: string | null;
  isWinner: boolean;
  picked: boolean;
  onPick: () => void;
  placeholder: string;
}) {
  const team = code ? TEAM_BY_CODE[code] : undefined;
  return (
    <button
      disabled={!team}
      onClick={onPick}
      className={cn(
        'w-full flex items-center gap-2 px-2.5 py-1.5 text-left transition-all',
        team ? 'hover:bg-white/[0.04] cursor-pointer' : 'cursor-default',
      )}
      style={{
        background: isWinner ? 'rgba(139,92,246,0.18)' : 'transparent',
        boxShadow: team ? `inset 3px 0 0 ${tierColor(team.tier)}` : 'inset 3px 0 0 rgba(255,255,255,0.06)',
        opacity: picked && !isWinner ? 0.45 : 1,
      }}
    >
      <span className="flex-shrink-0 flex items-center" style={{ width: 57, height: 40 }}>
        {team ? <FlagImg code={team.code} name={team.name} /> : null}
      </span>
      <span
        className="flex-1 text-xs font-semibold truncate"
        style={{ color: team ? (isWinner ? '#111827' : '#6b7280') : '#6b7280' }}
      >
        {team?.name ?? placeholder}
      </span>
      {isWinner && <span className="text-[10px]">✓</span>}
    </button>
  );
}

function MatchCard({
  match,
  winner,
  onPick,
}: {
  match: KnockoutMatch;
  winner: string | undefined;
  onPick: (code: string) => void;
}) {
  const picked = Boolean(winner);
  return (
    <div
      className="rounded-lg border overflow-hidden w-[180px] divide-y"
      style={{ borderColor: 'rgba(0,0,0,0.10)', background: '#ffffff' }}
    >
      <TeamSlot
        code={match.home}
        isWinner={picked && winner === match.home}
        picked={picked}
        onPick={() => match.home && onPick(match.home)}
        placeholder="—"
      />
      <div style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
        <TeamSlot
          code={match.away}
          isWinner={picked && winner === match.away}
          picked={picked}
          onPick={() => match.away && onPick(match.away)}
          placeholder="—"
        />
      </div>
    </div>
  );
}

export default function BracketView() {
  const { bracket, setKnockoutWinner } = usePredictionStore();
  const derived = deriveTree(bracket);

  if (!derived) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          <Lock className="w-6 h-6" style={{ color: '#c4bdec' }} />
        </div>
        <p className="text-sm max-w-sm" style={{ color: '#c4bdec' }}>
          Finish the group stage first — rank all 12 groups and pick your 8 third-place
          qualifiers to unlock the knockout bracket.
        </p>
        <Link href="/predict"
          className="text-gray-900 font-bold px-6 py-3 rounded-xl text-sm" style={{ background: '#ffffff' }}>
          Go to group stage
        </Link>
      </div>
    );
  }

  const { tree, winners } = derived;
  const champion = winners['M104'];
  const finalMatch = tree.matches[tree.final];

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max">
        {ROUNDS.map(({ key, label }) => (
          <RoundColumn
            key={key}
            label={label}
            ids={tree[key]}
            tree={tree}
            winners={winners}
            onPick={setKnockoutWinner}
          />
        ))}

        {/* Final + champion */}
        <div className="flex flex-col gap-3 justify-center">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-center" style={{ color: '#c4bdec' }}>
            Final
          </h4>
          <MatchCard match={finalMatch} winner={champion} onPick={(c) => setKnockoutWinner('M104', c)} />
          <div className="rounded-xl border p-4 text-center mt-2 w-[180px]"
            style={{ background: 'rgba(251,191,36,0.10)', borderColor: 'rgba(251,191,36,0.30)' }}>
            <div className="text-2xl mb-1">🏆</div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#fbbf24' }}>
              Champion
            </p>
            {champion ? (
              <div className="flex items-center justify-center gap-1.5">
                {TEAM_BY_CODE[champion] && <FlagImg code={champion} name={TEAM_BY_CODE[champion]!.name} />}
                <p className="text-sm font-black" style={{ color: '#f5f3ff' }}>
                  {TEAM_BY_CODE[champion]?.name}
                </p>
              </div>
            ) : (
              <p className="text-xs" style={{ color: '#c4bdec' }}>Pick the final</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoundColumn({
  label,
  ids,
  tree,
  winners,
  onPick,
}: {
  label: string;
  ids: string[];
  tree: KnockoutTree;
  winners: Record<string, string>;
  onPick: (matchId: string, code: string) => void;
}) {
  const total = ids.length;
  const done = ids.filter((id) => winners[id]).length;
  return (
    <div className="flex flex-col gap-3 justify-around">
      <div className="text-center">
        <h4 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#c4bdec' }}>
          {label}
        </h4>
        <span className="text-[10px]" style={{ color: done === total ? '#8b5cf6' : '#c4bdec' }}>
          {done}/{total}
        </span>
      </div>
      <div className="flex flex-col gap-2 justify-around flex-1">
        {ids.map((id) => (
          <MatchCard
            key={id}
            match={tree.matches[id]}
            winner={winners[id]}
            onPick={(code) => onPick(id, code)}
          />
        ))}
      </div>
    </div>
  );
}
