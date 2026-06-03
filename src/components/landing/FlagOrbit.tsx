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
  if (!iso) return null;
  return `https://flagcdn.com/w40/${iso}.png`;
}

// Inner ring: tier-1 teams (the 8 elite + 4 co-hosts that are tier 1)
// Outer ring: everyone else
const tier1 = TEAMS.filter((t) => t.tier === 1);
const rest = TEAMS.filter((t) => t.tier !== 1);

interface FlagPillProps {
  code: string;
  name: string;
  size: number;
  index: number;
  total: number;
  radius: number;
  /** counter-rotate each pill so text always faces up */
  counterRotate?: boolean;
}

function FlagPill({ code, name, size, index, total, radius, counterRotate }: FlagPillProps) {
  const angle = (360 / total) * index;
  const url = flagUrl(code);

  return (
    <div
      className="absolute flex flex-col items-center gap-1"
      style={{
        width: size,
        left: '50%',
        top: '50%',
        marginLeft: -size / 2,
        marginTop: -size / 2,
        transformOrigin: `${size / 2}px ${size / 2 + radius}px`,
        transform: `rotate(${angle}deg) translateY(-${radius}px)`,
      }}
    >
      <div
        style={{
          transform: counterRotate ? `rotate(-${angle}deg)` : undefined,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
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
            <span className="text-lg">{TEAMS.find((t) => t.code === code)?.flag}</span>
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
  const CONTAINER = (OUTER_R + OUTER_SIZE) * 2 + 20;

  return (
    <div
      className="relative select-none pointer-events-none"
      style={{ width: CONTAINER, height: CONTAINER, maxWidth: '100%' }}
      aria-hidden
    >
      {/* Glow rings */}
      <div
        className="absolute rounded-full"
        style={{
          inset: (CONTAINER / 2 - INNER_R - INNER_SIZE / 2 - 8),
          width: (INNER_R + INNER_SIZE / 2 + 8) * 2,
          height: (INNER_R + INNER_SIZE / 2 + 8) * 2,
          border: '1px solid rgba(139,92,246,0.25)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: (OUTER_R + OUTER_SIZE / 2 + 8) * 2,
          height: (OUTER_R + OUTER_SIZE / 2 + 8) * 2,
          border: '1px solid rgba(59,130,246,0.20)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)',
        }}
      />

      {/* Inner ring — clockwise */}
      <div
        className="absolute inset-0"
        style={{ animation: 'spin-cw 40s linear infinite' }}
      >
        {tier1.map((t, i) => (
          <FlagPill
            key={t.code}
            code={t.code}
            name={t.name}
            size={INNER_SIZE}
            index={i}
            total={tier1.length}
            radius={INNER_R}
            counterRotate
          />
        ))}
      </div>

      {/* Outer ring — anti-clockwise */}
      <div
        className="absolute inset-0"
        style={{ animation: 'spin-ccw 60s linear infinite' }}
      >
        {rest.map((t, i) => (
          <FlagPill
            key={t.code}
            code={t.code}
            name={t.name}
            size={OUTER_SIZE}
            index={i}
            total={rest.length}
            radius={OUTER_R}
            counterRotate
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
        <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#c4bdec' }}>2026</span>
      </div>
    </div>
  );
}
