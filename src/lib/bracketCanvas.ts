/**
 * Renders a 1080×1080 "ticket" style bracket image to a canvas and returns
 * a PNG data URL. Flags are drawn from real flag PNGs (flagcdn, CORS-enabled)
 * so the canvas stays exportable.
 */

import { TEAM_BY_CODE } from './tournament';
import type { KnockoutTree } from './tournament';

// ── ISO-2 map for flagcdn.com (shared shape with the predict UI) ──────────────
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

// ── Colour palette (ticket theme) ────────────────────────────────────────────
const C = {
  bg:        '#f0e6c8',
  header:    '#1a3d2b',
  gold:      '#b8962e',
  goldLight: '#d4ad45',
  text:      '#1a2e1a',
  muted:     '#7a6e50',
  slotBg:    'rgba(255,255,255,0.55)',
  slotWin:   'rgba(184,150,46,0.22)',
  line:      '#b8962e',
  dash:      'rgba(26,61,43,0.25)',
};

// ── Bracket ordering ──────────────────────────────────────────────────────────
const LEFT_R32_GROUPS = [
  ['M74', 'M77'],
  ['M73', 'M75'],
  ['M83', 'M84'],
  ['M81', 'M82'],
] as const;
const LEFT_R16  = ['M89', 'M90', 'M93', 'M94'] as const;
const LEFT_QF   = ['M97', 'M98'] as const;
const LEFT_SF   = 'M101';

const RIGHT_R32_GROUPS = [
  ['M76', 'M78'],
  ['M79', 'M80'],
  ['M85', 'M87'],
  ['M86', 'M88'],
] as const;
const RIGHT_R16 = ['M91', 'M92', 'M96', 'M95'] as const;
const RIGHT_QF  = ['M99', 'M100'] as const;
const RIGHT_SF  = 'M102';

const FINAL = 'M104';

// ── Layout constants ──────────────────────────────────────────────────────────
const W = 1080;
const H = 1080;
const HEADER_H = 68;
const META_H   = 26;
const CHAMP_H  = 296;
const ROAD_Y   = HEADER_H + META_H + CHAMP_H + 12;
const BRACKET_TOP = ROAD_Y + 28;
const BRACKET_BOT = H - 52;

const TEAM_H = 18;
const TEAM_GAP = 4;
const MATCH_H = TEAM_H * 2 + TEAM_GAP;

const LX = {
  r32Left:  20,   r32Right: 122,
  r16Left: 136,   r16Right: 228,
  qfLeft:  242,   qfRight:  324,
  sfLeft:  338,   sfRight:  416,
  finalCx: 540,
};
const RX = {
  sfRight: W - LX.sfLeft,       sfLeft: W - LX.sfRight,
  qfRight: W - LX.qfLeft,       qfLeft: W - LX.qfRight,
  r16Right: W - LX.r16Left,     r16Left: W - LX.r16Right,
  r32Right: W - LX.r32Left,     r32Left: W - LX.r32Right,
};
const SLOT_W_R32 = LX.r32Right - LX.r32Left;
const SLOT_W_R16 = LX.r16Right - LX.r16Left;
const SLOT_W_QF  = LX.qfRight  - LX.qfLeft;
const SLOT_W_SF  = LX.sfRight  - LX.sfLeft;

// ── Flag image loading (cached, CORS-enabled) ─────────────────────────────────
type FlagMap = Record<string, HTMLImageElement>;
const flagCache: FlagMap = {};

function loadFlag(code: string): Promise<HTMLImageElement | null> {
  const iso = ISO2[code];
  if (!iso) return Promise.resolve(null);
  if (flagCache[code]) return Promise.resolve(flagCache[code]);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { flagCache[code] = img; resolve(img); };
    img.onerror = () => resolve(null);
    img.src = `https://flagcdn.com/w80/${iso}.png`;
  });
}

