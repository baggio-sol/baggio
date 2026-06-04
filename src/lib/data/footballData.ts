// lib/data/footballData.ts — football-data.org adapter for WC2026 results
// API docs: https://www.football-data.org/documentation/quickstart
// Free tier: 10 req/min, WC2026 competition ID = 2000 (confirmed once tournament starts)

import type { GroupId } from '../types';
import { TEAM_BY_CODE, TEAMS } from '../tournament';

const BASE = 'https://api.football-data.org/v4';
const WC_ID = 2000; // FIFA World Cup 2026 competition ID

// Map football-data.org 3-letter codes → our internal codes where they differ
const FD_CODE_MAP: Record<string, string> = {
  'BIH': 'BIH',
  'CPV': 'CPV',
  'CUW': 'CUW',
  'KSA': 'KSA',
  'USA': 'USA',
  'ENG': 'ENG',
  'SCO': 'SCO',
  'RSA': 'RSA',
  'IRQ': 'IRQ',
  'COD': 'COD',
  'UZB': 'UZB',
  'PAR': 'PAR',
  'HAI': 'HAI',
  'NZL': 'NZL',
  'ALG': 'ALG',
  'JOR': 'JOR',
};

function normalizeCode(fdCode: string): string {
  return FD_CODE_MAP[fdCode] ?? fdCode;
}

async function fdFetch(path: string) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) throw new Error('FOOTBALL_DATA_API_KEY not set');

  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-Auth-Token': apiKey },
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error(`football-data.org ${res.status}: ${path}`);
  return res.json();
}

export interface FDMatch {
  id: number;
  matchday: number;
  stage: string; // 'GROUP_STAGE' | 'ROUND_OF_32' | 'ROUND_OF_16' | 'QUARTER_FINALS' | 'SEMI_FINALS' | 'FINAL'
  status: string; // 'FINISHED' | 'SCHEDULED' | 'IN_PLAY' | 'TIMED'
  group: string | null; // 'GROUP_A' etc.
  homeTeam: { tla: string; name: string };
  awayTeam: { tla: string; name: string };
  score: {
    fullTime: { home: number | null; away: number | null };
    winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
  };
}

export async function fetchAllMatches(): Promise<FDMatch[]> {
  const data = await fdFetch(`/competitions/${WC_ID}/matches`);
  return data.matches ?? [];
}

export interface ProcessedGroupStandings {
  standings: Partial<Record<GroupId, [string, string, string, string]>>;
  thirdPlaceQualifiers: string[]; // 8 best 3rd-place teams (once group stage done)
}

export interface ProcessedKnockoutResults {
  // matchId (our M73-M104 format) → { winner, round }
  winners: Record<string, { winner: string; round: string }>;
}

const STAGE_TO_ROUND: Record<string, string> = {
  'ROUND_OF_32': 'r32',
  'ROUND_OF_16': 'r16',
  'QUARTER_FINALS': 'qf',
  'SEMI_FINALS': 'sf',
  'FINAL': 'final',
};

// football-data.org uses sequential match IDs; we map by stage+homeTeam+awayTeam
// to our M73-M104 IDs via the tournament structure.
// For group stage we use group + matchday + teams to derive standings.

