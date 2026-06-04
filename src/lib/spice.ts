// ─────────────────────────────────────────────────────────────────────────────
// lib/spice.ts — THE single source of truth for the Spice Score.
//
// The live client preview AND the server OG image MUST call computeSpice() so a
// card never disagrees with the page. The math here mirrors CLAUDE.md exactly;
// if you change a weight/cap, change it in CLAUDE.md in the same commit.
//
// Helpers over the full bracket:
//   L(t) = (tier-1)/4  → "longshotness"  (0 for tier 1 … 1 for tier 5)
//   F(t) = (5-tier)/4  → "favoriteness"  (1 for tier 1 … 0 for tier 5)
//
// Five categories, each clamped to its own cap; caps sum to 100:
//   1 Champion boldness       = L(champion)*30                         cap 30
//   2 Final-opponent boldness = L(runnerUp)*8                          cap 8
//   3 Longshot deep runs      = Σ L(team)*w for teams reaching QF+      cap 25
//                               w: QF=2, SF=3, Final=4 (deepest round)
//   4 Favorite early exits    = Σ F(team)*w                            cap 25
//                               out-in-group w=3, lost-in-R32 w=1.5
//   5 Group-stage upsets      = Σ max(0, tier(1st)-tier(4th))/4 *2     cap 12
//   score = round( min(100, sum of the five clamped categories) )
// ─────────────────────────────────────────────────────────────────────────────

import type { Bracket, GroupId, SpiceResult, SpiceCategory, Tier } from './types';
import {
  GROUP_IDS,
  TEAM_BY_CODE,
  buildKnockoutTree,
  applyWinners,
} from './tournament.ts';

const L = (t: Tier) => (t - 1) / 4;
const F = (t: Tier) => (5 - t) / 4;

function tierOf(code: string): Tier | null {
  return TEAM_BY_CODE[code]?.tier ?? null;
}
function nameOf(code: string): string {
  return TEAM_BY_CODE[code]?.name ?? code;
}

type Reached = 'group-out' | 'r32' | 'r16' | 'qf' | 'sf' | 'final' | 'champion';
const DEPTH: Record<Reached, number> = {
  'group-out': 0, r32: 1, r16: 2, qf: 3, sf: 4, final: 5, champion: 6,
};
// Weight for "reaching QF+" (category 3), keyed by deepest round reached.
const DEEP_W: Partial<Record<Reached, number>> = { qf: 2, sf: 3, final: 4, champion: 4 };

const PERSONAS: { min: number; max: number; name: string; emoji: string; blurb: string }[] = [
  { min: 0, max: 20, name: 'Chalk Merchant', emoji: '📊',
    blurb: 'You trust the rankings. Every favorite advances, every seed holds. Safe — but is safe ever a story?' },
  { min: 21, max: 40, name: 'The Realist', emoji: '🎯',
    blurb: 'Mostly chalk with a flutter of nerve. Sensible picks, the odd calculated risk.' },
  { min: 41, max: 60, name: 'Calculated Gambler', emoji: '🎲',
    blurb: 'You balance logic and chaos — a few bold swings, each one backed by a reason.' },
  { min: 61, max: 80, name: 'Chaos Agent', emoji: '🔥',
    blurb: 'You came to break brackets. Favorites tumble, longshots fly. Pure adrenaline.' },
  { min: 81, max: 100, name: 'Certified Menace', emoji: '💀',
    blurb: "Total carnage. You've torched the form book and dared the world to doubt you." },
];

function personaFor(score: number) {
  return PERSONAS.find((p) => score >= p.min && score <= p.max) ?? PERSONAS[0];
}

function clamp(v: number, cap: number): number {
  return Math.max(0, Math.min(cap, v));
}

/**
 * Compute the full Spice Score + persona + boldest call + hero picks for a
 * bracket. Pure and deterministic. Works on partial brackets (knockout-derived
 * categories contribute 0 until the group stage is complete and a champion is
 * picked), so it is safe to drive a live preview.
 */
