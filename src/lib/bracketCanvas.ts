/**
 * Renders a 1080×1080 "ticket" style bracket image to a canvas and returns
 * a PNG data URL. All drawing uses emoji flags + text — no cross-origin images,
 * so the canvas is never tainted and Download works reliably.
 */

import { TEAM_BY_CODE } from './tournament';
import type { KnockoutTree } from './tournament';

// ── Colour palette (ticket theme) ────────────────────────────────────────────
const C = {
  bg:        '#f0e6c8',   // parchment
  bgDark:    '#e8d9b0',   // slightly darker parchment stripe
  header:    '#1a3d2b',   // dark forest green
  gold:      '#b8962e',   // muted antique gold
  goldLight: '#d4ad45',
  text:      '#1a2e1a',   // near-black green
  muted:     '#7a6e50',   // warm gray-brown
  slotBg:    'rgba(255,255,255,0.55)',
  slotWin:   'rgba(184,150,46,0.22)',
  slotLose:  'rgba(0,0,0,0.06)',
  line:      '#b8962e',
  dash:      'rgba(26,61,43,0.25)',
};

// ── Tournament bracket ordering (left side feeds SF1=M101, right feeds SF2=M102)
// Each sub-array is [matchA, matchB] that feed into one R16 match.
const LEFT_R32_GROUPS = [
  ['M74', 'M77'], // → M89 → M97
  ['M73', 'M75'], // → M90 → M97
  ['M83', 'M84'], // → M93 → M98
  ['M81', 'M82'], // → M94 → M98
] as const;

const LEFT_R16  = ['M89', 'M90', 'M93', 'M94'] as const;
const LEFT_QF   = ['M97', 'M98'] as const;
const LEFT_SF   = 'M101';

