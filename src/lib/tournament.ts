// ─────────────────────────────────────────────────────────────────────────────
// lib/tournament.ts — canonical WC2026 tournament config + knockout tree derivation
//
// This is STATIC config (groups, teams, tiers, official bracket structure). User
// predictions and real results live in the DB, never here.
//
// SOURCES:
//  - Official Final Draw (5 Dec 2025): group membership below.
//  - Official Round-of-32 slot map + full bracket linkage (matches 73–104):
//    openfootball open-data project (2026/worldcup.json), cross-checked against
//    FIFA's published knockout schedule. Verified invariants: group winners of H
//    (Spain) and J (Argentina) sit in opposite halves; no third-placed team can
//    meet a group winner from its own group in the R32.
//
// TIERS are EDITORIAL (1 = elite favorite … 5 = longshot) and drive the spice
// math. They are tunable — keep them in sync with CLAUDE.md if changed.
//
// THIRD-PLACE ASSIGNMENT: FIFA's Annex C defines 495 pre-set rows (one per
// combination of 8 qualifying third-placed groups) mapping each third to a
// specific R32 slot. We could not encode all 495 rows; instead we compute a
// deterministic bijective matching over each slot's official candidate-group
// list. This guarantees a valid, conflict-free bracket (no team meets its own
// group) for every combination — see the all-495 unit test. The exact FIFA row
// for a given combination may differ; swap in the official table here if needed.
// ─────────────────────────────────────────────────────────────────────────────

import type { Team, GroupId, Tier } from './types';

