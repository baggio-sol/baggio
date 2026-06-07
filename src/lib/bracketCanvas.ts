/**
 * Renders a 1080×1080 bracket image with a theme choice.
 */

import { TEAM_BY_CODE } from './tournament';
import type { KnockoutTree } from './tournament';

export type BracketTheme = 'dark' | 'light';

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

type Palette = {
  bg: string; bgGrad: [string, string, string];
  header: string; headerBorder: string;
  appName: string; userText: string; mutedText: string; footerSub: string;
  slotBg: string; slotWin: string; slotText: string; slotWinText: string; slotTbd: string;
  line: string; dash: string;
  finalBox: string; finalBorder: string; finalText: string; finalLabel: string;
  flagBorder: string; flagEmpty: string;
};

const DARK: Palette = {
  bg: '#120931', bgGrad: ['#1a0d36', '#120931', '#080f28'],
  header: '#1a0d36', headerBorder: '#8b5cf6',
  appName: '#a78bfa', userText: '#f5f3ff', mutedText: '#c4bdec', footerSub: '#c4bdec',
  slotBg: 'rgba(255,255,255,0.16)', slotWin: 'rgba(139,92,246,0.60)',
  slotText: '#ffffff', slotWinText: '#a78bfa', slotTbd: '#c4bdec',
  line: '#8b5cf6', dash: 'rgba(139,92,246,0.35)',
  finalBox: 'rgba(26,13,54,0.95)', finalBorder: '#8b5cf6', finalText: '#ffffff', finalLabel: '#a78bfa',
  flagBorder: 'rgba(255,255,255,0.20)', flagEmpty: 'rgba(255,255,255,0.10)',
};

const LIGHT: Palette = {
  bg: '#fdf8f0', bgGrad: ['#fdf8f0', '#fdf8f0', '#fdf8f0'],
  header: '#f5ede0', headerBorder: '#e8d8c0',
  appName: '#8b5cf6', userText: '#1a0d36', mutedText: '#9c7e55', footerSub: '#6b4f2a',
  slotBg: 'rgba(139,92,246,0.10)', slotWin: 'rgba(139,92,246,0.28)',
  slotText: '#1a0d36', slotWinText: '#6d28d9', slotTbd: '#9c7e55',
  line: '#8b5cf6', dash: 'rgba(139,92,246,0.30)',
  finalBox: 'rgba(139,92,246,0.08)', finalBorder: '#8b5cf6', finalText: '#1a0d36', finalLabel: '#7c3aed',
  flagBorder: 'rgba(0,0,0,0.15)', flagEmpty: 'rgba(139,92,246,0.15)',
};

const LEFT_R32_GROUPS = [
  ['M74', 'M77'], ['M73', 'M75'], ['M83', 'M84'], ['M81', 'M82'],
] as const;
const LEFT_R16 = ['M89', 'M90', 'M93', 'M94'] as const;
const LEFT_QF  = ['M97', 'M98'] as const;
const LEFT_SF  = 'M101';
const RIGHT_R32_GROUPS = [
  ['M76', 'M78'], ['M79', 'M80'], ['M85', 'M87'], ['M86', 'M88'],
] as const;
const RIGHT_R16 = ['M91', 'M92', 'M96', 'M95'] as const;
const RIGHT_QF  = ['M99', 'M100'] as const;
const RIGHT_SF  = 'M102';
const FINAL     = 'M104';

const W = 1080, H = 1080;
const HEADER_H = 52, FOOTER_H = 40;
const BRACKET_TOP = HEADER_H + 20;
const BRACKET_BOT = H - FOOTER_H - 8;
const TEAM_H = 30, TEAM_GAP = 6;
const MATCH_H = TEAM_H * 2 + TEAM_GAP;

const LX = {
  r32Left: 14, r32Right: 148,
  r16Left: 162, r16Right: 284,
  qfLeft: 298, qfRight: 404,
  sfLeft: 418, sfRight: 508,
  finalCx: 540,
};
const RX = {
  sfRight: W - LX.sfLeft, sfLeft: W - LX.sfRight,
  qfRight: W - LX.qfLeft, qfLeft: W - LX.qfRight,
  r16Right: W - LX.r16Left, r16Left: W - LX.r16Right,
  r32Right: W - LX.r32Left, r32Left: W - LX.r32Right,
};
const SLOT_W_R32 = LX.r32Right - LX.r32Left;
const SLOT_W_R16 = LX.r16Right - LX.r16Left;
const SLOT_W_QF  = LX.qfRight  - LX.qfLeft;
const SLOT_W_SF  = LX.sfRight  - LX.sfLeft;