const RIGHT_R32_GROUPS = [
  ['M76', 'M78'], // → M91 → M99
  ['M79', 'M80'], // → M92 → M99
  ['M85', 'M87'], // → M96 → M100
  ['M86', 'M88'], // → M95 → M100
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
const CHAMP_H  = 296;    // champion section height
const ROAD_Y   = HEADER_H + META_H + CHAMP_H + 12; // y of "THE ROAD TO THE FINAL"
const BRACKET_TOP  = ROAD_Y + 28;
const BRACKET_BOT  = H - 52;


// 8 R32 matches per side
const TEAM_H = 18;                          // height of one team slot row
const TEAM_GAP = 4;                         // gap between the two rows of a match
const MATCH_H = TEAM_H * 2 + TEAM_GAP;     // 40px total per match pair

// Column x-positions (left side: R32 → SF, progressing right toward center)
const LX = {
  r32Left:  20,   r32Right: 122,   // R32 slot x range
  r16Left: 136,   r16Right: 228,
  qfLeft:  242,   qfRight:  324,
  sfLeft:  338,   sfRight:  416,
  finalCx: 540,                     // center x of champion box
};

// Right side (mirrored — SF on right, R32 far right)
const RX = {
  sfRight: W - LX.sfLeft,       sfLeft: W - LX.sfRight,
  qfRight: W - LX.qfLeft,       qfLeft: W - LX.qfRight,
  r16Right: W - LX.r16Left,     r16Left: W - LX.r16Right,
  r32Right: W - LX.r32Left,     r32Left: W - LX.r32Right,
};

const SLOT_W_R32 = LX.r32Right - LX.r32Left;   // 102
const SLOT_W_R16 = LX.r16Right - LX.r16Left;   // 92
const SLOT_W_QF  = LX.qfRight  - LX.qfLeft;    // 82
const SLOT_W_SF  = LX.sfRight  - LX.sfLeft;    // 78

// ── Helpers ───────────────────────────────────────────────────────────────────

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function teamInfo(code: string | null) {
  if (!code) return { flag: '·', shortName: '???', name: '???' };
  const t = TEAM_BY_CODE[code];
  return { flag: t?.flag ?? '🏳', shortName: code, name: t?.name ?? code };
}

/**
 * Draw one team row at (x, y) with given slot width.
 * state: 'winner' | 'loser' | 'tbd' | 'neutral'
 */
function drawTeamRow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number,
  code: string | null,
  state: 'winner' | 'loser' | 'tbd' | 'neutral',
) {
  const h = TEAM_H;
  const { flag, shortName } = teamInfo(code);

  // Slot background
  ctx.fillStyle =
    state === 'winner' ? C.slotWin :
    state === 'loser'  ? C.slotLose : C.slotBg;
  rrect(ctx, x, y, w, h, 3);
  ctx.fill();

  // Left accent stripe for winner
  if (state === 'winner') {
    ctx.fillStyle = C.gold;
    ctx.fillRect(x, y, 2.5, h);
  }

  // Flag emoji
  const flagSize = 11;
  ctx.font = `${flagSize}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = state === 'loser' ? '#aaa' : C.text;
  ctx.fillText(code ? flag : '·', x + 5, y + h / 2);

  // Team code
  ctx.font = `${state === 'winner' ? 'bold ' : ''}8.5px "Courier New", monospace`;
  ctx.fillStyle =
    state === 'winner' ? C.header :
    state === 'loser'  ? '#bbb' :
    state === 'tbd'    ? C.muted : C.text;
  ctx.fillText(shortName, x + 21, y + h / 2);
}

/**
 * Draw a match (two team rows stacked) and return [y_center_home, y_center_away].
 */
function drawMatch(
  ctx: CanvasRenderingContext2D,
  slotX: number, matchTop: number, slotW: number,
  homeCode: string | null, awayCode: string | null,
  winnerId: string | null,
): [number, number] {
  const homeState =
    !homeCode ? 'tbd' :
    winnerId === homeCode ? 'winner' :
    winnerId ? 'loser' : 'neutral';

  const awayState =
    !awayCode ? 'tbd' :
    winnerId === awayCode ? 'winner' :
    winnerId ? 'loser' : 'neutral';

  drawTeamRow(ctx, slotX, matchTop, slotW, homeCode, homeState);
  drawTeamRow(ctx, slotX, matchTop + TEAM_H + TEAM_GAP, slotW, awayCode, awayState);

  return [matchTop + TEAM_H / 2, matchTop + TEAM_H + TEAM_GAP + TEAM_H / 2];
}

/**
 * Draw bracket connector lines.
 * On the LEFT side: slots advance rightward → lines go right.
 * On the RIGHT side: slots advance leftward → lines go left.
 */
function connectBracket(
  ctx: CanvasRenderingContext2D,
  side: 'left' | 'right',
  slotRight: number,   // right edge of source column (left side) or left edge (right side)
  y1: number, y2: number,  // two source winner centers
) {
  const midX = side === 'left' ? slotRight + 7 : slotRight - 7;
  const targetX = side === 'left' ? slotRight + 14 : slotRight - 14;

  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1;
  ctx.setLineDash([]);

  ctx.beginPath();
  // From y1 horizontally to midX
  ctx.moveTo(side === 'left' ? slotRight : slotRight, y1);
  ctx.lineTo(midX, y1);
  // Vertical to y2
  ctx.lineTo(midX, y2);
  // From y2 horizontally back to slotRight level (toward target)
  ctx.lineTo(side === 'left' ? slotRight : slotRight, y2);
  ctx.stroke();

  // Horizontal line from midpoint of y1-y2 to target
  const midY = (y1 + y2) / 2;
  ctx.beginPath();
  ctx.moveTo(midX, midY);
  ctx.lineTo(targetX, midY);
  ctx.stroke();
}

// ── Main renderer ─────────────────────────────────────────────────────────────

export function renderBracketTicket(params: {
  userName: string;
  bracket: import('./types').Bracket;
  tree: KnockoutTree;
  winners: Record<string, string>;
}): string {
  const { userName, tree, winners } = params;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ── Background ───────────────────────────────────────────────────────────
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle texture stripes
  ctx.fillStyle = 'rgba(0,0,0,0.03)';
  for (let y = 0; y < H; y += 8) {
    ctx.fillRect(0, y, W, 1);
  }

  // ── Header band ──────────────────────────────────────────────────────────
  ctx.fillStyle = C.header;
  ctx.fillRect(0, 0, W, HEADER_H);

  // "BAGGIO" wordmark
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = C.goldLight;
  ctx.font = 'bold 22px "Georgia", serif';
  ctx.fillText('BAGGIO', 28, HEADER_H / 2);

  // "THE FINAL"
  ctx.textAlign = 'right';
  ctx.fillStyle = C.goldLight;
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.letterSpacing = '4px';
  ctx.fillText('THE FINAL', W - 28, HEADER_H / 2);
  ctx.letterSpacing = '0px';

  // ── Metadata row ─────────────────────────────────────────────────────────
  const metaY = HEADER_H + META_H / 2;
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 8.5px "Courier New", monospace';

  ctx.textAlign = 'left';
  ctx.fillStyle = C.gold;
  ctx.fillText('ADMIT ONE', 28, metaY);

  const holderText = `HOLDER  ·  ${(userName || 'Anonymous').toUpperCase()}`;
  ctx.textAlign = 'right';
  ctx.fillStyle = C.muted;
  ctx.fillText(holderText, W - 28, metaY);

  // Thin gold divider under meta
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 0.7;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(28, HEADER_H + META_H - 2);
  ctx.lineTo(W - 28, HEADER_H + META_H - 2);
  ctx.stroke();

  // ── Champion section ─────────────────────────────────────────────────────
  const champX = 32;
  let cy = HEADER_H + META_H + 22;

  const champCode  = winners[FINAL] ?? null;
  const ruCode     = champCode
    ? (tree.matches[FINAL].home === champCode
        ? tree.matches[FINAL].away
        : tree.matches[FINAL].home)
    : null;
  const { flag: champFlag, name: champName } = teamInfo(champCode);
  const { name: ruName } = teamInfo(ruCode);

  // Eyebrow
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.muted;
  ctx.font = 'bold 8.5px "Courier New", monospace';
  ctx.fillText('PRESENTING YOUR CHAMPION', champX, cy);
  cy += 18;

  // Flag emoji (large)
  ctx.font = '80px sans-serif';
  ctx.fillText(champCode ? champFlag : '🏆', champX, cy + 72);
  cy += 90;

  // Champion name
  ctx.fillStyle = C.header;
  ctx.font = `900 ${champCode ? 82 : 52}px "Georgia", serif`;
  ctx.fillText(champCode ? champName.toUpperCase() : 'TBD', champX, cy);
  cy += 16;

  // Subtitle
  ctx.fillStyle = C.gold;
  ctx.font = 'bold 9px "Courier New", monospace';
  ctx.fillText('FIFA WORLD CUP 2026 CHAMPION', champX, cy);
  cy += 12;

  // Gold rule
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(champX, cy);
  ctx.lineTo(champX + 280, cy);
  ctx.stroke();
  cy += 18;

  // Runner-up line
  if (ruCode) {
    ctx.fillStyle = C.text;
    ctx.font = 'italic 14px "Georgia", serif';
    ctx.fillText(`def. ${ruName} in the final`, champX, cy);
  } else {
    ctx.fillStyle = C.muted;
    ctx.font = 'italic 13px "Georgia", serif';
    ctx.fillText('Pick your champion in the Final', champX, cy);
  }

  // Spice score in champion section right side
  ctx.textAlign = 'right';
  ctx.fillStyle = C.gold;
  ctx.font = 'bold 8.5px "Courier New", monospace';
  ctx.fillText('N° 2026', W - 28, H - 60);

  // ── "THE ROAD TO THE FINAL" ───────────────────────────────────────────────
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.muted;
  ctx.font = 'bold 8.5px "Courier New", monospace';
  ctx.fillText('THE ROAD TO THE FINAL', W / 2, ROAD_Y + 14);

  // Decorative lines flanking the label
  ctx.strokeStyle = C.dash;
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(28, ROAD_Y + 9); ctx.lineTo(W / 2 - 115, ROAD_Y + 9); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W / 2 + 115, ROAD_Y + 9); ctx.lineTo(W - 28, ROAD_Y + 9); ctx.stroke();

  // ── Draw bracket ─────────────────────────────────────────────────────────
  // Helper: get the y-center of match i (0-indexed) among 8 R32 matches.
  // The 4 groups of 2 matches each are separated by a slightly larger gap.
  const r32Top = (matchIndex: number): number => {
    const groupIndex = Math.floor(matchIndex / 2);
    const withinGroup = matchIndex % 2;
    const groupGap = 14; // extra gap between groups of 2
    return (
      BRACKET_TOP +
      groupIndex * (2 * MATCH_H + TEAM_GAP + groupGap) +
      withinGroup * (MATCH_H + TEAM_GAP)
    );
  };

  // Collect R32 match centers for connecting lines
  const leftR32Centers: [number, number][] = [];  // [winnerCenterY, matchMidY]
  const rightR32Centers: [number, number][] = [];

  // Left R32 matches
  LEFT_R32_GROUPS.forEach((group, gi) => {
    group.forEach((matchId, mi) => {
      const idx = gi * 2 + mi;
      const top = r32Top(idx);
      const m = tree.matches[matchId];
      const winner = winners[matchId] ?? null;
      const [homeY, awayY] = drawMatch(ctx, LX.r32Left, top, SLOT_W_R32, m.home, m.away, winner);
      const winnerY = winner === m.home ? homeY : winner === m.away ? awayY : (homeY + awayY) / 2;
      leftR32Centers.push([winnerY, (homeY + awayY) / 2]);
    });
  });

  // Right R32 matches (mirrored)
  RIGHT_R32_GROUPS.forEach((group, gi) => {
    group.forEach((matchId, mi) => {
      const idx = gi * 2 + mi;
      const top = r32Top(idx);
      const m = tree.matches[matchId];
      const winner = winners[matchId] ?? null;
      const [homeY, awayY] = drawMatch(ctx, RX.r32Left, top, SLOT_W_R32, m.home, m.away, winner);
      const winnerY = winner === m.home ? homeY : winner === m.away ? awayY : (homeY + awayY) / 2;
      rightR32Centers.push([winnerY, (homeY + awayY) / 2]);
    });
  });

  // Left R16 (each from a pair of R32 matches)
  const leftR16Centers: number[] = [];
  LEFT_R16.forEach((matchId, i) => {
    const [win0, mid0] = leftR32Centers[i * 2];
    const [win1, mid1] = leftR32Centers[i * 2 + 1];
    const r16MidY = (mid0 + mid1) / 2;

    // Connect R32 → R16
    connectBracket(ctx, 'left', LX.r32Right, win0, win1);

    // Draw R16 match
    const m = tree.matches[matchId];
    const winner = winners[matchId] ?? null;
    const r16Top = r16MidY - MATCH_H / 2;
    const [homeY, awayY] = drawMatch(ctx, LX.r16Left, r16Top, SLOT_W_R16, m.home, m.away, winner);
    const winnerY = winner === m.home ? homeY : winner === m.away ? awayY : (homeY + awayY) / 2;
    leftR16Centers.push(winnerY);
  });

  // Left QF
  const leftQFCenters: number[] = [];
  LEFT_QF.forEach((matchId, i) => {
    const y0 = leftR16Centers[i * 2];
    const y1 = leftR16Centers[i * 2 + 1];
    const qfMidY = (y0 + y1) / 2;

    connectBracket(ctx, 'left', LX.r16Right, y0, y1);

    const m = tree.matches[matchId];
    const winner = winners[matchId] ?? null;
    const qfTop = qfMidY - MATCH_H / 2;
    const [homeY, awayY] = drawMatch(ctx, LX.qfLeft, qfTop, SLOT_W_QF, m.home, m.away, winner);
    const winnerY = winner === m.home ? homeY : winner === m.away ? awayY : (homeY + awayY) / 2;
    leftQFCenters.push(winnerY);
  });

  // Left SF
  const sfMidY_L = (leftQFCenters[0] + leftQFCenters[1]) / 2;
  connectBracket(ctx, 'left', LX.qfRight, leftQFCenters[0], leftQFCenters[1]);
  {
    const m = tree.matches[LEFT_SF];
    const winner = winners[LEFT_SF] ?? null;
    const sfTop = sfMidY_L - MATCH_H / 2;
    const [homeY, awayY] = drawMatch(ctx, LX.sfLeft, sfTop, SLOT_W_SF, m.home, m.away, winner);
    const winnerY = winner === m.home ? homeY : winner === m.away ? awayY : (homeY + awayY) / 2;

    // Line from SF to champion box
    const finalBoxLeft = LX.sfRight + 14;
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(LX.sfRight, winnerY);
    ctx.lineTo(finalBoxLeft, winnerY);
    ctx.stroke();
  }

  // ── Right side (mirrored) ─────────────────────────────────────────────────

  const rightR16Centers: number[] = [];
  RIGHT_R16.forEach((matchId, i) => {
    const [win0, mid0] = rightR32Centers[i * 2];
    const [win1, mid1] = rightR32Centers[i * 2 + 1];
    const r16MidY = (mid0 + mid1) / 2;

    // Connect R32 → R16 (right side, lines go leftward)
    const midX = RX.r32Left - 7;
    const targetX = RX.r32Left - 14;
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(RX.r32Left, win0); ctx.lineTo(midX, win0);
    ctx.lineTo(midX, win1); ctx.lineTo(RX.r32Left, win1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(midX, r16MidY); ctx.lineTo(targetX, r16MidY);
    ctx.stroke();

    const m = tree.matches[matchId];
    const winner = winners[matchId] ?? null;
    const r16Top = r16MidY - MATCH_H / 2;
    const [homeY, awayY] = drawMatch(ctx, RX.r16Left, r16Top, SLOT_W_R16, m.home, m.away, winner);
    const winnerY = winner === m.home ? homeY : winner === m.away ? awayY : (homeY + awayY) / 2;
    rightR16Centers.push(winnerY);
  });

  const rightQFCenters: number[] = [];
  RIGHT_QF.forEach((matchId, i) => {
    const y0 = rightR16Centers[i * 2];
    const y1 = rightR16Centers[i * 2 + 1];
    const qfMidY = (y0 + y1) / 2;

    const midX = RX.r16Left - 7;
    const targetX = RX.r16Left - 14;
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(RX.r16Left, y0); ctx.lineTo(midX, y0);
    ctx.lineTo(midX, y1); ctx.lineTo(RX.r16Left, y1);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(midX, qfMidY); ctx.lineTo(targetX, qfMidY); ctx.stroke();

    const m = tree.matches[matchId];
    const winner = winners[matchId] ?? null;
    const qfTop = qfMidY - MATCH_H / 2;
    const [homeY, awayY] = drawMatch(ctx, RX.qfLeft, qfTop, SLOT_W_QF, m.home, m.away, winner);
    const winnerY = winner === m.home ? homeY : winner === m.away ? awayY : (homeY + awayY) / 2;
    rightQFCenters.push(winnerY);
  });

  const sfMidY_R = (rightQFCenters[0] + rightQFCenters[1]) / 2;
  {
    const midX = RX.qfLeft - 7;
    const targetX = RX.qfLeft - 14;
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(RX.qfLeft, rightQFCenters[0]); ctx.lineTo(midX, rightQFCenters[0]);
    ctx.lineTo(midX, rightQFCenters[1]); ctx.lineTo(RX.qfLeft, rightQFCenters[1]);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(midX, sfMidY_R); ctx.lineTo(targetX, sfMidY_R); ctx.stroke();

    const m = tree.matches[RIGHT_SF];
    const winner = winners[RIGHT_SF] ?? null;
    const sfTop = sfMidY_R - MATCH_H / 2;
    const [homeY, awayY] = drawMatch(ctx, RX.sfLeft, sfTop, SLOT_W_SF, m.home, m.away, winner);
    const winnerY = winner === m.home ? homeY : winner === m.away ? awayY : (homeY + awayY) / 2;

    const finalBoxRight = RX.sfLeft - 14;
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(RX.sfLeft, winnerY); ctx.lineTo(finalBoxRight, winnerY); ctx.stroke();
  }

  // ── Final / Champion box (centre) ─────────────────────────────────────────
  const finalBoxW  = 110;
  const finalBoxH  = 68;
  const finalBoxX  = LX.finalCx - finalBoxW / 2;
  const finalBoxY  = (sfMidY_L + sfMidY_R) / 2 - finalBoxH / 2;

  ctx.fillStyle = champCode ? C.header : 'rgba(26,61,43,0.12)';
  rrect(ctx, finalBoxX, finalBoxY, finalBoxW, finalBoxH, 6);
  ctx.fill();
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 1.5;
  rrect(ctx, finalBoxX, finalBoxY, finalBoxW, finalBoxH, 6);
  ctx.stroke();

  // Flag inside champion box
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '22px sans-serif';
  ctx.fillText(champCode ? champFlag : '🏆', LX.finalCx, finalBoxY + 18);

  // Team code inside champion box
  ctx.fillStyle = champCode ? '#fff' : C.muted;
  ctx.font = `bold 14px "Courier New", monospace`;
  ctx.fillText(champCode ?? '???', LX.finalCx, finalBoxY + 38);

  // "★ CHAMPION ★" label
  ctx.fillStyle = C.goldLight;
  ctx.font = 'bold 7px "Courier New", monospace';
  ctx.fillText('★  CHAMPION  ★', LX.finalCx, finalBoxY + finalBoxH - 9);

  // ── Dashed separator line (between left bracket and right bracket) ────────
  ctx.strokeStyle = C.dash;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(LX.finalCx, BRACKET_TOP - 8);
  ctx.lineTo(LX.finalCx, BRACKET_BOT + 8);
  ctx.stroke();
  ctx.setLineDash([]);

  // ── Footer ────────────────────────────────────────────────────────────────
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
