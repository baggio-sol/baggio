'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { usePredictionStore, deriveTree, useProfileStore } from '@/lib/store';
import { computeSpice } from '@/lib/spice';
import { TEAM_BY_CODE } from '@/lib/tournament';
import { renderBracketTicket } from '@/lib/bracketCanvas';
import { Check, X, Share2, Download, Trophy, Pencil, Loader2 } from 'lucide-react';

export default function ShareModal({ onClose }: { onClose: () => void }) {
  const { bracket } = usePredictionStore();
  const { userName, setUserName } = useProfileStore();
  const [editingName, setEditingName] = useState(false);
  const [localName, setLocalName] = useState(userName);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(true);
  const closingRef = useRef(false);

  const derived = useMemo(() => deriveTree(bracket), [bracket]);
  const spice   = useMemo(() => computeSpice(bracket), [bracket]);

  const displayName = localName.trim() || 'Anonymous';

  const champCode = spice.champion;
  const champ     = champCode ? TEAM_BY_CODE[champCode] : undefined;
  const ruCode    = spice.runnerUp;
  const ru        = ruCode ? TEAM_BY_CODE[ruCode] : undefined;

  // Render the real ticket image whenever the name (or bracket) changes.
  // The preview shows EXACTLY what Download produces.
  useEffect(() => {
    if (!bracket || !derived) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRendering(true);
    renderBracketTicket({ userName: displayName, bracket, tree: derived.tree, winners: derived.winners })
      .then((url) => { if (!cancelled) { setImgUrl(url); setRendering(false); } })
      .catch(() => { if (!cancelled) setRendering(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bracket, displayName]);

  if (!bracket || !derived) return null;

  const handleSaveName = () => {
    setUserName(localName.trim());
    setEditingName(false);
  };

  const handleDownload = () => {
    if (!imgUrl) return;
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = `wc26-predictor-${displayName.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  const buildShareUrl = () => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://wcpredictor.fun';
    const p = new URLSearchParams({
      score:     String(spice.score),
      persona:   spice.persona,
      emoji:     spice.personaEmoji,
      boldest:   spice.boldestCall,
      ...(spice.champion  ? { champion:  spice.champion }  : {}),
      ...(spice.runnerUp  ? { runnerUp:  spice.runnerUp }  : {}),
      ...(spice.darkHorse ? { darkHorse: spice.darkHorse } : {}),
      ...(spice.earlyExit ? { earlyExit: spice.earlyExit } : {}),
      ...(displayName !== 'Anonymous' ? { name: displayName } : {}),
    });
    return `${base}/share?${p.toString()}`;
  };

  const handleShare = async () => {
    const shareUrl = buildShareUrl();
    const text = `${spice.personaEmoji} ${spice.persona} — I've got ${champ?.name ?? 'my pick'} lifting the 2026 World Cup. Spice Score ${spice.score}/100.`;
    try {
      // Prefer sharing the actual image file when supported.
      if (imgUrl && navigator.canShare) {
        const blob = await (await fetch(imgUrl)).blob();
        const file = new File([blob], 'wc26-predictor-bracket.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'My World Cup 2026 Bracket', text, url: shareUrl });
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({ title: "My WC'26 Predictor Bracket", text, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(`${text} ${shareUrl}`);
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
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(167,139,250,0.20)' }}>
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
          {/* ── Live preview (the exact downloaded image) ─────────────── */}
          <div
            className="relative mx-auto mb-4 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ aspectRatio: '1 / 1', background: '#f0e6c8', border: '1px solid rgba(184,150,46,0.35)' }}
          >
            {imgUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgUrl} alt="Your bracket card" className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2" style={{ color: '#7a6e50' }}>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-bold">Rendering your ticket…</span>
              </div>
            )}
            {rendering && imgUrl && (
              <div className="absolute top-2 right-2 rounded-full px-2 py-1 flex items-center gap-1" style={{ background: 'rgba(0,0,0,0.4)' }}>
                <Loader2 className="w-3 h-3 animate-spin" style={{ color: '#d4ad45' }} />
                <span className="text-[10px] font-bold" style={{ color: '#d4ad45' }}>updating</span>
              </div>
            )}
          </div>
          <p className="text-center text-[11px] font-bold tracking-widest uppercase mb-5" style={{ color: '#c4bdec' }}>
            Bracket Ticket · 1080 × 1080
          </p>

          {/* ── Name on ticket ────────────────────────────────────────── */}
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#c4bdec' }}>
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
                <p className="text-sm font-bold" style={{ color: '#f5f3ff' }}>{displayName}</p>
              )}
            </div>
            <button onClick={() => setEditingName((v) => !v)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <Pencil className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
            </button>
          </div>

          {/* ── Actions ───────────────────────────────────────────────── */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              disabled={!imgUrl}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 font-display font-extrabold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' }}
            >
              <Share2 className="w-5 h-5" /> Share
            </button>
            <button
              onClick={handleDownload}
              disabled={!imgUrl}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 font-display font-extrabold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f5f3ff' }}
            >
              <Download className="w-5 h-5" /> Download
            </button>
          </div>

          <p className="text-[11px] leading-relaxed mt-4 flex items-start gap-1.5" style={{ color: '#c4bdec' }}>
            <Trophy className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#c4bdec' }} />
            The preview above is exactly what gets downloaded and shared — your full bracket tree with real flags.
          </p>
        </div>
      </div>
    </div>
  );
}