async function loadAllFlags(): Promise<FlagMap> {
  const codes = Object.keys(TEAM_BY_CODE);
  await Promise.all(codes.map(loadFlag));
  return flagCache;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function teamInfo(code: string | null) {
  if (!code) return { shortName: '', name: '' };
  const t = TEAM_BY_CODE[code];
  return { shortName: code, name: t?.name ?? code };
}

/** Draw a flag image (or a neutral box) at the given rect, dimmed if loser. */
function drawFlag(
  ctx: CanvasRenderingContext2D,
  flags: FlagMap,
  code: string | null,
  x: number, y: number, w: number, h: number,
  dim = false,
) {
  ctx.save();
  rrect(ctx, x, y, w, h, 2);
  ctx.clip();
  const img = code ? flags[code] : null;
  if (img) {
    if (dim) ctx.globalAlpha = 0.4;
    ctx.drawImage(img, x, y, w, h);
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
  // hairline border
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 0.5;
  rrect(ctx, x, y, w, h, 2);
  ctx.stroke();
}

function drawTeamRow(
  ctx: CanvasRenderingContext2D,
  flags: FlagMap,
  x: number, y: number, w: number,
  code: string | null,
  state: 'winner' | 'loser' | 'tbd' | 'neutral',
) {
  const h = TEAM_H;
  const { shortName } = teamInfo(code);

  ctx.fillStyle = state === 'winner' ? C.slotWin : C.slotBg;
  rrect(ctx, x, y, w, h, 3);
  ctx.fill();

  if (state === 'winner') {
    ctx.fillStyle = C.gold;
    ctx.fillRect(x, y, 2.5, h);
  }

  // Real flag image (full opacity for losers too)
  const fw = 16, fh = 11;
  drawFlag(ctx, flags, code, x + 5, y + (h - fh) / 2, fw, fh, false);

  // Team code
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `${state === 'winner' ? 'bold ' : ''}8.5px "Courier New", monospace`;
  ctx.fillStyle =
    state === 'winner' ? C.header :
    state === 'tbd'    ? C.muted : C.text;
  ctx.fillText(shortName || '—', x + 26, y + h / 2);
}

function drawMatch(
  ctx: CanvasRenderingContext2D,
  flags: FlagMap,
  slotX: number, matchTop: number, slotW: number,
  homeCode: string | null, awayCode: string | null,
  winnerId: string | null,
): [number, number] {
  const homeState =
    !homeCode ? 'tbd' : winnerId === homeCode ? 'winner' : winnerId ? 'loser' : 'neutral';
  const awayState =
    !awayCode ? 'tbd' : winnerId === awayCode ? 'winner' : winnerId ? 'loser' : 'neutral';

  drawTeamRow(ctx, flags, slotX, matchTop, slotW, homeCode, homeState);
  drawTeamRow(ctx, flags, slotX, matchTop + TEAM_H + TEAM_GAP, slotW, awayCode, awayState);

  return [matchTop + TEAM_H / 2, matchTop + TEAM_H + TEAM_GAP + TEAM_H / 2];
}

function connectBracket(
  ctx: CanvasRenderingContext2D,
  side: 'left' | 'right',
  slotEdge: number,
  y1: number, y2: number,
) {
  const midX = side === 'left' ? slotEdge + 7 : slotEdge - 7;
  const targetX = side === 'left' ? slotEdge + 14 : slotEdge - 14;

  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(slotEdge, y1);
  ctx.lineTo(midX, y1);
  ctx.lineTo(midX, y2);
  ctx.lineTo(slotEdge, y2);
  ctx.stroke();

  const midY = (y1 + y2) / 2;
  ctx.beginPath();
  ctx.moveTo(midX, midY);
  ctx.lineTo(targetX, midY);
  ctx.stroke();
}

// ── Main renderer ─────────────────────────────────────────────────────────────
export async function renderBracketTicket(params: {
  userName: string;
  bracket: import('./types').Bracket;
  tree: KnockoutTree;
  winners: Record<string, string>;
}): Promise<string> {
  const { userName, tree, winners } = params;
  const flags = await loadAllFlags();

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(0,0,0,0.03)';
  for (let y = 0; y < H; y += 8) ctx.fillRect(0, y, W, 1);

  // Header band
  ctx.fillStyle = C.header;
  ctx.fillRect(0, 0, W, HEADER_H);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = C.goldLight;
  ctx.font = 'bold 22px "Georgia", serif';
  ctx.fillText('BAGGIO', 28, HEADER_H / 2);
  ctx.textAlign = 'right';
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.letterSpacing = '4px';
  ctx.fillText('THE FINAL', W - 28, HEADER_H / 2);
  ctx.letterSpacing = '0px';

  // Metadata row
  const metaY = HEADER_H + META_H / 2;
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 8.5px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = C.gold;
  ctx.fillText('ADMIT ONE', 28, metaY);
  ctx.textAlign = 'right';
  ctx.fillStyle = C.muted;
  ctx.fillText(`HOLDER  ·  ${(userName || 'Anonymous').toUpperCase()}`, W - 28, metaY);
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 0.7;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(28, HEADER_H + META_H - 2);
  ctx.lineTo(W - 28, HEADER_H + META_H - 2);
  ctx.stroke();

  // Champion section
  const champX = 32;
  const champCode = winners[FINAL] ?? null;
  const { name: champName } = teamInfo(champCode);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.muted;
  ctx.font = 'bold 8.5px "Courier New", monospace';
  ctx.fillText('PRESENTING YOUR CHAMPION', champX, HEADER_H + META_H + 20);

  // Big champion flag (real image)
  const bigFlagY = HEADER_H + META_H + 34;
  drawFlag(ctx, flags, champCode, champX, bigFlagY, 96, 64, false);

  // Champion name
  ctx.fillStyle = C.header;
  ctx.font = `900 ${champCode ? 78 : 50}px "Georgia", serif`;
  const nameY = bigFlagY + 64 + 70;
  ctx.fillText(champCode ? champName.toUpperCase() : 'TBD', champX, nameY);

  // Subtitle + gold rule
  ctx.fillStyle = C.gold;
  ctx.font = 'bold 9px "Courier New", monospace';
  ctx.fillText('FIFA WORLD CUP 2026 CHAMPION', champX, nameY + 16);
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(champX, nameY + 24);
  ctx.lineTo(champX + 280, nameY + 24);
  ctx.stroke();

  // "THE ROAD TO THE FINAL"
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.muted;
  ctx.font = 'bold 8.5px "Courier New", monospace';
  ctx.fillText('THE ROAD TO THE FINAL', W / 2, ROAD_Y + 14);
  ctx.strokeStyle = C.dash;
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(28, ROAD_Y + 9); ctx.lineTo(W / 2 - 115, ROAD_Y + 9); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W / 2 + 115, ROAD_Y + 9); ctx.lineTo(W - 28, ROAD_Y + 9); ctx.stroke();

  // Bracket layout
  const r32Top = (matchIndex: number): number => {
    const groupIndex = Math.floor(matchIndex / 2);
    const withinGroup = matchIndex % 2;
    const groupGap = 14;
    return BRACKET_TOP + groupIndex * (2 * MATCH_H + TEAM_GAP + groupGap) + withinGroup * (MATCH_H + TEAM_GAP);
  };

  const leftR32Centers: [number, number][] = [];
  const rightR32Centers: [number, number][] = [];

  LEFT_R32_GROUPS.forEach((group, gi) => {
    group.forEach((matchId, mi) => {
      const idx = gi * 2 + mi;
      const top = r32Top(idx);
      const m = tree.matches[matchId];
      const winner = winners[matchId] ?? null;
      const [hy, ay] = drawMatch(ctx, flags, LX.r32Left, top, SLOT_W_R32, m.home, m.away, winner);
      const wy = winner === m.home ? hy : winner === m.away ? ay : (hy + ay) / 2;
      leftR32Centers.push([wy, (hy + ay) / 2]);
    });
  });
  RIGHT_R32_GROUPS.forEach((group, gi) => {
    group.forEach((matchId, mi) => {
      const idx = gi * 2 + mi;
      const top = r32Top(idx);
      const m = tree.matches[matchId];
      const winner = winners[matchId] ?? null;
      const [hy, ay] = drawMatch(ctx, flags, RX.r32Left, top, SLOT_W_R32, m.home, m.away, winner);
      const wy = winner === m.home ? hy : winner === m.away ? ay : (hy + ay) / 2;
      rightR32Centers.push([wy, (hy + ay) / 2]);
    });
  });

  const leftR16Centers: number[] = [];
  LEFT_R16.forEach((matchId, i) => {
    const [w0, m0] = leftR32Centers[i * 2];
    const [w1, m1] = leftR32Centers[i * 2 + 1];
    const midY = (m0 + m1) / 2;
    connectBracket(ctx, 'left', LX.r32Right, w0, w1);
    const m = tree.matches[matchId];
    const winner = winners[matchId] ?? null;
    const [hy, ay] = drawMatch(ctx, flags, LX.r16Left, midY - MATCH_H / 2, SLOT_W_R16, m.home, m.away, winner);
    leftR16Centers.push(winner === m.home ? hy : winner === m.away ? ay : (hy + ay) / 2);
  });

  const leftQFCenters: number[] = [];
  LEFT_QF.forEach((matchId, i) => {
    const y0 = leftR16Centers[i * 2], y1 = leftR16Centers[i * 2 + 1];
    const midY = (y0 + y1) / 2;
    connectBracket(ctx, 'left', LX.r16Right, y0, y1);
    const m = tree.matches[matchId];
    const winner = winners[matchId] ?? null;
    const [hy, ay] = drawMatch(ctx, flags, LX.qfLeft, midY - MATCH_H / 2, SLOT_W_QF, m.home, m.away, winner);
    leftQFCenters.push(winner === m.home ? hy : winner === m.away ? ay : (hy + ay) / 2);
  });

  const sfMidY_L = (leftQFCenters[0] + leftQFCenters[1]) / 2;
  connectBracket(ctx, 'left', LX.qfRight, leftQFCenters[0], leftQFCenters[1]);
  let sfWinnerY_L = sfMidY_L;
  {
    const m = tree.matches[LEFT_SF];
    const winner = winners[LEFT_SF] ?? null;
    const [hy, ay] = drawMatch(ctx, flags, LX.sfLeft, sfMidY_L - MATCH_H / 2, SLOT_W_SF, m.home, m.away, winner);
    sfWinnerY_L = winner === m.home ? hy : winner === m.away ? ay : (hy + ay) / 2;
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(LX.sfRight, sfWinnerY_L); ctx.lineTo(LX.sfRight + 14, sfWinnerY_L); ctx.stroke();
  }

  // Right side mirrored
  const rightR16Centers: number[] = [];
  RIGHT_R16.forEach((matchId, i) => {
    const [w0, m0] = rightR32Centers[i * 2];
    const [w1, m1] = rightR32Centers[i * 2 + 1];
    const midY = (m0 + m1) / 2;
    const midX = RX.r32Left - 7, targetX = RX.r32Left - 14;
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(RX.r32Left, w0); ctx.lineTo(midX, w0); ctx.lineTo(midX, w1); ctx.lineTo(RX.r32Left, w1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(midX, midY); ctx.lineTo(targetX, midY); ctx.stroke();
    const m = tree.matches[matchId];
    const winner = winners[matchId] ?? null;
    const [hy, ay] = drawMatch(ctx, flags, RX.r16Left, midY - MATCH_H / 2, SLOT_W_R16, m.home, m.away, winner);
    rightR16Centers.push(winner === m.home ? hy : winner === m.away ? ay : (hy + ay) / 2);
  });

  const rightQFCenters: number[] = [];
  RIGHT_QF.forEach((matchId, i) => {
    const y0 = rightR16Centers[i * 2], y1 = rightR16Centers[i * 2 + 1];
    const midY = (y0 + y1) / 2;
    const midX = RX.r16Left - 7, targetX = RX.r16Left - 14;
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(RX.r16Left, y0); ctx.lineTo(midX, y0); ctx.lineTo(midX, y1); ctx.lineTo(RX.r16Left, y1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(midX, midY); ctx.lineTo(targetX, midY); ctx.stroke();
    const m = tree.matches[matchId];
    const winner = winners[matchId] ?? null;
    const [hy, ay] = drawMatch(ctx, flags, RX.qfLeft, midY - MATCH_H / 2, SLOT_W_QF, m.home, m.away, winner);
    rightQFCenters.push(winner === m.home ? hy : winner === m.away ? ay : (hy + ay) / 2);
  });

  const sfMidY_R = (rightQFCenters[0] + rightQFCenters[1]) / 2;
  let sfWinnerY_R = sfMidY_R;
  {
    const midX = RX.qfLeft - 7, targetX = RX.qfLeft - 14;
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(RX.qfLeft, rightQFCenters[0]); ctx.lineTo(midX, rightQFCenters[0]); ctx.lineTo(midX, rightQFCenters[1]); ctx.lineTo(RX.qfLeft, rightQFCenters[1]); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(midX, sfMidY_R); ctx.lineTo(targetX, sfMidY_R); ctx.stroke();
    const m = tree.matches[RIGHT_SF];
    const winner = winners[RIGHT_SF] ?? null;
    const [hy, ay] = drawMatch(ctx, flags, RX.sfLeft, sfMidY_R - MATCH_H / 2, SLOT_W_SF, m.home, m.away, winner);
    sfWinnerY_R = winner === m.home ? hy : winner === m.away ? ay : (hy + ay) / 2;
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(RX.sfLeft, sfWinnerY_R); ctx.lineTo(RX.sfLeft - 14, sfWinnerY_R); ctx.stroke();
  }

  // ── Final / Champion box (centre) ─────────────────────────────────────────
  const finalBoxW = 116;
  const finalBoxH = 78;
  const finalBoxX = LX.finalCx - finalBoxW / 2;
  const finalBoxY = (sfWinnerY_L + sfWinnerY_R) / 2 - finalBoxH / 2;

  ctx.fillStyle = champCode ? C.header : 'rgba(26,61,43,0.12)';
  rrect(ctx, finalBoxX, finalBoxY, finalBoxW, finalBoxH, 7);
  ctx.fill();
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 2;
  rrect(ctx, finalBoxX, finalBoxY, finalBoxW, finalBoxH, 7);
  ctx.stroke();

  // Trophy + flag + champion code inside the box
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '20px sans-serif';
  ctx.fillText('🏆', LX.finalCx, finalBoxY + 18);

  // Champion flag image
  drawFlag(ctx, flags, champCode, LX.finalCx - 30, finalBoxY + 32, 24, 16, false);
  ctx.fillStyle = champCode ? '#fff' : C.muted;
  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(champCode ?? '???', LX.finalCx - 2, finalBoxY + 41);

  ctx.textAlign = 'center';
  ctx.fillStyle = C.goldLight;
  ctx.font = 'bold 7px "Courier New", monospace';
  ctx.fillText('CHAMPION', LX.finalCx, finalBoxY + finalBoxH - 11);

  // Dashed separator
  ctx.strokeStyle = C.dash;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(LX.finalCx, BRACKET_TOP - 8);
  ctx.lineTo(LX.finalCx, BRACKET_BOT + 8);
  ctx.stroke();
  ctx.setLineDash([]);

  // Footer
  const footerY = H - 26;
  ctx.fillStyle = C.header;
  ctx.fillRect(0, H - 42, W, 42);
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 13px "Georgia", serif';
  ctx.fillStyle = C.goldLight;
  ctx.textAlign = 'left';
  ctx.fillText('baggio.app', 28, footerY);
  ctx.textAlign = 'right';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = C.goldLight;
  ctx.fillText('MMXXVI', W - 28, footerY - 6);
  ctx.fillStyle = C.muted;
  ctx.fillText('N° 2026', W - 28, footerY + 7);

  return canvas.toDataURL('image/png');
}