export const GROUP_IDS: GroupId[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

// Official Final Draw. Order within each group is the seeding (pos-1 = seeded
// head: the 3 hosts + the 9 Pot-1 teams). Tiers are editorial.
// FIFA/Coca-Cola Men's World Ranking — April 2026 update (last before the WC).
// Compiled from the official top-12 plus per-confederation rankings (full-table
// sources were unreachable from this environment, so a few mid-table values are
// best-available from confederation lists). Update here if the June 11 ranking
// changes anything.
export const TEAMS: Team[] = [
  // Group A
  { name: 'Mexico',          code: 'MEX', flag: '🇲🇽', tier: 3, group: 'A', rank: 15  },
  { name: 'South Africa',    code: 'RSA', flag: '🇿🇦', tier: 5, group: 'A', rank: 60  },
  { name: 'South Korea',     code: 'KOR', flag: '🇰🇷', tier: 3, group: 'A', rank: 22  },
  { name: 'Czechia',         code: 'CZE', flag: '🇨🇿', tier: 4, group: 'A', rank: 41  },
  // Group B
  { name: 'Canada',          code: 'CAN', flag: '🇨🇦', tier: 4, group: 'B', rank: 30  },
  { name: 'Bosnia & Herz.',  code: 'BIH', flag: '🇧🇦', tier: 5, group: 'B', rank: 67  },
  { name: 'Qatar',           code: 'QAT', flag: '🇶🇦', tier: 5, group: 'B', rank: 56  },
  { name: 'Switzerland',     code: 'SUI', flag: '🇨🇭', tier: 3, group: 'B', rank: 21  },
  // Group C
  { name: 'Brazil',          code: 'BRA', flag: '🇧🇷', tier: 1, group: 'C', rank: 6   },
  { name: 'Morocco',         code: 'MAR', flag: '🇲🇦', tier: 2, group: 'C', rank: 8   },
  { name: 'Haiti',           code: 'HAI', flag: '🇭🇹', tier: 5, group: 'C', rank: 82  },
  { name: 'Scotland',        code: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', tier: 4, group: 'C', rank: 43  },
  // Group D
  { name: 'United States',   code: 'USA', flag: '🇺🇸', tier: 3, group: 'D', rank: 16  },
  { name: 'Paraguay',        code: 'PAR', flag: '🇵🇾', tier: 4, group: 'D', rank: 40  },
  { name: 'Australia',       code: 'AUS', flag: '🇦🇺', tier: 4, group: 'D', rank: 27  },
  { name: 'Türkiye',         code: 'TUR', flag: '🇹🇷', tier: 3, group: 'D', rank: 26  },
  // Group E
  { name: 'Germany',         code: 'GER', flag: '🇩🇪', tier: 1, group: 'E', rank: 10  },
  { name: 'Curaçao',         code: 'CUW', flag: '🇨🇼', tier: 5, group: 'E', rank: 84  },
  { name: 'Ivory Coast',     code: 'CIV', flag: '🇨🇮', tier: 3, group: 'E', rank: 34  },
  { name: 'Ecuador',         code: 'ECU', flag: '🇪🇨', tier: 3, group: 'E', rank: 23  },
  // Group F
  { name: 'Netherlands',     code: 'NED', flag: '🇳🇱', tier: 1, group: 'F', rank: 7   },
  { name: 'Japan',           code: 'JPN', flag: '🇯🇵', tier: 2, group: 'F', rank: 19  },
  { name: 'Sweden',          code: 'SWE', flag: '🇸🇪', tier: 4, group: 'F', rank: 38  },
  { name: 'Tunisia',         code: 'TUN', flag: '🇹🇳', tier: 4, group: 'F', rank: 44  },
  // Group G
  { name: 'Belgium',         code: 'BEL', flag: '🇧🇪', tier: 2, group: 'G', rank: 9   },
  { name: 'Egypt',           code: 'EGY', flag: '🇪🇬', tier: 3, group: 'G', rank: 29  },
  { name: 'Iran',            code: 'IRN', flag: '🇮🇷', tier: 3, group: 'G', rank: 20  },
  { name: 'New Zealand',     code: 'NZL', flag: '🇳🇿', tier: 5, group: 'G', rank: 85  },
  // Group H
  { name: 'Spain',           code: 'ESP', flag: '🇪🇸', tier: 1, group: 'H', rank: 2   },
  { name: 'Cape Verde',      code: 'CPV', flag: '🇨🇻', tier: 5, group: 'H', rank: 69  },
  { name: 'Saudi Arabia',    code: 'KSA', flag: '🇸🇦', tier: 5, group: 'H', rank: 61  },
  { name: 'Uruguay',         code: 'URU', flag: '🇺🇾', tier: 2, group: 'H', rank: 17  },
  // Group I
  { name: 'France',          code: 'FRA', flag: '🇫🇷', tier: 1, group: 'I', rank: 1   },
  { name: 'Senegal',         code: 'SEN', flag: '🇸🇳', tier: 2, group: 'I', rank: 14  },
  { name: 'Iraq',            code: 'IRQ', flag: '🇮🇶', tier: 5, group: 'I', rank: 58  },
  { name: 'Norway',          code: 'NOR', flag: '🇳🇴', tier: 3, group: 'I', rank: 31  },
  // Group J
  { name: 'Argentina',       code: 'ARG', flag: '🇦🇷', tier: 1, group: 'J', rank: 3   },
  { name: 'Algeria',         code: 'ALG', flag: '🇩🇿', tier: 4, group: 'J', rank: 28  },
  { name: 'Austria',         code: 'AUT', flag: '🇦🇹', tier: 3, group: 'J', rank: 24  },
  { name: 'Jordan',          code: 'JOR', flag: '🇯🇴', tier: 5, group: 'J', rank: 64  },
  // Group K
  { name: 'Portugal',        code: 'POR', flag: '🇵🇹', tier: 1, group: 'K', rank: 5   },
  { name: 'DR Congo',        code: 'COD', flag: '🇨🇩', tier: 4, group: 'K', rank: 46  },
  { name: 'Uzbekistan',      code: 'UZB', flag: '🇺🇿', tier: 5, group: 'K', rank: 52  },
  { name: 'Colombia',        code: 'COL', flag: '🇨🇴', tier: 2, group: 'K', rank: 13  },
  // Group L
  { name: 'England',         code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', tier: 1, group: 'L', rank: 4   },
  { name: 'Croatia',         code: 'CRO', flag: '🇭🇷', tier: 2, group: 'L', rank: 11  },
  { name: 'Ghana',           code: 'GHA', flag: '🇬🇭', tier: 4, group: 'L', rank: 74  },
  { name: 'Panama',          code: 'PAN', flag: '🇵🇦', tier: 5, group: 'L', rank: 33  },
];

// ── Lookups ──────────────────────────────────────────────────────────────────
export const TEAM_BY_CODE: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.code, t]),
);