export function processGroupStandings(matches: FDMatch[]): ProcessedGroupStandings {
  const groupMatches = matches.filter(m => m.stage === 'GROUP_STAGE' && m.status === 'FINISHED');

  // Accumulate points per team per group
  const pointsMap: Record<string, Record<string, number>> = {};
  const gdMap: Record<string, Record<string, number>> = {};
  const gfMap: Record<string, Record<string, number>> = {};

  for (const m of groupMatches) {
    if (!m.group) continue;
    const groupLetter = m.group.replace('GROUP_', '') as GroupId;
    const homeCode = normalizeCode(m.homeTeam.tla);
    const awayCode = normalizeCode(m.awayTeam.tla);
    const homeScore = m.score.fullTime.home ?? 0;
    const awayScore = m.score.fullTime.away ?? 0;

    if (!pointsMap[groupLetter]) { pointsMap[groupLetter] = {}; gdMap[groupLetter] = {}; gfMap[groupLetter] = {}; }

    pointsMap[groupLetter][homeCode] = (pointsMap[groupLetter][homeCode] ?? 0);
    pointsMap[groupLetter][awayCode] = (pointsMap[groupLetter][awayCode] ?? 0);

    if (m.score.winner === 'HOME_TEAM') {
      pointsMap[groupLetter][homeCode] += 3;
    } else if (m.score.winner === 'AWAY_TEAM') {
      pointsMap[groupLetter][awayCode] += 3;
    } else {
      pointsMap[groupLetter][homeCode] += 1;
      pointsMap[groupLetter][awayCode] += 1;
    }

    gdMap[groupLetter][homeCode] = (gdMap[groupLetter][homeCode] ?? 0) + homeScore - awayScore;
    gdMap[groupLetter][awayCode] = (gdMap[groupLetter][awayCode] ?? 0) + awayScore - homeScore;
    gfMap[groupLetter][homeCode] = (gfMap[groupLetter][homeCode] ?? 0) + homeScore;
    gfMap[groupLetter][awayCode] = (gfMap[groupLetter][awayCode] ?? 0) + awayScore;
  }

  const standings: Partial<Record<GroupId, [string, string, string, string]>> = {};
  const thirdPlaceTeams: { code: string; pts: number; gd: number; gf: number }[] = [];

  for (const [g, pts] of Object.entries(pointsMap)) {
    const group = g as GroupId;
    const teams = Object.keys(pts);
    if (teams.length < 4) continue; // group not complete

    // Only finalise standings once all 6 matches are played
    const groupMatchesCount = groupMatches.filter(m => m.group === `GROUP_${g}`).length;
    if (groupMatchesCount < 6) continue;

    teams.sort((a, b) => {
      const pd = (pts[b] ?? 0) - (pts[a] ?? 0);
      if (pd !== 0) return pd;
      const gdd = (gdMap[g][b] ?? 0) - (gdMap[g][a] ?? 0);
      if (gdd !== 0) return gdd;
      return (gfMap[g][b] ?? 0) - (gfMap[g][a] ?? 0);
    });

    standings[group] = teams as [string, string, string, string];

    // Collect 3rd-place team for best-third selection
    const third = teams[2];
    thirdPlaceTeams.push({ code: third, pts: pts[third] ?? 0, gd: gdMap[g][third] ?? 0, gf: gfMap[g][third] ?? 0 });
  }

  // Best 8 third-place teams (by pts, then gd, then gf)
  thirdPlaceTeams.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });
  const thirdPlaceQualifiers = thirdPlaceTeams.slice(0, 8).map(t => t.code);

  return { standings, thirdPlaceQualifiers };
}

export function processKnockoutResults(matches: FDMatch[]): Record<string, { winner: string; round: string }> {
  const knockoutMatches = matches.filter(
    m => m.stage !== 'GROUP_STAGE' && m.status === 'FINISHED' && m.score.winner
  );

  // We can't reliably map football-data match IDs to our M73-M104 IDs without
  // knowing the actual bracket. Instead we store by a stable key:
  // "<round>:<homeCode>:<awayCode>" and let the scoring function look up by teams.
  // For now, return an empty map — the cron job writes to the `results` table
  // using match_id keys, and scoring reads from there.
  const winners: Record<string, { winner: string; round: string }> = {};

  for (const m of knockoutMatches) {
    const round = STAGE_TO_ROUND[m.stage];
    if (!round) continue;
    const homeCode = normalizeCode(m.homeTeam.tla);
    const awayCode = normalizeCode(m.awayTeam.tla);
    const winner = m.score.winner === 'HOME_TEAM' ? homeCode : awayCode;
    // Use a deterministic key: sorted team codes + round
    const key = `${round}:${[homeCode, awayCode].sort().join(':')}`;
    winners[key] = { winner, round };
  }

  return winners;
}

export { normalizeCode };
