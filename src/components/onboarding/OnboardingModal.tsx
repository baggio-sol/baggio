'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, X, User } from 'lucide-react';
import { useProfileStore } from '@/lib/store';

export const OPEN_ONBOARDING_EVENT = 'baggio:open-onboarding';

const STEPS = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
];

export default function OnboardingModal() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [visible, setVisible] = useState(false);
  const [localName, setLocalName] = useState('');
  const { setUserName } = useProfileStore();

  useEffect(() => {
    function open() {
      setStep(1);
      setVisible(true);
    }
    window.addEventListener(OPEN_ONBOARDING_EVENT, open);
    return () => window.removeEventListener(OPEN_ONBOARDING_EVENT, open);
  }, []);

  function dismiss() {
    setVisible(false);
  }

  function next() {
    if (step === 1 && localName.trim()) {
      setUserName(localName.trim());
    }
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      dismiss();
      router.push('/predict');
    }
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: 'rgba(8,15,40,0.85)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border overflow-hidden"
        style={{
          background:
            'radial-gradient(600px 400px at 80% -10%, rgba(139,92,246,0.30), transparent 60%), ' +
            'radial-gradient(500px 400px at -10% 110%, rgba(59,130,246,0.22), transparent 55%), ' +
            'linear-gradient(160deg,#1a0d36,#120931 55%,#080f28)',
          borderColor: 'rgba(255,255,255,0.12)',
          boxShadow: '0 32px 80px -20px rgba(139,92,246,0.45)',
        }}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 p-2 rounded-xl transition-all hover:bg-white/10"
          style={{ color: '#6f6796' }}
          aria-label="Skip"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step indicator */}
        <div className="flex gap-1.5 px-8 pt-7">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{
                background: s.id <= step
                  ? 'linear-gradient(90deg,#8b5cf6,#3b82f6)'
                  : 'rgba(255,255,255,0.10)',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          {step === 1 && <Step1 localName={localName} setLocalName={setLocalName} />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
          {step === 4 && <Step4 />}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: '#6f6796' }}>
            {step} of {STEPS.length}
          </span>
          <button
            onClick={next}
            className="flex items-center gap-2 rounded-2xl px-6 py-3 font-display font-extrabold text-sm transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)',
              color: '#fff',
              boxShadow: '0 8px 24px -8px rgba(139,92,246,0.55)',
            }}
          >
            {step === 4 ? 'Create my bracket' : step === 1 && localName.trim() ? `Let's go, ${localName.trim().split(' ')[0]}!` : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Step screens ─────────────────────────────────────────────────────────── */

function Step1({ localName, setLocalName }: { localName: string; setLocalName: (v: string) => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-5xl mb-5">⚽</span>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#fb7185' }}>
        Welcome
      </p>
      <h2 className="font-display font-extrabold leading-tight mb-3" style={{ fontSize: 'clamp(1.7rem,4vw,2.2rem)', color: '#f5f3ff' }}>
        World Cup 26&apos; Predictor
      </h2>
      <p className="text-sm mb-7 leading-relaxed" style={{ color: '#c4bdec' }}>
        48 teams. 104 matches. Build your bracket and get a personalised share card — starting with your name.
      </p>

      {/* Name input */}
      <div className="w-full mb-5">
        <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-left" style={{ color: '#6f6796' }}>
          What should we call you?
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6f6796' }} />
          <input
            autoFocus
            type="text"
            placeholder="Your name or nickname"
            value={localName}
            maxLength={30}
            onChange={(e) => setLocalName(e.target.value)}
            className="w-full rounded-xl pl-11 pr-4 py-3.5 text-sm font-bold outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: `1px solid ${localName.trim() ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.12)'}`,
              color: '#f5f3ff',
            }}
          />
        </div>
        {localName.trim() && (
          <p className="text-xs mt-2 text-left font-medium" style={{ color: '#a78bfa' }}>
            Your name will appear on your personalised bracket card 🎟️
          </p>
        )}
      </div>

      <div
        className="w-full rounded-2xl px-5 py-4 border text-center"
        style={{ background: 'rgba(251,113,133,0.10)', borderColor: 'rgba(251,113,133,0.28)' }}
      >
        <span className="font-display font-extrabold" style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: '#fb7185' }}>
          449 points
        </span>
        <p className="text-sm mt-1 font-medium" style={{ color: '#f5f3ff' }}>
          to be won — predict every result before kick-off
        </p>
      </div>
    </div>
  );
}