export function computeSpice(bracket: Bracket | null): SpiceResult {
  // ── Group-stage data (category 5, and the tiers we reuse elsewhere) ────────
  let groupUpsets = 0;
  let topUpset: { group: GroupId; code: string; delta: number } | null = null;
  if (bracket) {
    for (const g of GROUP_IDS) {
      const [first, , , fourth] = bracket.groupPredictions[g];
      const t1 = tierOf(first);
      const t4 = tierOf(fourth);
      if (t1 == null || t4 == null) continue;
      const delta = Math.max(0, t1 - t4);
      groupUpsets += (delta / 4) * 2;
      if (delta > 0 && (!topUpset || delta > topUpset.delta)) {
        topUpset = { group: g, code: first, delta };
      }
    }
  }

  // ── Knockout-derived data (categories 1–4 + hero picks) ────────────────────
  let championBold = 0;
  let finalistBold = 0;
  let deepRuns = 0;
  let earlyExits = 0;
  let champion = '';
  let runnerUp = '';
  let darkHorse = '';
  let earlyExit = '';

  const ready = isGroupStageReady(bracket);
  if (ready && bracket) {
    const tree = buildKnockoutTree(bracket.groupPredictions, bracket.thirdPlaceQualifiers);
    const { winners } = applyWinners(tree, flattenKnockout(bracket.knockout));

    // Deepest round reached per team.
    const reached: Record<string, Reached> = {};
    const setDeep = (code: string, r: Reached) => {
      if (!code) return;
      if (!reached[code] || DEPTH[r] > DEPTH[reached[code]]) reached[code] = r;
    };
    for (const id of tree.r32) {
      setDeep(tree.matches[id].home ?? '', 'r32');
      setDeep(tree.matches[id].away ?? '', 'r32');
    }
    const NEXT: Record<string, Reached> = { r32: 'r16', r16: 'qf', qf: 'sf', sf: 'final', final: 'champion' };
    for (const round of ['r32', 'r16', 'qf', 'sf'] as const) {
      for (const id of tree[round]) if (winners[id]) setDeep(winners[id], NEXT[round]);
    }
    if (winners['M104']) setDeep(winners['M104'], 'champion');

    // Finalists.
    champion = winners['M104'] ?? '';
    const fin = tree.matches[tree.final];
    if (champion) runnerUp = fin.home === champion ? (fin.away ?? '') : (fin.home ?? '');

    // Category 1 + 2.
    const ct = tierOf(champion);
    if (ct != null) championBold = L(ct) * 30;
    const rt = tierOf(runnerUp);
    if (rt != null) finalistBold = L(rt) * 8;

    // Category 3 — longshot deep runs (QF+), weighted by deepest round.
    for (const [code, r] of Object.entries(reached)) {
      const w = DEEP_W[r];
      const t = tierOf(code);
      if (w && t != null) deepRuns += L(t) * w;
    }

    // Category 4 — favorite early exits.
    const qualifiers = new Set(qualifierCodes(bracket));
    for (const t of Object.values(TEAM_BY_CODE)) {
      if (qualifiers.has(t.code)) continue; // made the knockouts
      earlyExits += F(t.tier) * 3; // out in the group stage
    }
    for (const id of tree.r32) {
      const m = tree.matches[id];
      const w = winners[id];
      const loser = w ? (w === m.home ? m.away : m.home) : null;
      if (loser) {
        const t = tierOf(loser);
        if (t != null) earlyExits += F(t) * 1.5; // lost in R32
      }
    }

    // ── Hero picks ───────────────────────────────────────────────────────────
    darkHorse = pickDarkHorse(reached);
    earlyExit = pickEarlyExit(bracket, tree, winners, qualifiers);
  }

  // ── Clamp, sum, score ──────────────────────────────────────────────────────
  const categories: SpiceCategory[] = [
    { key: 'champion', label: 'Champion boldness', value: clamp(championBold, 30), cap: 30 },
    { key: 'finalist', label: 'Final-opponent boldness', value: clamp(finalistBold, 8), cap: 8 },
    { key: 'deepRuns', label: 'Longshot deep runs', value: clamp(deepRuns, 25), cap: 25 },
    { key: 'earlyExits', label: 'Favorite early exits', value: clamp(earlyExits, 25), cap: 25 },
    { key: 'groupUpsets', label: 'Group-stage upsets', value: clamp(groupUpsets, 12), cap: 12 },
  ];
  const score = Math.round(Math.min(100, categories.reduce((s, c) => s + c.value, 0)));
  const persona = personaFor(score);

  return {
    score,
    persona: persona.name,
    personaEmoji: persona.emoji,
    personaBlurb: persona.blurb,
    boldestCall: boldestCall(categories, { champion, runnerUp, darkHorse, earlyExit, topUpset }),
    categories,
    champion,
    runnerUp,
    darkHorse,
    earlyExit,
  };
}

