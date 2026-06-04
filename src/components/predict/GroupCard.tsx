'use client';
import Image from 'next/image';
import { Team, GroupId } from '@/lib/types';
import { usePredictionStore, groupComplete } from '@/lib/store';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

// Same ISO-2 map used in FlagOrbit
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

// Position chip styling
const POS = [
  { label: '1st', bg: 'rgba(52,211,153,0.18)', color: '#34d399', border: 'rgba(52,211,153,0.35)' },
  { label: '2nd', bg: 'rgba(52,211,153,0.12)', color: '#6ee7b7', border: 'rgba(52,211,153,0.25)' },
  { label: '3rd', bg: 'rgba(251,146,60,0.15)', color: '#fb923c', border: 'rgba(251,146,60,0.35)' },
  { label: '4th', bg: 'rgba(255,255,255,0.05)', color: '#6f6796', border: 'rgba(255,255,255,0.10)' },
];

interface GroupCardProps {
  groupId: GroupId;
  teams: Team[];
  onComplete?: () => void;
}

export default function GroupCard({ groupId, teams, onComplete }: GroupCardProps) {
  const { bracket, setRanking, clearGroup } = usePredictionStore();
  const picks = bracket?.groupPredictions[groupId] ?? ['', '', '', ''];
  const order = picks.filter(Boolean);
  const complete = groupComplete(bracket, groupId);

  const rankOf = (code: string) => order.indexOf(code);

  const handleTap = (code: string) => {
    let next: string[];
    if (order.includes(code)) {
      next = order.filter((c) => c !== code);
    } else if (order.length < 4) {
      next = [...order, code];
    } else {
      return;
    }
    const padded = [...next, '', '', '', ''].slice(0, 4) as [string, string, string, string];
    setRanking(groupId, padded);
    if (next.length === 4) onComplete?.();
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: `1px solid ${complete ? 'rgba(139,92,246,0.45)' : 'rgba(255,255,255,0.10)'}`,
      }}
    >
      {/* Card header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-extrabold text-base"
            style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', color: '#fff' }}
          >
            {groupId}
          </div>
          <div>
            <h2 className="font-display font-extrabold text-base leading-tight" style={{ color: '#f5f3ff' }}>
              Group {groupId}
            </h2>
            <p className="text-[11px]" style={{ color: '#6f6796' }}>
              {complete ? 'Complete' : `Tap to rank · ${order.length}/4`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {complete && <CheckCircle2 className="w-5 h-5" style={{ color: '#a78bfa' }} />}
          {order.length > 0 && (
            <button
              onClick={() => clearGroup(groupId)}
              className="text-[11px] font-semibold px-3 py-1 rounded-full border transition-all hover:opacity-80"
              style={{ color: '#6f6796', borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Position chips */}
      {order.length > 0 && (
        <div className="px-5 pt-3 pb-1 flex items-center gap-2">
          {order.map((code, i) => {
            const team = teams.find((t) => t.code === code);
            return (
              <div
                key={code}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border"
                style={{ background: POS[i].bg, color: POS[i].color, borderColor: POS[i].border }}
              >
                <FlagImg code={code} name={team?.name ?? ''} size={14} />
                {POS[i].label}
              </div>
            );
          })}
          {order.length === 2 && (
            <span className="text-[11px] font-medium" style={{ color: '#6f6796' }}>· Advance</span>
          )}
        </div>
      )}

      {/* Team rows */}
      <div className="p-3 flex flex-col gap-2">
        {teams.map((t) => {
          const rank = rankOf(t.code);
          const ranked = rank >= 0;
          const pos = POS[rank] ?? POS[3];

          return (
            <button
              key={t.code}
              onClick={() => handleTap(t.code)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all active:scale-[0.99]',
              )}
              style={{
                background: ranked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${ranked ? pos.border : 'rgba(255,255,255,0.07)'}`,
                boxShadow: ranked ? `inset 3px 0 0 ${pos.color}` : 'none',
              }}
            >
              {/* Position badge */}
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 border"
                style={{
                  background: ranked ? pos.bg : 'rgba(255,255,255,0.04)',
                  color: ranked ? pos.color : '#3a3358',
                  borderColor: ranked ? pos.border : 'rgba(255,255,255,0.06)',
                }}
              >
                {ranked ? rank + 1 : '·'}
              </span>

              {/* Flag image */}
              <div className="w-8 h-6 rounded-sm overflow-hidden flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <FlagImg code={t.code} name={t.name} size={32} />
              </div>

              {/* Name */}
              <span
                className="flex-1 min-w-0 text-sm font-semibold truncate"
                style={{ color: ranked ? '#f5f3ff' : '#c4bdec' }}
              >
                {t.name}
              </span>

              {/* FIFA ranking */}
              {t.rank && (
                <span className="text-xs font-bold tabular-nums flex-shrink-0" style={{ color: '#6f6796' }}>
                  #{t.rank}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
