'use client';
import Image from 'next/image';
import { TEAMS } from '@/lib/tournament';

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

function flagUrl(code: string) {
  const iso = ISO2[code];
  return iso ? `https://flagcdn.com/w40/${iso}.png` : null;
}

// 3 rings: 8 / 14 / 26
const inner  = TEAMS.filter((t) => t.tier === 1);                          // 8
const middle = TEAMS.filter((t) => t.tier === 2 || t.tier === 3).slice(0, 14); // 14
const outer  = TEAMS.filter((t) => !inner.includes(t) && !middle.includes(t));  // 26

interface FlagPillProps {
  code: string; name: string; flag: string;
  size: number; angle: number; radius: number;
  counterAnim: string; duration: number;
}

function FlagPill({ code, name, flag, size, angle, radius, counterAnim, duration }: FlagPillProps) {
  const url = flagUrl(code);
  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{ width: 0, height: 0, transform: `rotate(${angle}deg) translateY(-${radius}px)` }}
    >
      <div
        style={{
          transform: 'translate(-50%, -50%)',
          animation: `${counterAnim} ${duration}s linear infinite`,
        }}
      >
        <div
          className="rounded-full overflow-hidden flex items-center justify-center"
          style={{
            width: size, height: size,
            border: '1.5px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 4px 14px -4px rgba(0,0,0,0.5)',
          }}
        >
          {url ? (
            <Image src={url} alt={name} width={40} height={28}
              className="object-cover w-full h-full" unoptimized />
          ) : (
            <span className="text-lg leading-none">{flag}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FlagOrbit() {
  const INNER_R  = 120;
  const MID_R    = 240;
  const OUTER_R  = 360;
  const INNER_SIZE  = 54;
  const MID_SIZE    = 48;
  const OUTER_SIZE  = 42;
  const INNER_DUR   = 38;
  const MID_DUR     = 55;
  const OUTER_DUR   = 70;
  const CONTAINER   = (OUTER_R + OUTER_SIZE) * 2 + 24;

  return (
    <div
      className="relative select-none pointer-events-none mx-auto"
      style={{ width: CONTAINER, height: CONTAINER, maxWidth: '100vw' }}
      aria-hidden
    >
      {/* Inner ring — clockwise */}
      <div className="absolute inset-0" style={{ animation: `spin-cw ${INNER_DUR}s linear infinite` }}>
        {inner.map((t, i) => (
          <FlagPill key={t.code} code={t.code} name={t.name} flag={t.flag}
            size={INNER_SIZE} angle={(360 / inner.length) * i}
            radius={INNER_R} counterAnim="spin-ccw" duration={INNER_DUR} />
        ))}
      </div>

      {/* Middle ring — anti-clockwise */}
      <div className="absolute inset-0" style={{ animation: `spin-ccw ${MID_DUR}s linear infinite` }}>
        {middle.map((t, i) => (
          <FlagPill key={t.code} code={t.code} name={t.name} flag={t.flag}
            size={MID_SIZE} angle={(360 / middle.length) * i}
            radius={MID_R} counterAnim="spin-cw" duration={MID_DUR} />
        ))}
      </div>

      {/* Outer ring — clockwise */}
      <div className="absolute inset-0" style={{ animation: `spin-cw ${OUTER_DUR}s linear infinite` }}>
        {outer.map((t, i) => (
          <FlagPill key={t.code} code={t.code} name={t.name} flag={t.flag}
            size={OUTER_SIZE} angle={(360 / outer.length) * i}
            radius={OUTER_R} counterAnim="spin-ccw" duration={OUTER_DUR} />
        ))}
      </div>

      {/* Centre badge */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center rounded-full"
        style={{
          width: 84, height: 84,
          background: 'radial-gradient(circle, rgba(139,92,246,0.35), rgba(8,15,40,0.85))',
          border: '1px solid rgba(139,92,246,0.35)',
          boxShadow: '0 0 36px rgba(139,92,246,0.28)',
        }}
      >
        <span className="text-2xl">⚽</span>
        <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#c4bdec' }}>2026</span>
      </div>
    </div>
  );
}
