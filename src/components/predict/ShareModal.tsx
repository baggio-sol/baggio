'use client';
import { useState, useMemo, useRef } from 'react';
import { usePredictionStore } from '@/lib/store';
import { computeSpice } from '@/lib/spice';
import { TEAM_BY_CODE } from '@/lib/tournament';
import { cn } from '@/lib/utils';
import { Check, X, Share2, Download, Trophy } from 'lucide-react';

type FormatKey = 'wheel' | 'square' | 'story' | 'full';

const FORMATS: { key: FormatKey; name: string; blurb: string; dims: string; w: number; h: number }[] = [
  { key: 'wheel',  name: 'Bracket Wheel', blurb: 'Circular poster of your whole bracket', dims: '1080 x 1080', w: 1080, h: 1080 },
  { key: 'square', name: 'Square Post',   blurb: 'Best for feeds, X, and group chats',     dims: '1080 x 1080', w: 1080, h: 1080 },
  { key: 'story',  name: 'Story Post',    blurb: 'Best for Stories and tall share surfaces', dims: '1080 x 1920', w: 1080, h: 1920 },
  { key: 'full',   name: 'Full Bracket',  blurb: 'Best for showing every knockout pick',    dims: '1920 x 1080', w: 1920, h: 1080 },
];

/**
 * Draw the share card to a canvas at full export resolution and return a PNG
 * data URL. Uses emoji flags + text only so the canvas is never tainted by
 * cross-origin images (keeps Download working offline).
 */
