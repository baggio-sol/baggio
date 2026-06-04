import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

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

const TEAM_NAMES: Record<string, string> = {
  MEX: 'Mexico', RSA: 'South Africa', KOR: 'South Korea', CZE: 'Czech Republic',
  CAN: 'Canada', BIH: 'Bosnia & Herz.', QAT: 'Qatar', SUI: 'Switzerland',
  BRA: 'Brazil', MAR: 'Morocco', HAI: 'Haiti', SCO: 'Scotland',
  USA: 'USA', PAR: 'Paraguay', AUS: 'Australia', TUR: 'Turkey',
  GER: 'Germany', CUW: 'Curaçao', CIV: 'Ivory Coast', ECU: 'Ecuador',
  NED: 'Netherlands', JPN: 'Japan', SWE: 'Sweden', TUN: 'Tunisia',
  BEL: 'Belgium', EGY: 'Egypt', IRN: 'Iran', NZL: 'New Zealand',
  ESP: 'Spain', CPV: 'Cape Verde', KSA: 'Saudi Arabia', URU: 'Uruguay',
  FRA: 'France', SEN: 'Senegal', IRQ: 'Iraq', NOR: 'Norway',
  ARG: 'Argentina', ALG: 'Algeria', AUT: 'Austria', JOR: 'Jordan',
  POR: 'Portugal', COD: 'DR Congo', UZB: 'Uzbekistan', COL: 'Colombia',
  ENG: 'England', CRO: 'Croatia', GHA: 'Ghana', PAN: 'Panama',
};

function flagUrl(code: string) {
  const iso = ISO2[code];
  if (!iso) return null;
  return `https://flagcdn.com/w80/${iso}.png`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const score      = searchParams.get('score')      ?? '0';
  const persona    = searchParams.get('persona')     ?? 'Chalk Merchant';
  const emoji      = searchParams.get('emoji')       ?? '📊';
  const boldest    = searchParams.get('boldest')     ?? '';
  const champion   = searchParams.get('champion')    ?? '';
  const runnerUp   = searchParams.get('runnerUp')    ?? '';
  const darkHorse  = searchParams.get('darkHorse')   ?? '';
  const earlyExit  = searchParams.get('earlyExit')   ?? '';
  const name       = searchParams.get('name')        ?? '';

  const champFlag  = champion  ? flagUrl(champion)  : null;
  const ruFlag     = runnerUp  ? flagUrl(runnerUp)   : null;
  const dhFlag     = darkHorse ? flagUrl(darkHorse)  : null;
  const eeFlag     = earlyExit ? flagUrl(earlyExit)  : null;

  const scoreNum = Math.min(100, Math.max(0, parseInt(score, 10) || 0));
  // Bar fills as percentage of 1200px wide bar
  const barW = Math.round((scoreNum / 100) * 560);

  const picks = [
    { label: '🏆 Champion',    code: champion,  flagSrc: champFlag },
    { label: '🥈 Runner-up',   code: runnerUp,  flagSrc: ruFlag },
    { label: '🐎 Dark horse',  code: darkHorse, flagSrc: dhFlag },
    { label: '💀 Crashes out', code: earlyExit, flagSrc: eeFlag },
  ].filter(p => p.code);

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(160deg,#1a0d36 0%,#120931 50%,#080f28 100%)',
          padding: '56px 72px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Purple glow top-right */}
        <div style={{
          position: 'absolute', top: -120, right: -120,
          width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)',
          display: 'flex',
        }} />
        {/* Blue glow bottom-left */}
        <div style={{
          position: 'absolute', bottom: -100, left: -100,
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.28) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Top row: branding + name */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 18 }}>⚽</span>
            </div>
            <span style={{ color: '#c4bdec', fontSize: 18, fontWeight: 700, letterSpacing: '0.05em' }}>
              WC&apos;26 PREDICTOR
            </span>
          </div>
          {name && (
            <span style={{ color: '#c4bdec', fontSize: 18, fontWeight: 600 }}>
              {name}
            </span>
          )}
        </div>

        {/* Main content: left=score, right=picks */}
        <div style={{ display: 'flex', flex: 1, gap: 64, alignItems: 'flex-start' }}>

          {/* Left: persona + score */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: '0 0 480px' }}>
            <div style={{ color: '#c4bdec', fontSize: 14, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
              CERTIFIED
            </div>
            <div style={{ color: '#ffffff', fontSize: 52, fontWeight: 900, lineHeight: 1.1, marginBottom: 6 }}>
              {emoji} {persona}
            </div>
            {boldest && (
              <div style={{
                marginTop: 20,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 16,
                padding: '14px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}>
                <div style={{ color: '#ffffff', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  BOLDEST CALL
                </div>
                <div style={{ color: '#f5f3ff', fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>
                  {boldest}
                </div>
              </div>
            )}

            {/* Score */}
            <div style={{ marginTop: 'auto', paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ color: '#ffffff', fontSize: 80, fontWeight: 900, lineHeight: 1 }}>
                  {scoreNum}
                </span>
                <span style={{ color: '#c4bdec', fontSize: 20, fontWeight: 700 }}>/100 SPICE</span>
              </div>
              {/* Score bar */}
              <div style={{
                width: 560, height: 8, borderRadius: 99,
                background: 'rgba(255,255,255,0.12)',
                display: 'flex',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: barW,
                  height: 8,
                  borderRadius: 99,
                  background: 'linear-gradient(90deg,#8b5cf6,#3b82f6)',
                  display: 'flex',
                }} />
              </div>
            </div>
          </div>

          {/* Right: key picks */}
          {picks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 12, paddingTop: 4 }}>
              {picks.map(({ label, code, flagSrc }) => (
                <div key={code} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 14,
                  padding: '12px 16px',
                }}>
                  {flagSrc && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={flagSrc}
                      width={48}
                      height={34}
                      style={{ borderRadius: 4, objectFit: 'cover' }}
                      alt=""
                    />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ color: '#c4bdec', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      {label}
                    </span>
                    <span style={{ color: '#f5f3ff', fontSize: 20, fontWeight: 800 }}>
                      {TEAM_NAMES[code] ?? code}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
