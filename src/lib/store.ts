import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Bracket, GroupId } from './types';

interface PredictionState {
  bracket: Bracket | null;
  currentStep: 'groups' | 'knockout' | 'awards' | 'review';
  setBracket: (bracket: Bracket) => void;
  setStep: (step: PredictionState['currentStep']) => void;
  resetPredictions: () => void;
  setGroupPrediction: (groupId: GroupId, picks: [string, string, string, string]) => void;
}

function emptyBracket(): Bracket {
  const emptyGroup = ['', '', '', ''] as [string, string, string, string];
  return {
    groupPredictions: {
      A: emptyGroup, B: emptyGroup, C: emptyGroup, D: emptyGroup,
      E: emptyGroup, F: emptyGroup, G: emptyGroup, H: emptyGroup,
      I: emptyGroup, J: emptyGroup, K: emptyGroup, L: emptyGroup,
    },
    thirdPlaceQualifiers: [],
    knockout: {
      r32: {},
      r16: {},
      qf: {},
      sf: {},
      final: '',
      champion: '',
    },
  };
}

export const usePredictionStore = create<PredictionState>()(
  persist(
    (set, get) => ({
      bracket: null,
      currentStep: 'groups',

      setBracket: (bracket) => set({ bracket }),

      setGroupPrediction: (groupId, picks) =>
        set(state => {
          const current = state.bracket ?? emptyBracket();
          return {
            bracket: {
              ...current,
              groupPredictions: {
                ...current.groupPredictions,
                [groupId]: picks,
              },
            },
          };
        }),

      setStep: (step) => set({ currentStep: step }),

      resetPredictions: () => set({
        bracket: null,
        currentStep: 'groups',
      }),
    }),
    { name: 'baggio-predictions' }
  )
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
    { name: 'baggio-ui' }
  )
);
