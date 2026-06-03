import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Bracket, GroupId } from './types';
import { GROUP_IDS, TEAM_BY_CODE } from './tournament';

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
