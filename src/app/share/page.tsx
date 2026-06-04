import { Metadata } from 'next';
import Link from 'next/link';

// Team names for display (subset — enough for the share page)
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

type Props = { searchParams: Promise<Record<string, string>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const score    = params.score    ?? '0';
  const persona  = params.persona  ?? 'Chalk Merchant';
  const emoji    = params.emoji    ?? '📊';
  const champion = params.champion ?? '';
  const name     = params.name     ?? '';

  const champName = TEAM_NAMES[champion] ?? champion;
  const title = name
    ? `${name}'s WC'26 Bracket — ${emoji} ${persona} (${score}/100)`
    : `${emoji} ${persona} — WC'26 Predictor (${score}/100)`;
  const description = champName
    ? `${champion ? `Picking ${champName} to win the 2026 World Cup.` : ''} Spice Score: ${score}/100.`
    : `A World Cup 2026 bracket prediction. Spice Score: ${score}/100.`;

  const ogImageUrl = new URL('/api/og', 'https://wcpredictor.fun');
  for (const [k, v] of Object.entries(params)) {
    ogImageUrl.searchParams.set(k, v);
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImageUrl.toString(), width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl.toString()],
    },
  };
}

export default async function SharePage({ searchParams }: Props) {
  const params = await searchParams;
  const score    = params.score    ?? '0';
  const persona  = params.persona  ?? 'Chalk Merchant';
  const emoji    = params.emoji    ?? '📊';
  const champion = params.champion ?? '';
  const name     = params.name     ?? '';

  const champName = TEAM_NAMES[champion] ?? champion;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#c4bdec' }}>
        WC&apos;26 Predictor
      </p>
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl mb-2" style={{ color: '#f5f3ff' }}>
        {emoji} {persona}
      </h1>
      {name && (
        <p className="text-base mb-1" style={{ color: '#c4bdec' }}>{name}&apos;s bracket</p>
      )}
      <p className="text-5xl font-display font-extrabold mb-1" style={{ color: '#ffffff' }}>
        {score}<span className="text-2xl" style={{ color: '#c4bdec' }}>/100</span>
      </p>
      <p className="text-sm mb-2" style={{ color: '#c4bdec' }}>Spice Score</p>
      {champName && (
        <p className="text-base mt-2" style={{ color: '#f5f3ff' }}>
          🏆 Picking <strong>{champName}</strong> to win the 2026 World Cup
        </p>
      )}

      <div className="mt-10 flex flex-wrap gap-3 justify-center">
        <Link
          href="/predict"
          className="rounded-2xl px-8 py-3.5 font-display font-extrabold text-base transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', color: '#fff' }}
        >
          Build my bracket →
        </Link>
        <Link
          href="/"
          className="rounded-2xl px-8 py-3.5 font-display font-extrabold text-base border transition-all hover:scale-105"
          style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#c4bdec' }}
        >
          Learn more
        </Link>
      </div>
    </div>
  );
}
