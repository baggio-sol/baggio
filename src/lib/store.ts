import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Prediction, KnockoutBracket, TournamentAwards, Team, BracketMatch } from './types';
import { TEAMS, GROUPS_DATA } from './data';

interface PredictionState {
  groupPredictions: Record<string, Prediction>;
  knockoutBracket: KnockoutBracket;
  awards: TournamentAwards;
  totalPoints: number;
  currentStep: 'groups' | 'knockout' | 'awards' | 'review';
  setGroupPrediction: (matchId: string, prediction: Prediction) => void;
  setKnockoutPrediction: (stage: string, position: number, winner: Team, homeScore?: number, awayScore?: number, penaltyWinner?: Team) => void;
  setAward: (award: keyof TournamentAwards, value: Team | import('./types').Player) => void;
  setStep: (step: PredictionState['currentStep']) => void;
  buildKnockoutFromGroups: () => void;
  resetPredictions: () => void;
}

// R32: 16 matches (24 known group qualifiers + 8 TBD 3rd-placed slots)
// Pairing: adjacent group pairs AB, CD, EF, GH, IJ, KL → 12 known matches + 4 TBD-only matches
function emptyBracket(): KnockoutBracket {
  return {
    r32: Array.from({ length: 16 }, (_, i) => ({
      id: `r32-${i}`,
      homeTeam: null,
      awayTeam: null,
      stage: 'r32',
      position: i,
    })),
    r16: Array.from({ length: 8 }, (_, i) => ({
      id: `r16-${i}`,
      homeTeam: null,
      awayTeam: null,
      stage: 'r16',
      position: i,
    })),
    qf: Array.from({ length: 4 }, (_, i) => ({
      id: `qf-${i}`,
      homeTeam: null,
      awayTeam: null,
      stage: 'qf',
      position: i,
    })),
    sf: Array.from({ length: 2 }, (_, i) => ({
      id: `sf-${i}`,
      homeTeam: null,
      awayTeam: null,
      stage: 'sf',
      position: i,
    })),
    third: { id: 'third', homeTeam: null, awayTeam: null, stage: '3rd', position: 0 },
    final: { id: 'final', homeTeam: null, awayTeam: null, stage: 'final', position: 0 },
    winner: null,
  };
}