export function getTeamsByGroup(group: GroupId): Team[] {
  return TEAMS.filter((t) => t.group === group);
}

export function getTeam(code: string): Team | undefined {
  return TEAM_BY_CODE[code];
}

export function tierOf(code: string): Tier {
  const t = TEAM_BY_CODE[code];
  if (!t) throw new Error(`Unknown team code: ${code}`);
  return t.tier;
}

export const COUNTDOWN_DATE = new Date('2026-06-11T18:00:00Z');

// ── Knockout bracket structure ──────────────────────────────────────────────
export type KnockoutRound = 'r32' | 'r16' | 'qf' | 'sf' | 'final';

export interface KnockoutMatch {
  id: string; // 'M73' … 'M104'
  round: KnockoutRound;
  homeSource: string; // e.g. '2A', '1E', 'T:M74' (third-place slot), 'W:M73'
  awaySource: string;
  home: string | null; // resolved team code once known
  away: string | null;
  // Where this match's winner flows (parent match + which slot it fills).
  feedsInto: string | null;
  feedsSlot: 'home' | 'away' | null;
}

export interface KnockoutTree {
  matches: Record<string, KnockoutMatch>;
  r32: string[];
  r16: string[];
  qf: string[];
  sf: string[];
  final: string; // 'M104'
}

// Source token grammar:
//   '1A'   = winner of group A      → standings['A'][0]
//   '2A'   = runner-up of group A   → standings['A'][1]
//   'T:Mxx'= third-place team assigned to this R32 match (see THIRD_SLOTS)
//   'W:Mxx'= winner of match Mxx
interface RawMatch {
  id: string;
  round: KnockoutRound;
  home: string;
  away: string;
}

// Round of 32 (official slot map, matches 73–88).
const R32: RawMatch[] = [
  { id: 'M73', round: 'r32', home: '2A', away: '2B' },
  { id: 'M74', round: 'r32', home: '1E', away: 'T:M74' },
  { id: 'M75', round: 'r32', home: '1F', away: '2C' },
  { id: 'M76', round: 'r32', home: '1C', away: '2F' },
  { id: 'M77', round: 'r32', home: '1I', away: 'T:M77' },
  { id: 'M78', round: 'r32', home: '2E', away: '2I' },
  { id: 'M79', round: 'r32', home: '1A', away: 'T:M79' },
  { id: 'M80', round: 'r32', home: '1L', away: 'T:M80' },
  { id: 'M81', round: 'r32', home: '1D', away: 'T:M81' },
  { id: 'M82', round: 'r32', home: '1G', away: 'T:M82' },
  { id: 'M83', round: 'r32', home: '2K', away: '2L' },
  { id: 'M84', round: 'r32', home: '1H', away: '2J' },
  { id: 'M85', round: 'r32', home: '1B', away: 'T:M85' },
  { id: 'M86', round: 'r32', home: '1J', away: '2H' },
  { id: 'M87', round: 'r32', home: '1K', away: 'T:M87' },
  { id: 'M88', round: 'r32', home: '2D', away: '2G' },
];