function Step2() {
  return (
    <div className="flex flex-col">
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#fb7185' }}>
        Build your bracket
      </p>
      <h2 className="font-display font-extrabold leading-tight mb-2" style={{ fontSize: 'clamp(1.6rem,4vw,2rem)', color: '#f5f3ff' }}>
        15 minutes to build the perfect prediction
      </h2>
      <p className="text-sm mb-7" style={{ color: '#c4bdec' }}>
        Three steps. Done before your tea gets cold.
      </p>
      <ol className="flex flex-col gap-3">
        {[
          { n: '1', title: 'Predict group standings', body: 'Rank all 4 teams in each of the 12 groups, 1st to 4th.' },
          { n: '2', title: 'Pick the best 3rd-place teams', body: 'Eight 3rd-place finishers advance. You decide which eight.' },
          { n: '3', title: 'Fill the knockout bracket', body: 'Call every match from the Round of 32 all the way to the final.' },
        ].map((s) => (
          <li
            key={s.n}
            className="flex gap-4 rounded-2xl px-4 py-3.5 border"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <span
              className="font-display font-extrabold text-xl flex-shrink-0 leading-none"
              style={{
                background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {s.n}
            </span>
            <div>
              <p className="font-bold text-sm" style={{ color: '#f5f3ff' }}>{s.title}</p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#c4bdec' }}>{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Step3() {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-5xl mb-5">👥</span>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#fb7185' }}>
        Compete
      </p>
      <h2 className="font-display font-extrabold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.2rem)', color: '#f5f3ff' }}>
        Compete with friends
      </h2>
      <p className="text-base leading-relaxed mb-7" style={{ color: '#c4bdec' }}>
        Create a private league, invite your friends, and track the leaderboard as the real results come in. Bragging rights on the line.
      </p>
      <div className="grid grid-cols-3 gap-3 w-full">
        {[
          { icon: '🏆', label: 'Track every match' },
          { icon: '📊', label: 'Live leaderboard' },
          { icon: '🌶️', label: 'Spice Score' },
        ].map((f) => (
          <div
            key={f.label}
            className="rounded-2xl p-4 border flex flex-col items-center gap-2"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <span className="text-2xl">{f.icon}</span>
            <span className="text-xs font-semibold text-center" style={{ color: '#c4bdec' }}>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step4() {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-5xl mb-5">🌶️</span>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#fb7185' }}>
        You&apos;re ready
      </p>
      <h2 className="font-display font-extrabold leading-tight mb-4" style={{ fontSize: 'clamp(1.7rem,4vw,2.2rem)', color: '#f5f3ff' }}>
        One bracket to rule them all
      </h2>
      <p className="text-base leading-relaxed mb-6" style={{ color: '#c4bdec' }}>
        Your picks are saved as you go. Come back any time before kick-off on <strong style={{ color: '#f5f3ff' }}>June 11, 2026</strong> to update them.
      </p>
      <div
        className="w-full rounded-2xl px-5 py-4 border"
        style={{ background: 'rgba(139,92,246,0.10)', borderColor: 'rgba(139,92,246,0.28)' }}
      >
        <p className="text-sm font-semibold" style={{ color: '#c4bdec' }}>
          Hit <span style={{ color: '#f5f3ff' }}>&quot;Create my bracket&quot;</span> below to start — it takes about 15 minutes.
        </p>
      </div>
    </div>
  );
}