// ── Boldest call ───────────────────────────────────────────────────────────--
function boldestCall(
  categories: SpiceCategory[],
  ctx: {
    champion: string; runnerUp: string; darkHorse: string; earlyExit: string;
    topUpset: { group: GroupId; code: string; delta: number } | null;
  },
): string {
  const top = [...categories].sort((a, b) => b.value - a.value)[0];
  if (!top || top.value < 4) return 'Honestly? Nothing bold here. Pure chalk.';
  switch (top.key) {
    case 'champion':
      return ctx.champion
        ? `Crowning ${nameOf(ctx.champion)} world champions. Audacious.`
        : 'A wildcard champion. Audacious.';
    case 'finalist':
      return ctx.runnerUp
        ? `Putting ${nameOf(ctx.runnerUp)} in the final. Few saw that coming.`
        : 'A surprise finalist. Few saw that coming.';
    case 'deepRuns':
      return ctx.darkHorse
        ? `Riding ${nameOf(ctx.darkHorse)} deep into the knockouts. Spicy.`
        : 'A longshot going deep. Spicy.';
    case 'earlyExits':
      return ctx.earlyExit
        ? `Saying ${nameOf(ctx.earlyExit)} crashes out early. Ruthless.`
        : 'A heavyweight crashing out early. Ruthless.';
    case 'groupUpsets':
      return ctx.topUpset
        ? `Flipping Group ${ctx.topUpset.group} — ${nameOf(ctx.topUpset.code)} topping the favorites.`
        : 'Turning a group on its head.';
  }
}

// ── Hero pick selection ────────────────────────────────────────────────────--
function pickDarkHorse(reached: Record<string, Reached>): string {
  // Lowest tier (highest tier number) team reaching QF+; tie-break deepest round.
  let best: { code: string; tier: number; depth: number } | null = null;
  for (const [code, r] of Object.entries(reached)) {
    if (!DEEP_W[r]) continue; // QF+ only
    const t = tierOf(code);
    if (t == null) continue;
    const cand = { code, tier: t, depth: DEPTH[r] };
    if (
      !best ||
      cand.tier > best.tier ||
      (cand.tier === best.tier && cand.depth > best.depth) ||
      (cand.tier === best.tier && cand.depth === best.depth && cand.code < best.code)
    ) {
      best = cand;
    }
  }
  return best?.code ?? '';
}

function pickEarlyExit(
  bracket: Bracket,
  tree: ReturnType<typeof buildKnockoutTree>,
  winners: Record<string, string>,
  qualifiers: Set<string>,
): string {
  // Strongest team eliminated in the group stage (lowest tier number). If that
  // team isn't a genuine favorite (tier > 2), fall back to the boldest knockout
  // upset: the strongest team that lost in the Round of 32.
  const strongest = (codes: string[]): string => {
    let best: { code: string; tier: number } | null = null;
    for (const code of codes) {
      const t = tierOf(code);
      if (t == null) continue;
      if (!best || t < best.tier || (t === best.tier && code < best.code)) best = { code, tier: t };
    }
    return best?.code ?? '';
  };

  const groupOut = Object.values(TEAM_BY_CODE)
    .filter((t) => !qualifiers.has(t.code))
    .map((t) => t.code);
  const groupExit = strongest(groupOut);
  if (groupExit && (tierOf(groupExit) ?? 5) <= 2) return groupExit;

  const r32Losers: string[] = [];
  for (const id of tree.r32) {
    const m = tree.matches[id];
    const w = winners[id];
    const loser = w ? (w === m.home ? m.away : m.home) : null;
    if (loser) r32Losers.push(loser);
  }
  const knockoutUpset = strongest(r32Losers);
  if (knockoutUpset && (tierOf(knockoutUpset) ?? 5) < (tierOf(groupExit) ?? 5)) return knockoutUpset;
  return groupExit || knockoutUpset;
}

// ── Small bracket helpers (kept local so spice has no store dependency) ──────
function isGroupStageReady(bracket: Bracket | null): boolean {
  if (!bracket) return false;
  const groupsDone = GROUP_IDS.every((g) => {
    const p = bracket.groupPredictions[g];
    return p.every(Boolean) && new Set(p).size === 4;
  });
  return groupsDone && bracket.thirdPlaceQualifiers.length === 8;
}

function qualifierCodes(bracket: Bracket): string[] {
  const out: string[] = [];
  for (const g of GROUP_IDS) {
    out.push(bracket.groupPredictions[g][0], bracket.groupPredictions[g][1]);
  }
  return out.concat(bracket.thirdPlaceQualifiers);
}

function flattenKnockout(k: Bracket['knockout']): Record<string, string> {
  const out: Record<string, string> = { ...k.r32, ...k.r16, ...k.qf, ...k.sf };
  if (k.final) out['M104'] = k.final;
  return out;
}
