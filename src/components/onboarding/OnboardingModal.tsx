'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, X, User } from 'lucide-react';
import { useProfileStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

export const OPEN_ONBOARDING_EVENT = 'baggio:open-onboarding';

const STEPS = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

export default function OnboardingModal() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [visible, setVisible] = useState(false);
  const [localName, setLocalName] = useState('');
  const [shook, setShook] = useState(false);
  const { setUserName } = useProfileStore();

  useEffect(() => {
    function open(e: Event) {
      const detail = (e as CustomEvent).detail as { name?: string } | undefined;
      if (detail?.name) setLocalName(detail.name);
      setStep(1);
      setVisible(true);
    }
    window.addEventListener(OPEN_ONBOARDING_EVENT, open);
    return () => window.removeEventListener(OPEN_ONBOARDING_EVENT, open);
  }, []);

  function dismiss() { setVisible(false); router.push('/predict'); }

  async function saveNameToProfile(name: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('profiles').update({ display_name: name }).eq('id', user.id);
  }

  function next() {
    if (step === 1) {
      if (!localName.trim()) {
        setShook(true);
        setTimeout(() => setShook(false), 600);
        return;
      }
      const name = localName.trim();
      setUserName(name);
      saveNameToProfile(name);
    }
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      dismiss();
      router.push('/predict');
    }
  }

  if (!visible) return null;

  const nameRequired = step === 1 && !localName.trim();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: 'rgba(8,15,40,0.80)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: '#fdf8f0',
          border: '1px solid rgba(0,0,0,0.10)',
          boxShadow: '0 32px 80px -20px rgba(0,0,0,0.25)',
        }}
      >
        {/* Top bar: step dots + close */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-0">
          <div className="flex gap-1.5 flex-1">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className="h-1.5 flex-1 rounded-full transition-all duration-300"
                style={{
                  background: s.id <= step
                    ? 'linear-gradient(90deg,#8b5cf6,#3b82f6)'
                    : 'rgba(0,0,0,0.10)',
                }}
              />
            ))}
          </div>
          <button
            onClick={dismiss}
            className="p-1.5 rounded-lg transition-all hover:bg-black/5"
            style={{ color: '#6b7280' }}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-7">
          {step === 1 && <Step1 localName={localName} setLocalName={setLocalName} shook={shook} />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
          {step === 4 && <Step4 />}
        </div>

        {/* Footer */}
        <div className="px-8 pb-7 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={dismiss}
              className="text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ color: '#6b7280' }}
            >
              Skip
            </button>
          ) : (
            <span className="text-xs font-medium" style={{ color: '#9ca3af' }}>
              Step {step} of {STEPS.length}
            </span>
          )}

          <button
            onClick={next}
            disabled={nameRequired}
            className="flex items-center gap-2 rounded-2xl px-6 py-3 font-display font-extrabold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)',
              color: '#fff',
              boxShadow: nameRequired ? 'none' : '0 8px 24px -8px rgba(139,92,246,0.55)',
            }}
          >
            {step === 4
              ? 'Create my bracket'
              : step === 1 && localName.trim()
              ? `Let's go, ${localName.trim().split(' ')[0]}!`
              : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Step screens ─────────────────────────────────────────────────────────── */

function Step1({ localName, setLocalName, shook }: {
  localName: string;
  setLocalName: (v: string) => void;
  shook: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-5xl mb-4">⚽</span>
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#6b7280' }}>
        Welcome
      </p>
      <h2 className="font-display font-extrabold leading-tight mb-3" style={{ fontSize: 'clamp(1.6rem,4vw,2rem)', color: '#111827' }}>
        World Cup 26&apos; Predictor
      </h2>
      <p className="text-sm mb-6 leading-relaxed" style={{ color: '#6b7280' }}>
        48 teams. 104 matches. Build your bracket and get a personalised share card — starting with your name.
      </p>

      <div className="w-full mb-5">
        <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest mb-2 text-left" style={{ color: '#374151' }}>
          Your name
          <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div
          className="relative"
          style={{ animation: shook ? 'shake 0.5s ease' : undefined }}
        >
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
          <input
            autoFocus
            type="text"
            placeholder="Your name or nickname"
            value={localName}
            maxLength={30}
            onChange={(e) => setLocalName(e.target.value)}
            className="w-full rounded-xl pl-11 pr-4 py-3.5 text-sm font-bold outline-none transition-all"
            style={{
              background: 'rgba(0,0,0,0.04)',
              border: `1.5px solid ${localName.trim() ? '#8b5cf6' : 'rgba(0,0,0,0.15)'}`,
              color: '#111827',
            }}
          />
        </div>
        {localName.trim() ? (
          <p className="text-xs mt-2 text-left font-medium" style={{ color: '#8b5cf6' }}>
            Your name will appear on your personalised bracket card 🎟️
          </p>
        ) : (
          <p className="text-xs mt-2 text-left" style={{ color: '#9ca3af' }}>
            Required — used on your share card
          </p>
        )}
      </div>

      <div
        className="w-full rounded-2xl px-5 py-4 border text-center"
        style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.20)' }}
      >
        <span className="font-display font-extrabold" style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', color: '#8b5cf6' }}>
          449 points
        </span>
        <p className="text-sm mt-1 font-medium" style={{ color: '#374151' }}>
          to be won — predict every result before kick-off
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

function Step2() {
  return (
    <div className="flex flex-col">
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#6b7280' }}>
        Build your bracket
      </p>
      <h2 className="font-display font-extrabold leading-tight mb-2" style={{ fontSize: 'clamp(1.5rem,4vw,1.9rem)', color: '#111827' }}>
        15 minutes to build the perfect prediction
      </h2>
      <p className="text-sm mb-5" style={{ color: '#6b7280' }}>
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
            style={{ background: 'rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.08)' }}
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
              <p className="font-bold text-sm" style={{ color: '#111827' }}>{s.title}</p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#6b7280' }}>{s.body}</p>
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
      <span className="text-5xl mb-4">👥</span>
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#6b7280' }}>
        Compete
      </p>
      <h2 className="font-display font-extrabold leading-tight mb-3" style={{ fontSize: 'clamp(1.6rem,4vw,2rem)', color: '#111827' }}>
        Compete with friends
      </h2>
      <p className="text-sm leading-relaxed mb-6" style={{ color: '#6b7280' }}>
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
            style={{ background: 'rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.08)' }}
          >
            <span className="text-2xl">{f.icon}</span>
            <span className="text-xs font-semibold text-center" style={{ color: '#374151' }}>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step4() {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-5xl mb-4">🌶️</span>
      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#6b7280' }}>
        You&apos;re ready
      </p>
      <h2 className="font-display font-extrabold leading-tight mb-3" style={{ fontSize: 'clamp(1.6rem,4vw,2rem)', color: '#111827' }}>
        One bracket to rule them all
      </h2>
      <p className="text-sm leading-relaxed mb-5" style={{ color: '#6b7280' }}>
        Your picks are saved as you go. Come back any time before kick-off on{' '}
        <strong style={{ color: '#111827' }}>June 11, 2026</strong> to update them.
      </p>
      <div
        className="w-full rounded-2xl px-5 py-4 border"
        style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.20)' }}
      >
        <p className="text-sm font-semibold" style={{ color: '#374151' }}>
          Hit <span style={{ color: '#8b5cf6' }}>&quot;Create my bracket&quot;</span> below to start — it takes about 15 minutes.
        </p>
      </div>
    </div>
  );
}