type FlagMap = Record<string, HTMLImageElement>;
const flagCache: FlagMap = {};

function loadFlag(code: string): Promise<HTMLImageElement | null> {
  const iso = ISO2[code];
  if (!iso) return Promise.resolve(null);
  if (flagCache[code]) return Promise.resolve(flagCache[code]);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => { flagCache[code] = img; resolve(img); };
    img.onerror = () => resolve(null);
    img.src = `https://flagcdn.com/w80/${iso}.png`;
  });
}

async function loadAllFlags(): Promise<FlagMap> {
  await Promise.all(Object.keys(TEAM_BY_CODE).map(loadFlag));
  return flagCache;
}

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}

function teamInfo(code: string | null) {
  if (!code) return { shortName: '', name: '' };
  const t = TEAM_BY_CODE[code];
  return { shortName: code, name: t?.name ?? code };
}

function drawFlag(
  ctx: CanvasRenderingContext2D, flags: FlagMap, P: Palette,
  code: string | null, x: number, y: number, w: number, h: number, dim = false,
) {
  ctx.save();
  rrect(ctx, x, y, w, h, 2); ctx.clip();
  const img = code ? flags[code] : null;
  if (img) {
    if (dim) ctx.globalAlpha = 0.4;
    ctx.drawImage(img, x, y, w, h);
  } else {
    ctx.fillStyle = P.flagEmpty;
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
  ctx.strokeStyle = P.flagBorder; ctx.lineWidth = 0.5;
  rrect(ctx, x, y, w, h, 2); ctx.stroke();
}

function drawTeamRow(
  ctx: CanvasRenderingContext2D, flags: FlagMap, P: Palette,
  x: number, y: number, w: number,
  code: string | null, state: 'winner' | 'loser' | 'tbd' | 'neutral',
) {
  const h = TEAM_H;
  const { shortName } = teamInfo(code);
  ctx.fillStyle = state === 'winner' ? P.slotWin : P.slotBg;
  rrect(ctx, x, y, w, h, 4); ctx.fill();
  if (state === 'winner') { ctx.fillStyle = P.line; ctx.fillRect(x, y, 3, h); }
  drawFlag(ctx, flags, P, code, x + 6, y + (h - 14) / 2, 20, 14);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = `${state === 'winner' ? 'bold ' : ''}11px "Courier New", monospace`;
  ctx.fillStyle = state === 'winner' ? P.slotWinText : state === 'tbd' ? P.slotTbd : P.slotText;
  ctx.fillText(shortName || '—', x + 32, y + h / 2);
}

function drawMatch(
  ctx: CanvasRenderingContext2D, flags: FlagMap, P: Palette,
  slotX: number, matchTop: number, slotW: number,
  homeCode: string | null, awayCode: string | null, winnerId: string | null,
): [number, number] {
  const hs = !homeCode ? 'tbd' : winnerId === homeCode ? 'winner' : winnerId ? 'loser' : 'neutral';
  const as_ = !awayCode ? 'tbd' : winnerId === awayCode ? 'winner' : winnerId ? 'loser' : 'neutral';
  drawTeamRow(ctx, flags, P, slotX, matchTop, slotW, homeCode, hs);
  drawTeamRow(ctx, flags, P, slotX, matchTop + TEAM_H + TEAM_GAP, slotW, awayCode, as_);
  return [matchTop + TEAM_H / 2, matchTop + TEAM_H + TEAM_GAP + TEAM_H / 2];
}

function connectBracket(
  ctx: CanvasRenderingContext2D, P: Palette, side: 'left' | 'right',
  slotEdge: number, y1: number, y2: number,
) {
  const midX = side === 'left' ? slotEdge + 7 : slotEdge - 7;
  const targetX = side === 'left' ? slotEdge + 14 : slotEdge - 14;
  ctx.strokeStyle = P.line; ctx.lineWidth = 1.2; ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(slotEdge, y1); ctx.lineTo(midX, y1);
  ctx.lineTo(midX, y2);     ctx.lineTo(slotEdge, y2);
  ctx.stroke();
  const midY = (y1 + y2) / 2;
  ctx.beginPath(); ctx.moveTo(midX, midY); ctx.lineTo(targetX, midY); ctx.stroke();
}

export async function renderBracketTicket(params: {
  userName: string;
  bracket: import('./types').Bracket;
  tree: KnockoutTree;
  winners: Record<string, string>;
  theme?: BracketTheme;
}): Promise<string> {
  const { userName, tree, winners, theme = 'dark' } = params;
  const P = theme === 'light' ? LIGHT : DARK;
  const flags = await loadAllFlags();

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = P.bg;
  ctx.fillRect(0, 0, W, H);
  if (theme === 'dark') {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, P.bgGrad[0]);
    grad.addColorStop(0.55, P.bgGrad[1]);
    grad.addColorStop(1, P.bgGrad[2]);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W * 0.85, 0, 0, W * 0.85, 0, 700);
    glow.addColorStop(0, 'rgba(139,92,246,0.20)'); glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  } else {
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 600);
    glow.addColorStop(0, 'rgba(139,92,246,0.06)'); glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  }

  // Header — FIFA style: centered title + dot decorations
  ctx.fillStyle = P.header; ctx.fillRect(0, 0, W, HEADER_H);
  ctx.strokeStyle = P.headerBorder; ctx.lineWidth = 1; ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(0, HEADER_H); ctx.lineTo(W, HEADER_H); ctx.stroke();

  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = P.appName; ctx.font = 'bold 19px "Courier New", monospace';
  ctx.fillText('FIFA WORLD CUP · 26', W / 2, HEADER_H / 2);

  // Dot decorations flanking the title
  const headerDotColors = ['#fb7185', '#a78bfa', '#fb7185', '#a78bfa', '#a78bfa', '#a78bfa', '#fb7185'];
  const headerDotSpacing = 14;
  const titleHalfW = 138;
  const dotGap = 18;
  for (let i = 0; i < headerDotColors.length; i++) {
    ctx.fillStyle = headerDotColors[i];
    const isDiamond = i === Math.floor(headerDotColors.length / 2);
    const rx = W / 2 + titleHalfW + dotGap + i * headerDotSpacing;
    const lx = W / 2 - titleHalfW - dotGap - i * headerDotSpacing;
    for (const dx of [rx, lx]) {
      if (isDiamond) {
        ctx.save(); ctx.translate(dx, HEADER_H / 2); ctx.rotate(Math.PI / 4);
        ctx.fillRect(-3.5, -3.5, 7, 7); ctx.restore();
      } else {
        ctx.beginPath(); ctx.arc(dx, HEADER_H / 2, 2.5, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  const champCode = winners[FINAL] ?? null;

  // Round column labels
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = P.mutedText; ctx.font = 'bold 8.5px "Courier New", monospace';
  const roundCols: [string, number][] = [
    ['R32',   (LX.r32Left  + LX.r32Right)  / 2],
    ['R16',   (LX.r16Left  + LX.r16Right)  / 2],
    ['QTR',   (LX.qfLeft   + LX.qfRight)   / 2],
    ['SEMI',  (LX.sfLeft   + LX.sfRight)   / 2],
    ['FINAL', LX.finalCx],
    ['SEMI',  (RX.sfLeft   + RX.sfRight)   / 2],
    ['QTR',   (RX.qfLeft   + RX.qfRight)   / 2],
    ['R16',   (RX.r16Left  + RX.r16Right)  / 2],
    ['R32',   (RX.r32Left  + RX.r32Right)  / 2],
  ];
  for (const [label, cx] of roundCols) {
    ctx.fillText(label, cx, HEADER_H + 14);
  }

  // Bracket layout
  const bracketSpan = BRACKET_BOT - BRACKET_TOP;
  const groupGap = 18;
  const r32Top = (matchIndex: number): number => {
    const gi = Math.floor(matchIndex / 2), mi = matchIndex % 2;
    const totalH = 4 * (2 * MATCH_H + TEAM_GAP + groupGap) - groupGap;
    const startY = BRACKET_TOP + (bracketSpan - totalH) / 2;
    return startY + gi * (2 * MATCH_H + TEAM_GAP + groupGap) + mi * (MATCH_H + TEAM_GAP);
  };

  const leftR32C: [number, number][] = [];
  const rightR32C: [number, number][] = [];

  LEFT_R32_GROUPS.forEach((group, gi) => {
    group.forEach((matchId, mi) => {
      const top = r32Top(gi * 2 + mi);
      const m = tree.matches[matchId]; const winner = winners[matchId] ?? null;
      const [hy, ay] = drawMatch(ctx, flags, P, LX.r32Left, top, SLOT_W_R32, m.home, m.away, winner);
      leftR32C.push([winner === m.home ? hy : winner === m.away ? ay : (hy+ay)/2, (hy+ay)/2]);
    });
  });
  RIGHT_R32_GROUPS.forEach((group, gi) => {
    group.forEach((matchId, mi) => {
      const top = r32Top(gi * 2 + mi);
      const m = tree.matches[matchId]; const winner = winners[matchId] ?? null;
      const [hy, ay] = drawMatch(ctx, flags, P, RX.r32Left, top, SLOT_W_R32, m.home, m.away, winner);
      rightR32C.push([winner === m.home ? hy : winner === m.away ? ay : (hy+ay)/2, (hy+ay)/2]);
    });
  });

  const leftR16C: number[] = [];
  LEFT_R16.forEach((matchId, i) => {
    const [w0,m0] = leftR32C[i*2], [w1,m1] = leftR32C[i*2+1];
    const midY = (m0+m1)/2;
    connectBracket(ctx, P, 'left', LX.r32Right, w0, w1);
    const m = tree.matches[matchId]; const winner = winners[matchId] ?? null;
    const [hy,ay] = drawMatch(ctx, flags, P, LX.r16Left, midY-MATCH_H/2, SLOT_W_R16, m.home, m.away, winner);
    leftR16C.push(winner===m.home?hy:winner===m.away?ay:(hy+ay)/2);
  });

  const leftQFC: number[] = [];
  LEFT_QF.forEach((matchId, i) => {
    const y0=leftR16C[i*2], y1=leftR16C[i*2+1];
    connectBracket(ctx, P, 'left', LX.r16Right, y0, y1);
    const midY=(y0+y1)/2;
    const m=tree.matches[matchId]; const winner=winners[matchId]??null;
    const [hy,ay]=drawMatch(ctx,flags,P,LX.qfLeft,midY-MATCH_H/2,SLOT_W_QF,m.home,m.away,winner);
    leftQFC.push(winner===m.home?hy:winner===m.away?ay:(hy+ay)/2);
  });

  connectBracket(ctx,P,'left',LX.qfRight,leftQFC[0],leftQFC[1]);
  const sfMidL=(leftQFC[0]+leftQFC[1])/2;
  let sfWinL=sfMidL;
  {
    const m=tree.matches[LEFT_SF]; const winner=winners[LEFT_SF]??null;
    const [hy,ay]=drawMatch(ctx,flags,P,LX.sfLeft,sfMidL-MATCH_H/2,SLOT_W_SF,m.home,m.away,winner);
    sfWinL=winner===m.home?hy:winner===m.away?ay:(hy+ay)/2;
    ctx.strokeStyle=P.line;ctx.lineWidth=1.2;ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(LX.sfRight,sfWinL);ctx.lineTo(LX.sfRight+14,sfWinL);ctx.stroke();
  }

  const rightR16C: number[] = [];
  RIGHT_R16.forEach((matchId, i) => {
    const [w0,m0]=rightR32C[i*2],[w1,m1]=rightR32C[i*2+1];
    const midY=(m0+m1)/2, midX=RX.r32Left-7, tX=RX.r32Left-14;
    ctx.strokeStyle=P.line;ctx.lineWidth=1.2;ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(RX.r32Left,w0);ctx.lineTo(midX,w0);ctx.lineTo(midX,w1);ctx.lineTo(RX.r32Left,w1);ctx.stroke();
    ctx.beginPath();ctx.moveTo(midX,midY);ctx.lineTo(tX,midY);ctx.stroke();
    const m=tree.matches[matchId];const winner=winners[matchId]??null;
    const [hy,ay]=drawMatch(ctx,flags,P,RX.r16Left,midY-MATCH_H/2,SLOT_W_R16,m.home,m.away,winner);
    rightR16C.push(winner===m.home?hy:winner===m.away?ay:(hy+ay)/2);
  });

  const rightQFC: number[] = [];
  RIGHT_QF.forEach((matchId, i) => {
    const y0=rightR16C[i*2],y1=rightR16C[i*2+1];
    const midY=(y0+y1)/2,midX=RX.r16Left-7,tX=RX.r16Left-14;
    ctx.strokeStyle=P.line;ctx.lineWidth=1.2;ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(RX.r16Left,y0);ctx.lineTo(midX,y0);ctx.lineTo(midX,y1);ctx.lineTo(RX.r16Left,y1);ctx.stroke();
    ctx.beginPath();ctx.moveTo(midX,midY);ctx.lineTo(tX,midY);ctx.stroke();
    const m=tree.matches[matchId];const winner=winners[matchId]??null;
    const [hy,ay]=drawMatch(ctx,flags,P,RX.qfLeft,midY-MATCH_H/2,SLOT_W_QF,m.home,m.away,winner);
    rightQFC.push(winner===m.home?hy:winner===m.away?ay:(hy+ay)/2);
  });

  const sfMidR=(rightQFC[0]+rightQFC[1])/2;
  let sfWinR=sfMidR;
  {
    const midX=RX.qfLeft-7,tX=RX.qfLeft-14;
    ctx.strokeStyle=P.line;ctx.lineWidth=1.2;ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(RX.qfLeft,rightQFC[0]);ctx.lineTo(midX,rightQFC[0]);ctx.lineTo(midX,rightQFC[1]);ctx.lineTo(RX.qfLeft,rightQFC[1]);ctx.stroke();
    ctx.beginPath();ctx.moveTo(midX,sfMidR);ctx.lineTo(tX,sfMidR);ctx.stroke();
    const m=tree.matches[RIGHT_SF];const winner=winners[RIGHT_SF]??null;
    const [hy,ay]=drawMatch(ctx,flags,P,RX.sfLeft,sfMidR-MATCH_H/2,SLOT_W_SF,m.home,m.away,winner);
    sfWinR=winner===m.home?hy:winner===m.away?ay:(hy+ay)/2;
    ctx.strokeStyle=P.line;ctx.lineWidth=1.2;ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(RX.sfLeft,sfWinR);ctx.lineTo(RX.sfLeft-14,sfWinR);ctx.stroke();
  }

  // Final champion box
  const fbW=120,fbH=84,fbX=LX.finalCx-60,fbY=(sfWinL+sfWinR)/2-42;
  ctx.fillStyle=P.finalBox; rrect(ctx,fbX,fbY,fbW,fbH,8); ctx.fill();
  ctx.strokeStyle=P.finalBorder;ctx.lineWidth=2; rrect(ctx,fbX,fbY,fbW,fbH,8); ctx.stroke();
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='22px sans-serif';
  ctx.fillText('🏆',LX.finalCx,fbY+20);
  if (champCode) {
    drawFlag(ctx,flags,P,champCode,LX.finalCx-28,fbY+36,22,15);
    ctx.fillStyle=P.finalText;ctx.font='bold 13px "Courier New",monospace';
    ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText(champCode,LX.finalCx-2,fbY+44);
  } else {
    ctx.fillStyle=P.mutedText;ctx.font='bold 13px "Courier New",monospace';
    ctx.textAlign='center';ctx.fillText('???',LX.finalCx,fbY+44);
  }
  ctx.textAlign='center';ctx.fillStyle=P.finalLabel;ctx.font='bold 7px "Courier New",monospace';
  ctx.fillText('CHAMPION',LX.finalCx,fbY+fbH-10);

  // Centre dashed divider
  ctx.strokeStyle=P.dash;ctx.lineWidth=1;ctx.setLineDash([4,6]);
  ctx.beginPath();ctx.moveTo(LX.finalCx,BRACKET_TOP);ctx.lineTo(LX.finalCx,BRACKET_BOT);ctx.stroke();
  ctx.setLineDash([]);

  // Footer
  ctx.fillStyle=P.header;ctx.fillRect(0,H-FOOTER_H,W,FOOTER_H);
  ctx.strokeStyle=P.headerBorder;ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(0,H-FOOTER_H);ctx.lineTo(W,H-FOOTER_H);ctx.stroke();
  ctx.textBaseline='middle';ctx.textAlign='left';
  ctx.fillStyle=P.appName;ctx.font='bold 12px "Georgia",serif';
  ctx.fillText('wcpredictor.fun',24,H-FOOTER_H/2);
  ctx.textAlign='right';ctx.fillStyle=P.footerSub;ctx.font='10px "Courier New",monospace';
  ctx.fillText((userName || 'Anonymous').toUpperCase(),W-24,H-FOOTER_H/2);

  return canvas.toDataURL('image/png');
}