// Round of 16 → Final (official linkage).
const LATER: RawMatch[] = [
  { id: 'M89', round: 'r16', home: 'W:M74', away: 'W:M77' },
  { id: 'M90', round: 'r16', home: 'W:M73', away: 'W:M75' },
  { id: 'M91', round: 'r16', home: 'W:M76', away: 'W:M78' },
  { id: 'M92', round: 'r16', home: 'W:M79', away: 'W:M80' },
  { id: 'M93', round: 'r16', home: 'W:M83', away: 'W:M84' },
  { id: 'M94', round: 'r16', home: 'W:M81', away: 'W:M82' },
  { id: 'M95', round: 'r16', home: 'W:M86', away: 'W:M88' },
  { id: 'M96', round: 'r16', home: 'W:M85', away: 'W:M87' },
  { id: 'M97', round: 'qf', home: 'W:M89', away: 'W:M90' },
  { id: 'M98', round: 'qf', home: 'W:M93', away: 'W:M94' },
  { id: 'M99', round: 'qf', home: 'W:M91', away: 'W:M92' },
  { id: 'M100', round: 'qf', home: 'W:M95', away: 'W:M96' },
  { id: 'M101', round: 'sf', home: 'W:M97', away: 'W:M98' },
  { id: 'M102', round: 'sf', home: 'W:M99', away: 'W:M100' },
  { id: 'M104', round: 'final', home: 'W:M101', away: 'W:M102' },
];

const ALL_RAW: RawMatch[] = [...R32, ...LATER];

// Third-place slots: each R32 match that hosts a third-placed team, with the
// official list of groups whose third-placed team is eligible for that slot.
// (Verified: a slot's candidate list never contains the slot's own group
// winner, so no same-group rematch is possible.)
export const THIRD_SLOTS: { match: string; candidates: GroupId[] }[] = [
  { match: 'M74', candidates: ['A', 'B', 'C', 'D', 'F'] }, // vs 1E
  { match: 'M77', candidates: ['C', 'D', 'F', 'G', 'H'] }, // vs 1I
  { match: 'M79', candidates: ['C', 'E', 'F', 'H', 'I'] }, // vs 1A
  { match: 'M80', candidates: ['E', 'H', 'I', 'J', 'K'] }, // vs 1L
  { match: 'M81', candidates: ['B', 'E', 'F', 'I', 'J'] }, // vs 1D
  { match: 'M82', candidates: ['A', 'E', 'H', 'I', 'J'] }, // vs 1G
  { match: 'M85', candidates: ['E', 'F', 'G', 'I', 'J'] }, // vs 1B
  { match: 'M87', candidates: ['D', 'E', 'I', 'J', 'L'] }, // vs 1K
];

/**
 * Assign the 8 qualifying third-placed groups to the 8 third-place slots.
 * Returns a map of slot match-id → GroupId. Throws if no valid assignment
 * exists (should be impossible for any valid set of 8 distinct groups).
 *
 * Deterministic: slots are filled in THIRD_SLOTS order; for each slot the
 * eligible groups are tried in alphabetical order, with backtracking. The
 * result is stable for a given input set.
 */
export function assignThirdPlaceSlots(qualifyingGroups: GroupId[]): Record<string, GroupId> {
  const groups = [...new Set(qualifyingGroups)].sort();
  if (groups.length !== 8) {
    throw new Error(`Expected 8 distinct third-place groups, got ${groups.length}`);
  }
  const slots = THIRD_SLOTS;
  const assignment: Record<string, GroupId> = {};
  const used = new Set<GroupId>();

  function solve(i: number): boolean {
    if (i === slots.length) return used.size === 8;
    const slot = slots[i];
    for (const g of groups) {
      if (used.has(g)) continue;
      if (!slot.candidates.includes(g)) continue;
      assignment[slot.match] = g;
      used.add(g);
      if (solve(i + 1)) return true;
      used.delete(g);
      delete assignment[slot.match];
    }
    return false;
  }

  if (!solve(0)) {
    throw new Error(`No valid third-place assignment for groups: ${groups.join(',')}`);
  }
  return assignment;
}

function resolveStandingSource(
  source: string,
  standings: Record<GroupId, [string, string, string, string]>,
): string | null {
  const pos = source[0]; // '1' or '2'
  const group = source[1] as GroupId;
  const row = standings[group];
  if (!row) return null;
  return pos === '1' ? row[0] : row[1];
}

/**
 * Build the knockout tree from a user's predicted group standings and their
 * 8 chosen third-place qualifiers.
 *
 * - R32 home/away are resolved to concrete team codes.
 * - R16+ home/away start null (filled as the user picks winners) but the
 *   adjacency (feedsInto/feedsSlot) is fully wired.
 */
