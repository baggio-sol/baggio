import Link from 'next/link';
import Card from '@/components/ui/Card';

const FEATURES = [
  {
    icon: '🏆',
    title: 'Full Depth Predictions',
    desc: '12 groups → R32 → Final. Predict every stage of the expanded 48-team tournament.',
  },
  {
    icon: '🌶️',
    title: 'Spice Score',
    desc: 'Get your 0–100 contrarian rating plus a persona that reveals exactly how bold your picks are.',
  },
  {
    icon: '📣',
    title: 'Viral Share Card',
    desc: 'Your Spice Score ships as an X-unfurlable rich preview card. Drop it. Watch the timeline react.',
  },
];

const PERSONAS = [
  { label: 'Chalk Merchant', tier: 1, color: '#60a5fa' },
  { label: 'The Realist', tier: 2, color: '#818cf8' },
  { label: 'Calculated Gambler', tier: 3, color: '#a78bfa' },
  { label: 'Chaos Agent', tier: 4, color: '#f472b6' },
  { label: 'Certified Menace', tier: 5, color: '#fb7185' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-40 text-center">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="font-display text-5xl md:text-7xl leading-none tracking-tight mb-6"
            style={{ color: '#f5f3ff' }}
          >
            Your Bracket.<br />
            <span className="gradient-text">Your Identity.</span>
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: '#c4bdec' }}
          >
            Predict the WC2026 bracket and get your{' '}
            <span className="spice-glow font-bold" style={{ color: '#fb7185' }}>Spice Score</span>
            {' '}— a contrarian rating + persona that tells the world exactly who you are as a football fan.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/predict"
              className="inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-bold text-white transition-opacity hover:opacity-90 active:scale-95"
              style={{ background: '#fb7185' }}
            >
              Build Your Bracket
            </Link>
            <Link
              href="/bracket"
              className="glass inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-bold transition-all hover:bg-white/10 active:scale-95"
              style={{ color: '#f5f3ff' }}
            >
              See an Example
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <Card
              key={f.title}
              glow={(['purple', 'blue', 'spice'] as const)[i]}
              className="p-7 flex flex-col gap-4"
            >
              <div className="text-4xl">{f.icon}</div>
              <h3
                className="font-display text-lg font-bold"
                style={{ color: '#f5f3ff' }}
              >
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#c4bdec' }}>
                {f.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Persona showcase */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          className="font-display text-2xl md:text-3xl font-bold mb-3"
          style={{ color: '#f5f3ff' }}
        >
          Which persona will you get?
        </h2>
        <p className="text-sm mb-10" style={{ color: '#c4bdec' }}>
          Five tiers. One truth.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {PERSONAS.map(p => (
            <span
              key={p.label}
              className="rounded-full px-5 py-2 text-sm font-bold text-white"
              style={{ background: `${p.color}33`, border: `1px solid ${p.color}66`, color: p.color }}
            >
              {p.label}
            </span>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 text-center">
        <div className="relative max-w-2xl mx-auto px-4">
          <h2
            className="font-display text-4xl md:text-5xl font-bold mb-6"
            style={{ color: '#f5f3ff' }}
          >
            Get your{' '}
            <span className="gradient-text">Spice Score</span>
          </h2>
          <p className="text-lg mb-10" style={{ color: '#c4bdec' }}>
            Fill out your bracket. Find out who you really are.
          </p>
          <Link
            href="/predict"
            className="inline-flex items-center justify-center rounded-full px-10 py-5 text-xl font-bold text-white transition-opacity hover:opacity-90 active:scale-95"
            style={{ background: '#fb7185' }}
          >
            Get your Spice Score
          </Link>
        </div>
      </section>
    </div>
  );
}
