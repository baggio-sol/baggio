import Link from 'next/link';
import CountdownTimer from '@/components/ui/CountdownTimer';
import FlagOrbitClient from '@/components/landing/FlagOrbitClient';

const PERSONAS = [
  { emoji: '📊', name: 'Chalk Merchant', range: '0–20', color: '#60a5fa' },
  { emoji: '🎯', name: 'The Realist', range: '21–40', color: '#818cf8' },
  { emoji: '🎲', name: 'Calculated Gambler', range: '41–60', color: '#a78bfa' },
  { emoji: '🔥', name: 'Chaos Agent', range: '61–80', color: '#f472b6' },
  { emoji: '💀', name: 'Certified Menace', range: '81–100', color: '#fb7185' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── Hero (text only, full viewport) ──────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[100svh] px-4 pt-24 pb-16 text-center">
        {/* Ambient glows */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(700px 500px at 50% 35%, rgba(139,92,246,0.22), transparent 65%), ' +
              'radial-gradient(600px 500px at 20% 90%, rgba(59,130,246,0.16), transparent 60%)',
          }}
        />

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6 border"
          style={{
            background: 'rgba(139,92,246,0.12)',
            borderColor: 'rgba(139,92,246,0.35)',
            color: '#c4bdec',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: '#fb7185', animation: 'pulse 2s infinite' }}
          />
          FIFA World Cup 2026
        </div>

        {/* Headline */}
        <h1
          className="font-display font-extrabold leading-none mb-5"
          style={{
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            color: '#f5f3ff',
            letterSpacing: '-0.02em',
          }}
        >
          World Cup{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #fb7185 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            26&apos;
          </span>{' '}
          Predictions
        </h1>

        {/* Sub-headline */}
        <p
          className="max-w-xl text-base sm:text-lg mb-8 leading-relaxed"
          style={{ color: '#c4bdec' }}
        >
          Create your free 2026 World Cup bracket, predict the group standings
          and knockout rounds and compete with friends to see who knows ball.
        </p>

        {/* Countdown */}
        <div className="mb-10 flex flex-col items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#6f6796' }}>
            Tournament kicks off in
          </p>
          <CountdownTimer />
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/predict"
            className="rounded-2xl px-8 py-3.5 font-display font-extrabold text-base transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              color: '#fff',
              boxShadow: '0 8px 32px -8px rgba(139,92,246,0.55)',
            }}
          >
            Build My Bracket →
          </Link>
          <Link
            href="/bracket"
            className="rounded-2xl px-8 py-3.5 font-display font-extrabold text-base border transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.12)',
              color: '#c4bdec',
            }}
          >
            See an example
          </Link>
        </div>
      </section>

      {/* ── Orbit section (own full-width page) ──────────────────────── */}
      <section
        className="relative flex items-center justify-center py-24 overflow-hidden"
        style={{ minHeight: '100svh' }}
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(800px 800px at 50% 50%, rgba(139,92,246,0.14), transparent 65%)',
          }}
        />
        <div style={{ animation: 'float-up 8s ease-in-out infinite' }}>
          <FlagOrbitClient />
        </div>
      </section>

      {/* ── Spice explainer ────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-3" style={{ color: '#f5f3ff' }}>
            Your bracket has a{' '}
            <span style={{ color: '#fb7185' }}>Spice Score</span>
          </h2>
          <p style={{ color: '#c4bdec' }}>
            How bold are your picks? Every prediction is rated 0–100 based on how contrarian it is.
          </p>
        </div>

        {/* Persona badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-14">
          {PERSONAS.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)' }}
            >
              <span className="text-xl">{p.emoji}</span>
              <div>
                <p className="text-sm font-bold leading-tight" style={{ color: '#f5f3ff' }}>{p.name}</p>
                <p className="text-[10px] font-medium" style={{ color: p.color }}>{p.range} spice</p>
              </div>
            </div>
          ))}
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: '🏆',
              title: 'Full bracket depth',
              body: 'Rank all 12 groups, pick 8 third-place qualifiers, then predict every knockout match from the Round of 32 to the Final.',
            },
            {
              icon: '🌶️',
              title: 'Spice Score',
              body: 'Your picks are scored 0–100 for boldness — champion tier, early exits, deep-run dark horses, group upsets — and wrapped into a shareable card.',
            },
            {
              icon: '👥',
              title: 'Compete with friends',
              body: 'Create a private league, invite friends, and see who predicted the tournament best once the real results are in.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-5 border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-display font-extrabold text-base mb-1.5" style={{ color: '#f5f3ff' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#c4bdec' }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────────────────── */}
      <section className="text-center py-20 px-4">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-4" style={{ color: '#f5f3ff' }}>
          Ready to make your picks?
        </h2>
        <p className="text-base mb-8 max-w-md mx-auto" style={{ color: '#c4bdec' }}>
          Build your bracket in minutes. Your Spice Score updates live as you go.
        </p>
        <Link
          href="/predict"
          className="inline-block rounded-2xl px-10 py-4 font-display font-extrabold text-lg transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            color: '#fff',
            boxShadow: '0 8px 40px -8px rgba(139,92,246,0.60)',
          }}
        >
          Start for free →
        </Link>
      </section>
    </div>
  );
}
