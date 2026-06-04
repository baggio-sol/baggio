import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Bracket, GroupId } from './types';
import {
  GROUP_IDS,
  TEAM_BY_CODE,
  buildKnockoutTree,
  applyWinners,
  type KnockoutTree,
} from './tournament';

interface PredictionState {
  bracket: Bracket | null;
  setBracket: (bracket: Bracket) => void;
  /** Replace a group's ranking. Pad with '' for unranked slots. Prunes any
   *  third-place qualifiers that are no longer 3rd in their group. */
  setRanking: (groupId: GroupId, picks: [string, string, string, string]) => void;
  /** Clear a single group's ranking (and dependent third-place picks). */
  clearGroup: (groupId: GroupId) => void;
  /** Toggle a team in/out of the 8 third-place qualifiers. Only teams currently
   *  placed 3rd are eligible, and at most 8 may be selected. */
  toggleThird: (code: string) => void;
  /** Pick the winner of a knockout match; re-derives the tree and drops any
   *  downstream picks the change invalidated. */
  setKnockoutWinner: (matchId: string, code: string) => void;
  resetPredictions: () => void;
}

export function emptyBracket(): Bracket {
  const groupPredictions = {} as Bracket['groupPredictions'];
  for (const g of GROUP_IDS) groupPredictions[g] = ['', '', '', ''];
  return {
    groupPredictions,
    thirdPlaceQualifiers: [],
    knockout: { r32: {}, r16: {}, qf: {}, sf: {}, final: '', champion: '' },
  };
}

/** The set of team codes currently sitting in 3rd place across all groups. */
export function thirdPlacedCodes(bracket: Bracket): string[] {
  return GROUP_IDS.map((g) => bracket.groupPredictions[g][2]).filter(Boolean);
}

/** Drop any third-place qualifiers that are no longer a 3rd-placed team. */
function pruneThirds(bracket: Bracket): string[] {
  const eligible = new Set(thirdPlacedCodes(bracket));
  return bracket.thirdPlaceQualifiers.filter((c) => eligible.has(c));
}

// ── Knockout bracket helpers ─────────────────────────────────────────────────
function knockoutRound(id: string): keyof Bracket['knockout'] | null {
  const n = Number(id.slice(1));
  if (n >= 73 && n <= 88) return 'r32';
  if (n >= 89 && n <= 96) return 'r16';
  if (n >= 97 && n <= 100) return 'qf';
  if (n >= 101 && n <= 102) return 'sf';
  if (n === 104) return 'final';
  return null;
}

/** Flatten the stored grouped knockout picks into a {matchId: winner} map. */
function flattenWinners(k: Bracket['knockout']): Record<string, string> {
  const out: Record<string, string> = { ...k.r32, ...k.r16, ...k.qf, ...k.sf };
  if (k.final) out['M104'] = k.final;
  return out;
}

/** Regroup a cleaned {matchId: winner} map back into the Bracket.knockout shape. */
function groupWinners(winners: Record<string, string>): Bracket['knockout'] {
  const k: Bracket['knockout'] = { r32: {}, r16: {}, qf: {}, sf: {}, final: '', champion: '' };
  for (const [id, code] of Object.entries(winners)) {
    const round = knockoutRound(id);
    if (round === 'final') {
      k.final = code;
      k.champion = code;
    } else if (round) {
      (k[round] as Record<string, string>)[id] = code;
    }
  }
  return k;
}

/**
 * Derive the live knockout tree for a bracket: builds the tree from the user's
 * predicted standings + third-place picks, applies their stored winner picks,
 * and returns the resolved tree plus the cleaned winner map. Returns null until
 * the group stage is complete (12 groups ranked + 8 thirds chosen).
 */
export function deriveTree(
  bracket: Bracket | null,
): { tree: KnockoutTree; winners: Record<string, string> } | null {
  if (!groupStageReady(bracket) || !bracket) return null;
  const tree = buildKnockoutTree(bracket.groupPredictions, bracket.thirdPlaceQualifiers);
  const { winners } = applyWinners(tree, flattenWinners(bracket.knockout));
  return { tree, winners };
}

export const usePredictionStore = create<PredictionState>()(
  persist(
    (set) => ({
      bracket: null,

      setBracket: (bracket) => set({ bracket }),

      setRanking: (groupId, picks) =>
        set((state) => {
          const current = state.bracket ?? emptyBracket();
          const next: Bracket = {
            ...current,
            groupPredictions: { ...current.groupPredictions, [groupId]: picks },
          };
          next.thirdPlaceQualifiers = pruneThirds(next);
          return { bracket: next };
        }),

      clearGroup: (groupId) =>
        set((state) => {
          const current = state.bracket ?? emptyBracket();
          const next: Bracket = {
            ...current,
            groupPredictions: {
              ...current.groupPredictions,
              [groupId]: ['', '', '', ''],
            },
          };
          next.thirdPlaceQualifiers = pruneThirds(next);
          return { bracket: next };
        }),

      toggleThird: (code) =>
        set((state) => {
          const current = state.bracket ?? emptyBracket();
          const eligible = new Set(thirdPlacedCodes(current));
          const selected = current.thirdPlaceQualifiers;
          let nextThirds: string[];
          if (selected.includes(code)) {
            nextThirds = selected.filter((c) => c !== code);
          } else if (eligible.has(code) && selected.length < 8) {
            nextThirds = [...selected, code];
          } else {
            return {}; // not eligible or already at 8 — no-op
          }
          return { bracket: { ...current, thirdPlaceQualifiers: nextThirds } };
        }),

      setKnockoutWinner: (matchId, code) =>
        set((state) => {
          const current = state.bracket;
          if (!groupStageReady(current) || !current) return {};
          const tree = buildKnockoutTree(current.groupPredictions, current.thirdPlaceQualifiers);
          const flat = flattenWinners(current.knockout);
          flat[matchId] = code;
          const { winners } = applyWinners(tree, flat);
          return { bracket: { ...current, knockout: groupWinners(winners) } };
        }),

      resetPredictions: () => set({ bracket: null }),
    }),
    { name: 'baggio-predictions' },
  ),
);

// ── Derived selectors (pure helpers, used by components) ─────────────────────
export function groupComplete(bracket: Bracket | null, g: GroupId): boolean {
  if (!bracket) return false;
  const picks = bracket.groupPredictions[g];
  return picks.every(Boolean) && new Set(picks).size === 4;
}

export function completedGroupCount(bracket: Bracket | null): number {
  if (!bracket) return 0;
  return GROUP_IDS.filter((g) => groupComplete(bracket, g)).length;
}

export function allGroupsComplete(bracket: Bracket | null): boolean {
  return completedGroupCount(bracket) === GROUP_IDS.length;
}

export function groupStageReady(bracket: Bracket | null): boolean {
  return allGroupsComplete(bracket) && (bracket?.thirdPlaceQualifiers.length ?? 0) === 8;
}

export function teamName(code: string): string {
  return TEAM_BY_CODE[code]?.name ?? code;
}

interface ProfileState {
  userName: string;
  setUserName: (name: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      userName: '',
      setUserName: (name) => set({ userName: name }),
    }),
    { name: 'baggio-profile' },
  ),
);

interface UIState {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    }),
    { name: 'baggio-ui' },
  ),
);
