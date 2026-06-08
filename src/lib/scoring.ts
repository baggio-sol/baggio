// lib/scoring.ts — points calculation from real results vs bracket predictions
// Points scale: group +3/exact position, 3rd-place qualifiers +4 each,
// knockout R32 +5, R16 +8, QF +12, SF +18, Final +30, champion bonus +15.

import type { Bracket, GroupId } from './types';
import { GROUP_IDS } from './tournament';

export interface MatchResult {
  match_id: string;   // e.g. 'M1' (group) or 'M73' (knockout)
  winner: string;     // team code of winner, or '' for draw
  home_score: number;
  away_score: number;
}

// Group standings derived from results (home/away team codes encoded in match_id context)
export interface GroupStandings {
  group: GroupId;
  standings: [string, string, string, string]; // 1st→4th team codes
}

export interface ScoringResult {
  points: number;
  breakdown: {
    group: number;
    thirdPlace: number;
    r32: number;
    r16: number;
    qf: number;
    sf: number;
    final: number;
    champion: number;
  };
}

const KNOCKOUT_POINTS: Record<string, number> = {
  r32: 5,
  r16: 8,
  qf: 12,
  sf: 18,
  final: 30,
};

export function scoreGroupStage(
  bracket: Bracket,
  actualStandings: Partial<Record<GroupId, [string, string, string, string]>>,
): number {
  let pts = 0;
  for (const g of GROUP_IDS) {
    const actual = actualStandings[g];
    const predicted = bracket.groupPredictions[g];
    if (!actual || !predicted) continue;
    for (let i = 0; i < 4; i++) {
      if (predicted[i] === actual[i]) pts += 3;
    }
  }
  return pts;
}

export function scoreThirdPlace(
  bracket: Bracket,
  actualThirdPlaceQualifiers: string[],
): number {
  if (!actualThirdPlaceQualifiers.length) return 0;
  return bracket.thirdPlaceQualifiers.filter(code =>
    actualThirdPlaceQualifiers.includes(code)
  ).length * 4;
}

export function scoreKnockout(
  bracket: Bracket,
  actualKnockoutWinners: Record<string, { winner: string; round: string }>,
): { r32: number; r16: number; qf: number; sf: number; final: number; champion: number } {
  const result = { r32: 0, r16: 0, qf: 0, sf: 0, final: 0, champion: 0 };

  for (const [matchId, { winner, round }] of Object.entries(actualKnockoutWinners)) {
    const roundKey = round as keyof typeof result;
    if (!(roundKey in KNOCKOUT_POINTS)) continue;

    const roundPicks = bracket.knockout[roundKey as keyof typeof bracket.knockout];
    if (typeof roundPicks === 'object' && roundPicks !== null) {
      const predicted = (roundPicks as Record<string, string>)[matchId];
      if (predicted === winner) {
        result[roundKey] += KNOCKOUT_POINTS[round];
      }
    }
  }

  // Champion bonus
  if (bracket.knockout.champion) {
    const finalResult = Object.values(actualKnockoutWinners).find(r => r.round === 'final');
    if (finalResult && bracket.knockout.champion === finalResult.winner) {
      result.champion = 15;
    }
  }

  return result;
}

export function scoreBracket(
  bracket: Bracket,
  actualStandings: Partial<Record<GroupId, [string, string, string, string]>>,
  actualThirdPlaceQualifiers: string[],
  actualKnockoutWinners: Record<string, { winner: string; round: string }>,
): ScoringResult {
  const group = scoreGroupStage(bracket, actualStandings);
  const thirdPlace = scoreThirdPlace(bracket, actualThirdPlaceQualifiers);
  const knockoutBreakdown = scoreKnockout(bracket, actualKnockoutWinners);

  const points = group + thirdPlace +
    knockoutBreakdown.r32 + knockoutBreakdown.r16 + knockoutBreakdown.qf +
    knockoutBreakdown.sf + knockoutBreakdown.final + knockoutBreakdown.champion;

  return {
    points,
    breakdown: { group, thirdPlace, ...knockoutBreakdown },
  };
}
