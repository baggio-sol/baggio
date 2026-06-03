'use client';
import Image from 'next/image';
import { TEAMS } from '@/lib/tournament';

// Map our 3-letter FIFA codes → ISO 3166-1 alpha-2 for flagcdn.com
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

// Inner ring: tier-1 teams · Outer ring: everyone else
const tier1 = TEAMS.filter((t) => t.tier === 1);
const rest = TEAMS.filter((t) => t.tier !== 1);

interface FlagPillProps {
  code: string;
  name: string;
  flag: string;
  size: number;
  angle: number;
  radius: number;
  /** keyframe name used to counter-rotate so the flag stays upright */
  counterAnim: string;
  duration: number;
}

function FlagPill({ code, name, flag, size, angle, radius, counterAnim, duration }: FlagPillProps) {
  const url = flagUrl(code);

  return (
    // Outer wrapper: a full-size, centred box rotated to `angle`, with the pill
    // pushed out to `radius`. The parent ring spins this whole thing around.
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        width: 0,
        height: 0,
        transform: `rotate(${angle}deg) translateY(-${radius}px)`,
      }}
    >
      {/* Counter-rotate (animated, opposite the ring) so flags stay upright. */}
      <div
        style={{
          transform: 'translate(-50%, -50%)',
          animation: `${counterAnim} ${duration}s linear infinite`,
        }}
      >
        <div
          className="rounded-full overflow-hidden border-2 flex items-center justify-center"
          style={{
            width: size,
            height: size,
            borderColor: 'rgba(255,255,255,0.20)',
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 4px 14px -4px rgba(0,0,0,0.5)',
          }}
        >
          {url ? (
            <Image
              src={url}
              alt={name}
              width={40}
              height={28}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <span className="text-lg leading-none">{flag}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FlagOrbit() {
  const INNER_R = 130;
  const OUTER_R = 240;
  const INNER_SIZE = 44;
  const OUTER_SIZE = 36;
  const INNER_DUR = 40; // seconds per revolution
  const OUTER_DUR = 60;
  const CONTAINER = (OUTER_R + OUTER_SIZE) * 2 + 20;

  return (
    <div
      className="relative select-none pointer-events-none"
      style={{ width: CONTAINER, height: CONTAINER, maxWidth: '100%' }}
      aria-hidden
    >
      {/* Glow rings (static guide circles) */}
      <div
        className="absolute rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: INNER_R * 2,
          height: INNER_R * 2,
          border: '1px solid rgba(139,92,246,0.22)',
        }}
      />
      <div
        className="absolute rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: OUTER_R * 2,
          height: OUTER_R * 2,
          border: '1px solid rgba(59,130,246,0.18)',
        }}
      />

      {/* Inner ring — clockwise */}
      <div
        className="absolute inset-0"
        style={{ animation: `spin-cw ${INNER_DUR}s linear infinite` }}
      >
        {tier1.map((t, i) => (
          <FlagPill
            key={t.code}
            code={t.code}
            name={t.name}
            flag={t.flag}
            size={INNER_SIZE}
            angle={(360 / tier1.length) * i}
            radius={INNER_R}
            counterAnim="spin-ccw"
            duration={INNER_DUR}
          />
        ))}
      </div>

      {/* Outer ring — anti-clockwise */}
      <div
        className="absolute inset-0"
        style={{ animation: `spin-ccw ${OUTER_DUR}s linear infinite` }}
      >
        {rest.map((t, i) => (
          <FlagPill
            key={t.code}
            code={t.code}
            name={t.name}
            flag={t.flag}
            size={OUTER_SIZE}
            angle={(360 / rest.length) * i}
            radius={OUTER_R}
            counterAnim="spin-cw"
            duration={OUTER_DUR}
          />
        ))}
      </div>

      {/* Centre badge */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center rounded-full border"
        style={{
          width: 80,
          height: 80,
          background: 'radial-gradient(circle, rgba(139,92,246,0.30), rgba(8,15,40,0.80))',
          borderColor: 'rgba(139,92,246,0.40)',
          boxShadow: '0 0 30px rgba(139,92,246,0.30)',
        }}
      >
        <span className="text-2xl">⚽</span>
        <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#c4bdec' }}>
          2026
        </span>
      </div>
    </div>
  );
}
