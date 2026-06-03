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

function emptyBracket(): KnockoutBracket {
  return {
    r32: [],
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

          if (stage === 'r16') {
            bracket.r16 = updateMatch([...bracket.r16], position);
            // Propagate to QF
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
            // Third place losers
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

        // Calculate group winners/runners-up from predictions
        const groupQualifiers: Record<string, { first: Team | null; second: Team | null }> = {};

        GROUPS_DATA.forEach(({ name, teamIds }) => {
          const teams = teamIds.map(id => TEAMS.find(t => t.id === id)!).filter(Boolean);
          const standings: Record<string, { team: Team; points: number; gd: number; gf: number }> = {};
          teams.forEach(t => { standings[t.id] = { team: t, points: 0, gd: 0, gf: 0 }; });

          // Parse predictions for this group
          Object.entries(groupPredictions).forEach(([matchId, pred]) => {
            if (!matchId.startsWith(`group-${name}-`)) return;
            const parts = matchId.split('-');
            if (parts.length < 5) return;
            const homeId = parts[3];
            const awayId = parts[4];
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
            first: sorted[0]?.team || null,
            second: sorted[1]?.team || null,
          };
        });

        // Populate R16 (groups A-H: A1vsB2, B1vsA2, C1vsD2, D1vsC2, E1vsF2, F1vsE2, G1vsH2, H1vsG2)
        const groupNames = GROUPS_DATA.map(g => g.name);
        const r16Matchups = [
          { home: `${groupNames[0]}1`, away: `${groupNames[1]}2` },
          { home: `${groupNames[1]}1`, away: `${groupNames[0]}2` },
          { home: `${groupNames[2]}1`, away: `${groupNames[3]}2` },
          { home: `${groupNames[3]}1`, away: `${groupNames[2]}2` },
          { home: `${groupNames[4]}1`, away: `${groupNames[5]}2` },
          { home: `${groupNames[5]}1`, away: `${groupNames[4]}2` },
          { home: `${groupNames[6]}1`, away: `${groupNames[7]}2` },
          { home: `${groupNames[7]}1`, away: `${groupNames[6]}2` },
        ];

        bracket.r16 = r16Matchups.map((m, i) => {
          const homeGroupName = m.home.slice(0, -1);
          const homePos = m.home.slice(-1);
          const awayGroupName = m.away.slice(0, -1);
          const awayPos = m.away.slice(-1);
          const homeTeam = homePos === '1' ? groupQualifiers[homeGroupName]?.first : groupQualifiers[homeGroupName]?.second;
          const awayTeam = awayPos === '1' ? groupQualifiers[awayGroupName]?.first : groupQualifiers[awayGroupName]?.second;
          return {
            id: `r16-${i}`,
            homeTeam: homeTeam || null,
            awayTeam: awayTeam || null,
            stage: 'r16',
            position: i,
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
