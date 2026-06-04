import Link from 'next/link';
import CountdownTimer from '@/components/ui/CountdownTimer';
import FlagOrbitClient from '@/components/landing/FlagOrbitClient';


export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── Hero (text only, full viewport) ──────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[100svh] px-4 pt-24 pb-16 text-center">

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
            style={{ background: '#ffffff', animation: 'pulse 2s infinite' }}
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
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
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
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#c4bdec' }}>
            Tournament kicks off in
          </p>
          <CountdownTimer />
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/auth"
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
        <div style={{ animation: 'float-up 8s ease-in-out infinite' }}>
          <FlagOrbitClient />
        </div>
      </section>

      {/* ── How it works (step by step) ──────────────────────────────── */}
      <section className="relative min-h-[100svh] flex flex-col justify-center max-w-3xl mx-auto px-4 py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#c4bdec' }}>
            How it works
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl" style={{ color: '#f5f3ff' }}>
            Five steps, start to finish
          </h2>
        </div>

        <ol className="flex flex-col gap-5">
          {[
            {
              n: '01',
              title: 'Sort each group',
              body: 'There are 12 groups of 4 teams. For every group, put the teams in the order you think they’ll finish — 1st down to 4th.',
            },
            {
              n: '02',
              title: 'Choose which 3rd-place teams advance',
              body: 'The top two from each group go through automatically. On top of that, the 8 best 3rd-place teams also advance. You pick which 8.',
            },
            {
              n: '03',
              title: 'Call every knockout match',
              body: 'Once the 32 teams are set, you pick the winner of each match — Round of 32, then 16, quarters, semis, and the final. Pick your champion.',
            },
            {
              n: '04',
              title: 'Get your Spice Score',
              body: 'We rate your bracket from 0 to 100 based on how bold your picks are. Backing favourites scores low; calling upsets scores high. You get a persona and a card you can share.',
            },
            {
              n: '05',
              title: 'See how you did',
              body: 'As the real tournament plays out, your picks earn points. Compare with friends in a league to see who actually knows ball.',
            },
          ].map((s) => (
            <li
              key={s.n}
              className="flex gap-5 rounded-2xl p-5 border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <span
                className="font-display font-extrabold text-3xl sm:text-4xl flex-shrink-0 leading-none"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {s.n}
              </span>
              <div>
                <h3 className="font-display font-extrabold text-lg mb-1" style={{ color: '#f5f3ff' }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#c4bdec' }}>
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── By the numbers ───────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex flex-col justify-center max-w-5xl mx-auto px-4 py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#c4bdec' }}>
            The full bracket
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl" style={{ color: '#f5f3ff' }}>
            One tournament, every call
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { value: '48', label: 'Teams to predict', sub: 'across 12 groups of 4', color: '#f5f3ff' },
            { value: '104', label: 'Total matches', sub: 'group stage to the final', color: '#f5f3ff' },
            { value: '449', label: 'Points up for grabs', sub: 'a perfect bracket', color: '#f5f3ff' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-3xl p-8 border text-center flex flex-col items-center"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)' }}
            >
              <span
                className="font-display font-extrabold leading-none mb-3"
                style={{ fontSize: 'clamp(3rem, 7vw, 4.5rem)', color: s.color }}
              >
                {s.value}
              </span>
              <span className="font-display font-extrabold text-lg" style={{ color: '#f5f3ff' }}>
                {s.label}
              </span>
              <span className="text-sm mt-1" style={{ color: '#c4bdec' }}>
                {s.sub}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Earn points ──────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex flex-col justify-center max-w-4xl mx-auto px-4 py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#c4bdec' }}>
            Scoring
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl" style={{ color: '#f5f3ff' }}>
            Earn points while you predict
          </h2>
          <p className="mt-4" style={{ color: '#c4bdec' }}>
            Every correct call adds up. The deeper the round, the more it’s worth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Group phase */}
          <div
            className="rounded-3xl p-6 border"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(96,165,250,0.25)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="text-2xl">📋</span>
              <h3 className="font-display font-extrabold text-xl" style={{ color: '#f5f3ff' }}>
                Group phase
              </h3>
            </div>
            <ul className="flex flex-col">
              {[
                { label: 'Each team in its exact position', pts: '+3' },
                { label: 'Perfect group (all 4 correct)', pts: '12' },
                { label: 'Each correct 3rd-place qualifier', pts: '+4' },
              ].map((r, i, arr) => (
                <li
                  key={r.label}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                >
                  <span className="text-sm" style={{ color: '#c4bdec' }}>{r.label}</span>
                  <span
                    className="font-display font-extrabold text-base tabular-nums px-3 py-1 rounded-lg"
                    style={{ color: '#f5f3ff', background: 'rgba(255,255,255,0.10)' }}
                  >
                    {r.pts} pts
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Knockout phase */}
          <div
            className="rounded-3xl p-6 border"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.15)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="text-2xl">🏆</span>
              <h3 className="font-display font-extrabold text-xl" style={{ color: '#f5f3ff' }}>
                Knockout phase
              </h3>
            </div>
            <ul className="flex flex-col">
              {[
                { label: 'Round of 32 winner', pts: '+5' },
                { label: 'Round of 16 winner', pts: '+8' },
                { label: 'Quarter-final winner', pts: '+12' },
                { label: 'Semi-final winner', pts: '+18' },
                { label: 'Final winner', pts: '+30' },
                { label: 'Champion correct (bonus)', pts: '+15', big: true },
              ].map((r, i, arr) => (
                <li
                  key={r.label}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                >
                  <span
                    className="text-sm"
                    style={{ color: r.big ? '#f5f3ff' : '#c4bdec', fontWeight: r.big ? 700 : 400 }}
                  >
                    {r.label}
                  </span>
                  <span
                    className="font-display font-extrabold tabular-nums px-3 py-1 rounded-lg"
                    style={{
                      color: '#ffffff',
                      background: r.big ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)',
                      fontSize: r.big ? '1.05rem' : '1rem',
                    }}
                  >
                    {r.pts} pts
                  </span>
                </li>
              ))}
            </ul>
          </div>
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
          href="/auth"
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
