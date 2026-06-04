'use client';
import { useState, useMemo, useRef } from 'react';
import { usePredictionStore, deriveTree, useProfileStore } from '@/lib/store';
import { computeSpice } from '@/lib/spice';
import { TEAM_BY_CODE } from '@/lib/tournament';
import { renderBracketTicket } from '@/lib/bracketCanvas';
import { cn } from '@/lib/utils';
import { Check, X, Share2, Download, Trophy, Pencil } from 'lucide-react';

type FormatKey = 'ticket' | 'square' | 'story';

const FORMATS: { key: FormatKey; name: string; blurb: string }[] = [
  { key: 'ticket', name: 'Bracket Ticket',  blurb: 'Full bracket tree — best for sharing' },
  { key: 'square', name: 'Square Post',     blurb: 'Best for feeds, X, and group chats' },
  { key: 'story',  name: 'Story Post',      blurb: 'Best for Instagram/WhatsApp Stories' },
];

export default function ShareModal({ onClose }: { onClose: () => void }) {
  const { bracket } = usePredictionStore();
  const { userName, setUserName } = useProfileStore();
  const [editingName, setEditingName] = useState(false);
  const [localName, setLocalName] = useState(userName);
  const [format, setFormat] = useState<FormatKey>('ticket');
  const [downloading, setDownloading] = useState(false);
  const closingRef = useRef(false);

  const derived = useMemo(() => deriveTree(bracket), [bracket]);
  const spice   = useMemo(() => computeSpice(bracket), [bracket]);

  if (!bracket || !derived) return null;
  const { tree, winners } = derived;

  const champCode = spice.champion;
  const champ     = champCode ? TEAM_BY_CODE[champCode] : undefined;
  const ruCode    = spice.runnerUp;
  const ru        = ruCode ? TEAM_BY_CODE[ruCode] : undefined;

  const displayName = localName.trim() || 'Anonymous';

  const handleSaveName = () => {
    setUserName(localName.trim());
    setEditingName(false);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const url = renderBracketTicket({ userName: displayName, bracket, tree, winners });
      const a = document.createElement('a');
      a.href = url;
      a.download = `baggio-bracket-${displayName.replace(/\s+/g, '-').toLowerCase()}.png`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const text = `${spice.personaEmoji} ${spice.persona} — I've got ${champ?.name ?? 'my pick'} lifting the 2026 World Cup. Spice Score ${spice.score}/100.`;
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://baggio.app';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My World Cup 2026 Bracket', text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        alert('Link copied to clipboard!');
      }
    } catch { /* user dismissed */ }
  };

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(4,2,12,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={close}
    >
      <div
        className="w-full sm:max-w-lg max-h-[94vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{
          background: 'linear-gradient(160deg,#1a0d36,#120931 60%,#0b0824)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
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
              <span className="font-bold" style={{ color: '#f5f3ff' }}>{champ?.name ?? 'TBD'}</span>
              {ru && <span style={{ color: '#c4bdec' }}>· def. {ru.name}</span>}
            </p>
          </div>
          <button onClick={close} className="p-1.5 rounded-lg transition-colors hover:bg-white/10">
            <X className="w-5 h-5" style={{ color: '#c4bdec' }} />
          </button>
        </div>

        <div className="p-5">
          {/* ── Ticket preview card ───────────────────────────────────── */}
          <div
            className="relative mx-auto mb-4 rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg,#1a3d2b,#2a5c42)',
              border: '2px solid rgba(184,150,46,0.40)',
              aspectRatio: '1 / 1',
              maxHeight: 300,
            }}
          >
            {/* Header band */}
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(184,150,46,0.30)' }}
            >
              <span className="font-display font-extrabold text-xs" style={{ color: '#d4ad45' }}>BAGGIO</span>
              <span className="text-[9px] font-bold tracking-widest" style={{ color: '#d4ad45' }}>THE FINAL</span>
            </div>

            {/* Body: champion left, bracket right */}
            <div className="flex h-full items-start gap-2 px-4 pt-3 pb-4">
              <div className="flex-1 min-w-0">
                <p className="text-[7px] font-bold tracking-widest mb-1" style={{ color: '#d4ad45' }}>
                  ADMIT ONE · {displayName.toUpperCase()}
                </p>
                <div className="text-3xl leading-none mb-1">{champ?.flag ?? '🏆'}</div>
                <p className="font-display font-extrabold text-lg leading-none" style={{ color: '#f0e6c8' }}>
                  {champ?.name?.toUpperCase() ?? 'TBD'}
                </p>
                <p className="text-[8px] font-bold mt-0.5" style={{ color: '#d4ad45' }}>
                  FIFA WORLD CUP CHAMPION
                </p>
                {ru && (
                  <p className="text-[9px] italic mt-2" style={{ color: '#c8b87a' }}>
                    def. {ru.name} in the final
                  </p>
                )}
                <p className="text-[8px] mt-2 font-medium" style={{ color: '#8fad90' }}>
                  {spice.personaEmoji} {spice.persona}
                </p>
                <p className="text-[8px] font-bold" style={{ color: '#d4ad45' }}>
                  Spice Score {spice.score}/100
                </p>
              </div>

              {/* Mini bracket preview */}
              <div className="w-20 h-28 flex flex-col justify-center gap-0.5 opacity-80">
                {['M73', 'M75', 'M77', 'M74'].map((id) => {
                  void tree.matches[id];
                  const w = winners[id];
                  const t = w ? TEAM_BY_CODE[w] : undefined;
                  return (
                    <div key={id} className="flex items-center gap-0.5">
                      <span className="text-[8px]">{t?.flag ?? '·'}</span>
                      <span className="text-[7px] font-bold" style={{ color: w ? '#f0e6c8' : '#6f8f6f' }}>
                        {w ? w : '???'}
                      </span>
                    </div>
                  );
                })}
                <div className="text-[7px] font-bold text-center mt-1" style={{ color: '#d4ad45' }}>
                  ↓ {champCode ?? '…'}
                </div>
              </div>
            </div>

            {/* Footer strip */}
            <div
              className="absolute bottom-0 left-0 right-0 px-4 py-1 flex justify-between"
              style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(184,150,46,0.20)' }}
            >
              <span className="text-[8px] font-bold" style={{ color: '#d4ad45' }}>baggio.app</span>
              <span className="text-[8px]" style={{ color: '#8fad90' }}>MMXXVI</span>
            </div>
          </div>

          {/* ── Name on ticket ────────────────────────────────────────── */}
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#6f6796' }}>
                Name on ticket
              </p>
              {editingName ? (
                <input
                  autoFocus
                  value={localName}
                  maxLength={30}
                  onChange={(e) => setLocalName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="w-full bg-transparent outline-none text-sm font-bold"
                  style={{ color: '#f5f3ff' }}
                />
              ) : (
                <p className="text-sm font-bold" style={{ color: '#f5f3ff' }}>
                  {displayName}
                </p>
              )}
            </div>
            <button
              onClick={() => setEditingName((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
            </button>
          </div>

          {/* ── Format chooser ────────────────────────────────────────── */}
          <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: '#6f6796' }}>
            Choose a format
          </p>
          <div className="flex flex-col gap-2 mb-5">
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
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    {champ?.flag ?? '🏆'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-extrabold text-sm leading-tight" style={{ color: '#f5f3ff' }}>
                      {f.name}
                    </p>
                    <p className="text-xs" style={{ color: '#c4bdec' }}>{f.blurb}</p>
                  </div>
                  {isActive && <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#a78bfa' }} />}
                </button>
              );
            })}
          </div>

          {/* ── Actions ───────────────────────────────────────────────── */}
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
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 font-display font-extrabold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f5f3ff' }}
            >
              <Download className="w-5 h-5" />
              {downloading ? 'Rendering…' : 'Download'}
            </button>
          </div>

          {/* Footer note */}
          <p className="text-[11px] leading-relaxed mt-4 flex items-start gap-1.5" style={{ color: '#6f6796' }}>
            <Trophy className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#6f6796' }} />
            Download renders a full 1080×1080 bracket card with your complete prediction tree.
          </p>
        </div>
      </div>
    </div>
  );
}