export const usePredictionStore = create<PredictionState>()(
  persist(
    (set, get) => ({
      groupPredictions: {},
      knockoutBracket: emptyBracket(),
      awards: {},
      totalPoints: 0,
      currentStep: 'groups',

      setGroupPrediction: (matchId, prediction) =>
        set(state => ({
          groupPredictions: { ...state.groupPredictions, [matchId]: prediction },
        })),

      setKnockoutPrediction: (stage, position, winner, homeScore, awayScore, penaltyWinner) =>
        set(state => {
          const bracket = { ...state.knockoutBracket };

          const updateMatch = (matches: BracketMatch[], pos: number) => {
            const idx = matches.findIndex(m => m.position === pos);
            if (idx !== -1) {
              matches[idx] = { ...matches[idx], winner, homeScore, awayScore, penaltyWinner };
            }
            return matches;
          };

          if (stage === 'r32') {
            bracket.r32 = updateMatch([...bracket.r32], position);
            // Propagate to R16
            const r16Pos = Math.floor(position / 2);
            const isHome = position % 2 === 0;
            const r16Idx = bracket.r16.findIndex(m => m.position === r16Pos);
            if (r16Idx !== -1) {
              bracket.r16[r16Idx] = {
                ...bracket.r16[r16Idx],
                [isHome ? 'homeTeam' : 'awayTeam']: winner,
                winner: undefined,
              };
            }
          } else if (stage === 'r16') {
            bracket.r16 = updateMatch([...bracket.r16], position);
            const qfPos = Math.floor(position / 2);
            const isHome = position % 2 === 0;
            const qfIdx = bracket.qf.findIndex(m => m.position === qfPos);
            if (qfIdx !== -1) {
              bracket.qf[qfIdx] = {
                ...bracket.qf[qfIdx],
                [isHome ? 'homeTeam' : 'awayTeam']: winner,
                winner: undefined,
              };
            }
          } else if (stage === 'qf') {
            bracket.qf = updateMatch([...bracket.qf], position);
            const sfPos = Math.floor(position / 2);
            const isHome = position % 2 === 0;
            const sfIdx = bracket.sf.findIndex(m => m.position === sfPos);
            if (sfIdx !== -1) {
              bracket.sf[sfIdx] = {
                ...bracket.sf[sfIdx],
                [isHome ? 'homeTeam' : 'awayTeam']: winner,
                winner: undefined,
              };
            }
          } else if (stage === 'sf') {
            bracket.sf = updateMatch([...bracket.sf], position);
            const isHome = position === 0;
            if (bracket.final) {
              bracket.final = {
                ...bracket.final,
                [isHome ? 'homeTeam' : 'awayTeam']: winner,
                winner: undefined,
              };
            }
            const match = bracket.sf.find(m => m.position === position);
            const loser = match ? (match.homeTeam?.id === winner.id ? match.awayTeam : match.homeTeam) : null;
            if (bracket.third && loser) {
              bracket.third = {
                ...bracket.third,
                [isHome ? 'homeTeam' : 'awayTeam']: loser,
              };
            }
          } else if (stage === 'final') {
            if (bracket.final) {
              bracket.final = { ...bracket.final, winner, homeScore, awayScore };
              bracket.winner = winner;
            }
          } else if (stage === '3rd') {
            if (bracket.third) {
              bracket.third = { ...bracket.third, winner, homeScore, awayScore };
            }
          }

          return { knockoutBracket: bracket };
        }),

      setAward: (award, value) =>
        set(state => ({
          awards: { ...state.awards, [award]: value },
        })),

      setStep: (step) => set({ currentStep: step }),

      buildKnockoutFromGroups: () => {
        const { groupPredictions } = get();
        const bracket = emptyBracket();

        // Calculate top-2 qualifiers per group from predictions
        const groupQualifiers: Record<string, { first: Team | null; second: Team | null }> = {};

        GROUPS_DATA.forEach(({ name, teamIds }) => {
          const teams = teamIds.map(id => TEAMS.find(t => t.id === id)!).filter(Boolean);
          const standings: Record<string, { team: Team; points: number; gd: number; gf: number }> = {};
          teams.forEach(t => { standings[t.id] = { team: t, points: 0, gd: 0, gf: 0 }; });

          Object.entries(groupPredictions).forEach(([matchId, pred]) => {
            if (!matchId.startsWith(`group-${name}-`)) return;
            const parts = matchId.split('-');
            if (parts.length < 4) return;
            const homeId = parts[2];
            const awayId = parts[3];
            if (!standings[homeId] || !standings[awayId]) return;
            standings[homeId].gf += pred.homeScore;
            standings[homeId].gd += pred.homeScore - pred.awayScore;
            standings[awayId].gf += pred.awayScore;
            standings[awayId].gd += pred.awayScore - pred.homeScore;
            if (pred.homeScore > pred.awayScore) standings[homeId].points += 3;
            else if (pred.awayScore > pred.homeScore) standings[awayId].points += 3;
            else { standings[homeId].points += 1; standings[awayId].points += 1; }
          });

          const sorted = Object.values(standings).sort((a, b) =>
            b.points - a.points || b.gd - a.gd || b.gf - a.gf
          );

          groupQualifiers[name] = {
            first: sorted[0]?.team ?? null,
            second: sorted[1]?.team ?? null,
          };
        });

        // R32 pairing: adjacent group pairs AB, CD, EF, GH, IJ, KL
        // Each pair generates 2 matches: X1 vs Y2 and Y1 vs X2
        // Positions 0-11 use known qualifiers; positions 12-15 are TBD (best 3rd-placed)
        const groupNames = GROUPS_DATA.map(g => g.name);
        const r32Matchups: { homeKey: string; awayKey: string }[] = [];

        for (let i = 0; i < groupNames.length; i += 2) {
          const g1 = groupNames[i];
          const g2 = groupNames[i + 1];
          if (!g1 || !g2) break;
          r32Matchups.push({ homeKey: `${g1}1`, awayKey: `${g2}2` });
          r32Matchups.push({ homeKey: `${g2}1`, awayKey: `${g1}2` });
        }

        bracket.r32 = bracket.r32.map((slot, i) => {
          const m = r32Matchups[i];
          if (!m) return slot; // TBD 3rd-placed slots (positions 12-15)
          const homeGroupName = m.homeKey.slice(0, -1);
          const homePos = m.homeKey.slice(-1);
          const awayGroupName = m.awayKey.slice(0, -1);
          const awayPos = m.awayKey.slice(-1);
          const homeTeam = homePos === '1' ? groupQualifiers[homeGroupName]?.first : groupQualifiers[homeGroupName]?.second;
          const awayTeam = awayPos === '1' ? groupQualifiers[awayGroupName]?.first : groupQualifiers[awayGroupName]?.second;
          return {
            ...slot,
            homeTeam: homeTeam ?? null,
            awayTeam: awayTeam ?? null,
          };
        });

        set({ knockoutBracket: bracket });
      },

      resetPredictions: () => set({
        groupPredictions: {},
        knockoutBracket: emptyBracket(),
        awards: {},
        totalPoints: 0,
        currentStep: 'groups',
      }),
    }),
    { name: 'baggio-predictions' }
  )
);

interface UIState {
  theme: 'dark' | 'light';
  mobileMenuOpen: boolean;
  toggleTheme: () => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      mobileMenuOpen: false,
      toggleTheme: () => set(state => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    }),
    { name: 'baggio-ui' }
  )
);