export function buildKnockoutTree(
  standings: Record<GroupId, [string, string, string, string]>,
  thirdPlaceQualifiers: string[],
): KnockoutTree {
  if (thirdPlaceQualifiers.length !== 8) {
    throw new Error(`Expected 8 third-place qualifiers, got ${thirdPlaceQualifiers.length}`);
  }

  // Validate each qualifier is genuinely a 3rd-placed team, and collect groups.
  const qualifyingGroups: GroupId[] = [];
  for (const code of thirdPlaceQualifiers) {
    const team = TEAM_BY_CODE[code];
    if (!team) throw new Error(`Unknown third-place team code: ${code}`);
    const g = team.group;
    if (standings[g][2] !== code) {
      throw new Error(`${code} is not the 3rd-placed team of group ${g}`);
    }
    if (qualifyingGroups.includes(g)) {
      throw new Error(`Duplicate qualifying group: ${g}`);
    }
    qualifyingGroups.push(g);
  }

  const thirdSlotGroup = assignThirdPlaceSlots(qualifyingGroups); // match → group
  const thirdSlotTeam: Record<string, string> = {};
  for (const [match, g] of Object.entries(thirdSlotGroup)) {
    thirdSlotTeam[match] = standings[g][2];
  }

  // Materialize all matches with resolved R32 teams + adjacency.
  const matches: Record<string, KnockoutMatch> = {};
  for (const raw of ALL_RAW) {
    matches[raw.id] = {
      id: raw.id,
      round: raw.round,
      homeSource: raw.home,
      awaySource: raw.away,
      home: null,
      away: null,
      feedsInto: null,
      feedsSlot: null,
    };
  }

  // Resolve R32 concrete teams.
  for (const raw of R32) {
    const m = matches[raw.id];
    m.home = raw.home.startsWith('T:')
      ? thirdSlotTeam[raw.id] ?? null
      : resolveStandingSource(raw.home, standings);
    m.away = raw.away.startsWith('T:')
      ? thirdSlotTeam[raw.id] ?? null
      : resolveStandingSource(raw.away, standings);
  }

  // Wire adjacency: any 'W:Mxx' source means Mxx feeds this slot.
  for (const raw of ALL_RAW) {
    for (const slot of ['home', 'away'] as const) {
      const src = slot === 'home' ? raw.home : raw.away;
      if (src.startsWith('W:')) {
        const child = src.slice(2);
        matches[child].feedsInto = raw.id;
        matches[child].feedsSlot = slot;
      }
    }
  }

  return {
    matches,
    r32: R32.map((m) => m.id),
    r16: LATER.filter((m) => m.round === 'r16').map((m) => m.id),
    qf: LATER.filter((m) => m.round === 'qf').map((m) => m.id),
    sf: LATER.filter((m) => m.round === 'sf').map((m) => m.id),
    final: 'M104',
  };
}

/**
 * Propagate a set of winner picks (matchId → winning team code) up the tree,
 * filling home/away for later rounds. Picks that become invalid (because an
 * upstream pick changed) are dropped from the returned cleaned picks.
 *
 * Returns the mutated tree plus the validated winner map.
 */
export function applyWinners(
  tree: KnockoutTree,
  winners: Record<string, string>,
): { tree: KnockoutTree; winners: Record<string, string> } {
  const order = [...tree.r32, ...tree.r16, ...tree.qf, ...tree.sf, tree.final];
  const cleaned: Record<string, string> = {};

  for (const id of order) {
    const m = tree.matches[id];
    const pick = winners[id];
    // A pick is only valid if it is one of the two (now-known) participants.
    if (pick && (pick === m.home || pick === m.away)) {
      cleaned[id] = pick;
      if (m.feedsInto && m.feedsSlot) {
        tree.matches[m.feedsInto][m.feedsSlot] = pick;
      }
    } else if (m.feedsInto && m.feedsSlot) {
      // No valid winner yet → ensure downstream slot is cleared.
      tree.matches[m.feedsInto][m.feedsSlot] = null;
    }
  }

  return { tree, winners: cleaned };
}