function renderCard(
  fmt: { w: number; h: number },
  data: { name: string; champion: string; runnerUp: string; persona: string; personaEmoji: string; score: number },
): string {
  const canvas = document.createElement('canvas');
  canvas.width = fmt.w;
  canvas.height = fmt.h;
  const ctx = canvas.getContext('2d')!;
  const { w, h } = fmt;

  // Background gradient (matches app tokens).
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#1a0d36');
  grad.addColorStop(0.45, '#120931');
  grad.addColorStop(1, '#080f28');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Purple glow.
  const glow = ctx.createRadialGradient(w * 0.85, h * 0.05, 0, w * 0.85, h * 0.05, w * 0.7);
  glow.addColorStop(0, 'rgba(139,92,246,0.35)');
  glow.addColorStop(1, 'rgba(139,92,246,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const s = Math.min(w, h) / 1080; // scale factor
  ctx.textAlign = 'center';

  const champ = TEAM_BY_CODE[data.champion];
  const ru = TEAM_BY_CODE[data.runnerUp];

  // Eyebrow.
  ctx.fillStyle = '#c4bdec';
  ctx.font = `700 ${36 * s}px Montserrat, sans-serif`;
  ctx.fillText('WORLD CUP 2026 · MY BRACKET', cx, h * 0.16);

  // Champion flag emoji.
  ctx.font = `${200 * s}px sans-serif`;
  ctx.fillText(champ?.flag ?? '🏆', cx, h * 0.42);

  // "CHAMPION".
  ctx.fillStyle = '#fb7185';
  ctx.font = `800 ${44 * s}px Montserrat, sans-serif`;
  ctx.fillText('CHAMPION', cx, h * 0.5);

  // Champion name.
  ctx.fillStyle = '#f5f3ff';
  ctx.font = `800 ${110 * s}px Syne, sans-serif`;
  ctx.fillText((champ?.name ?? 'TBD').toUpperCase(), cx, h * 0.6);

  // Runner-up.
  if (ru) {
    ctx.fillStyle = '#c4bdec';
    ctx.font = `600 ${34 * s}px Montserrat, sans-serif`;
    ctx.fillText(`def. ${ru.name} in the final`, cx, h * 0.66);
  }

  // Persona + spice score.
  ctx.fillStyle = '#a78bfa';
  ctx.font = `800 ${48 * s}px Syne, sans-serif`;
  ctx.fillText(`${data.personaEmoji}  ${data.persona}`, cx, h * 0.78);
  ctx.fillStyle = '#fb7185';
  ctx.font = `800 ${40 * s}px Montserrat, sans-serif`;
  ctx.fillText(`Spice Score ${data.score}/100`, cx, h * 0.83);

  // Bracket name + footer.
  ctx.fillStyle = '#6f6796';
  ctx.font = `700 ${30 * s}px Montserrat, sans-serif`;
  ctx.fillText(data.name, cx, h * 0.92);
  ctx.fillText('baggio.app', cx, h * 0.96);

  return canvas.toDataURL('image/png');
}

export default function ShareModal({ onClose }: { onClose: () => void }) {
  const { bracket } = usePredictionStore();
  const [name, setName] = useState('My World Cup Bracket');
  const [format, setFormat] = useState<FormatKey>('square');
  const closingRef = useRef(false);

  const spice = useMemo(() => computeSpice(bracket), [bracket]);
  const champ = spice.champion ? TEAM_BY_CODE[spice.champion] : undefined;
  const runnerUp = spice.runnerUp ? TEAM_BY_CODE[spice.runnerUp] : undefined;

  const cardData = {
    name: name.trim() || 'My World Cup Bracket',
    champion: spice.champion,
    runnerUp: spice.runnerUp,
    persona: spice.persona,
    personaEmoji: spice.personaEmoji,
    score: spice.score,
  };

  const activeFmt = FORMATS.find((f) => f.key === format)!;

  const handleDownload = () => {
    const url = renderCard({ w: activeFmt.w, h: activeFmt.h }, cardData);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cardData.name.replace(/\s+/g, '-').toLowerCase()}-${format}.png`;
    a.click();
  };

  const handleShare = async () => {
    const text = `${cardData.personaEmoji} ${cardData.persona} — I've got ${champ?.name ?? 'my pick'} lifting the World Cup. Spice Score ${spice.score}/100. Build yours:`;
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://baggio.app';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My World Cup 2026 Bracket', text, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(`${text} ${shareUrl}`);
        alert('Share text copied to clipboard!');
      }
    } catch {
      /* user dismissed share sheet — no-op */
    }
  };

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(4,2,12,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={close}
    >
      <div
        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{
          background: 'linear-gradient(160deg,#1a0d36,#120931 60%,#0b0824)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(167,139,250,0.20)' }}
          >
            <Check className="w-5 h-5" style={{ color: '#a78bfa' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-extrabold text-lg leading-tight" style={{ color: '#f5f3ff' }}>
              Bracket Confirmed
            </h2>
            <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: '#c4bdec' }}>
              Champion: <span className="text-base leading-none">{champ?.flag}</span>
              <span className="font-bold">{champ?.name ?? 'TBD'}</span>
            </p>
          </div>
          <button onClick={close} className="p-1.5 rounded-lg transition-colors hover:bg-white/10">
            <X className="w-5 h-5" style={{ color: '#c4bdec' }} />
          </button>
        </div>

        <div className="p-5">
          {/* ── Live preview card ──────────────────────────────────── */}
          <div
            className="relative mx-auto mb-2 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center px-6"
            style={{
              width: '100%',
              aspectRatio: `${activeFmt.w} / ${activeFmt.h}`,
              maxHeight: 360,
              background:
                'radial-gradient(600px 400px at 85% -10%, rgba(139,92,246,0.35), transparent 60%), linear-gradient(160deg,#1a0d36,#120931 55%,#080f28)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <p className="text-[10px] font-bold tracking-widest mb-1" style={{ color: '#c4bdec' }}>
              WORLD CUP 2026 · MY BRACKET
            </p>
            <div className="text-5xl leading-none my-1">{champ?.flag ?? '🏆'}</div>
            <p className="text-[11px] font-extrabold tracking-wider" style={{ color: '#fb7185' }}>
              CHAMPION
            </p>
            <p className="font-display font-extrabold text-2xl leading-tight" style={{ color: '#f5f3ff' }}>
              {champ?.name?.toUpperCase() ?? 'TBD'}
            </p>
            {runnerUp && (
              <p className="text-[11px] font-medium mt-0.5" style={{ color: '#c4bdec' }}>
                def. {runnerUp.name} in the final
              </p>
            )}
            <p className="font-display font-extrabold text-sm mt-2" style={{ color: '#a78bfa' }}>
              {spice.personaEmoji} {spice.persona}
            </p>
            <p className="text-[11px] font-bold" style={{ color: '#fb7185' }}>
              Spice Score {spice.score}/100
            </p>
          </div>
          <div className="flex items-center justify-between mb-5 px-1">
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: '#6f6796' }}>
              {activeFmt.name}
            </span>
            <span className="text-[11px] font-medium" style={{ color: '#6f6796' }}>
              {activeFmt.dims}
            </span>
          </div>

          {/* ── Bracket name ───────────────────────────────────────── */}
          <label className="block text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: '#6f6796' }}>
            Bracket name
          </label>
          <div className="relative mb-5">
            <input
              value={name}
              maxLength={50}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl px-4 py-3 pr-14 text-sm font-bold outline-none transition-colors focus:border-[rgba(139,92,246,0.5)]"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: '#f5f3ff',
              }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] tabular-nums" style={{ color: '#6f6796' }}>
              {name.length}/50
            </span>
          </div>

          {/* ── Format chooser ─────────────────────────────────────── */}
          <p className="text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: '#6f6796' }}>
            Choose a format
          </p>
          <div className="flex flex-col gap-2 mb-6">
            {FORMATS.map((f) => {
              const isActive = f.key === format;
              return (
                <button
                  key={f.key}
                  onClick={() => setFormat(f.key)}
                  className={cn('flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all active:scale-[0.99]')}
                  style={{
                    background: isActive ? 'rgba(139,92,246,0.14)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isActive ? 'rgba(139,92,246,0.50)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {champ?.flag ?? '🏆'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-extrabold text-base leading-tight" style={{ color: '#f5f3ff' }}>
                      {f.name}
                    </p>
                    <p className="text-xs" style={{ color: '#c4bdec' }}>
                      {f.blurb}
                    </p>
                  </div>
                  {isActive && <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#a78bfa' }} />}
                </button>
              );
            })}
          </div>

          {/* ── Actions ────────────────────────────────────────────── */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 font-display font-extrabold text-white transition-all hover:scale-[1.02] active:scale-95"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' }}
            >
              <Share2 className="w-5 h-5" /> Share
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 font-display font-extrabold transition-all hover:scale-[1.02] active:scale-95"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f5f3ff' }}
            >
              <Download className="w-5 h-5" /> Download
            </button>
          </div>

          {/* Footer note */}
          <p className="text-[11px] leading-relaxed mt-4 flex items-start gap-1.5" style={{ color: '#6f6796' }}>
            <Trophy className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#6f6796' }} />
            Your picks stay private until kickoff. Share settings let you show your champion in social previews.
          </p>
        </div>
      </div>
    </div>
  );
}
