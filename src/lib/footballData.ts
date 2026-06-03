// Server-side only — never imported from client components.
// Token is read from process.env, never serialised to the browser.

import SOURCE from '@/data/worldcup2026.json';

const BASE_URL = 'https://api.football-data.org/v4';
const COMPETITION = 'WC';
const CACHE_TTL_MS = 60_000; // 60 s minimum per free-tier rate limit

// ─── In-process cache ─────────────────────────────────────────────────────────
interface CacheEntry<T> { data: T; expiresAt: number }
const cache = new Map<string, CacheEntry<unknown>>();

function fromCache<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (entry && Date.now() < entry.expiresAt) return entry.data;
  return null;
}
function toCache<T>(key: string, data: T): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── Fetch with retry on 429 ──────────────────────────────────────────────────
async function apiFetch(path: string): Promise<unknown | null> {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) return null;

  const url = `${BASE_URL}${path}`;
  const delays = [2000, 4000, 8000, 16000];

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'X-Auth-Token': token },
        next: { revalidate: 60 },
      });

      if (res.status === 429) {
        const wait = delays[attempt];
        if (!wait) return null; // exhausted retries
        await new Promise(r => setTimeout(r, wait));
        continue;
      }

      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  return null;
}

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface LiveScore {
  homeScore: number | null;
  awayScore: number | null;
  status: 'SCHEDULED' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'SUSPENDED' | 'POSTPONED' | string;
}

export interface LiveMatch {
  matchId: string; // format matching source JSON match_id
  homeTeam: string;
  awayTeam: string;
  score: LiveScore;
  utcDate: string | null;
  venue: string | null;
}

export interface LiveGroupStanding {
  team: string;
  position: number;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

// ─── Fetch live matches ────────────────────────────────────────────────────────
async function fetchLiveMatches(): Promise<LiveMatch[]> {
  const cacheKey = 'matches';
  const cached = fromCache<LiveMatch[]>(cacheKey);
  if (cached) return cached;

  const data = await apiFetch(`/competitions/${COMPETITION}/matches`);
  if (!data || typeof data !== 'object') return [];

  const raw = (data as Record<string, unknown>).matches;
  if (!Array.isArray(raw)) return [];

  const matches: LiveMatch[] = raw
    .filter((m: unknown) => {
      if (typeof m !== 'object' || m === null) return false;
      const match = m as Record<string, unknown>;
      const stage = (match.stage as string | undefined) ?? '';
      return stage === 'GROUP_STAGE';
    })
    .map((m: unknown) => {
      const match = m as Record<string, unknown>;
      const score = (match.score as Record<string, unknown> | null) ?? {};
      const ft = (score.fullTime as Record<string, unknown> | null) ?? {};
      const homeTeamObj = (match.homeTeam as Record<string, unknown> | null) ?? {};
      const awayTeamObj = (match.awayTeam as Record<string, unknown> | null) ?? {};
      const area = (match.area as Record<string, unknown> | null) ?? {};
      return {
        matchId: String(match.id ?? ''),
        homeTeam: String(homeTeamObj.name ?? ''),
        awayTeam: String(awayTeamObj.name ?? ''),
        score: {
          homeScore: ft.home != null ? Number(ft.home) : null,
          awayScore: ft.away != null ? Number(ft.away) : null,
          status: String(score.duration ?? match.status ?? 'SCHEDULED'),
        },
        utcDate: match.utcDate ? String(match.utcDate) : null,
        venue: area.name ? String(area.name) : null,
      };
    });

  toCache(cacheKey, matches);
  return matches;
}

// ─── Fetch live standings ──────────────────────────────────────────────────────
async function fetchLiveStandings(): Promise<Record<string, LiveGroupStanding[]>> {
  const cacheKey = 'standings';
  const cached = fromCache<Record<string, LiveGroupStanding[]>>(cacheKey);
  if (cached) return cached;

  const data = await apiFetch(`/competitions/${COMPETITION}/standings`);
  if (!data || typeof data !== 'object') return {};

  const raw = (data as Record<string, unknown>).standings;
  if (!Array.isArray(raw)) return {};

  const result: Record<string, LiveGroupStanding[]> = {};

  for (const group of raw) {
    if (typeof group !== 'object' || group === null) continue;
    const g = group as Record<string, unknown>;
    const groupLabel = String(g.group ?? '').replace('GROUP_', '');
    const table = g.table;
    if (!Array.isArray(table)) continue;

    result[groupLabel] = table.map((row: unknown) => {
      const r = row as Record<string, unknown>;
      const team = (r.team as Record<string, unknown> | null) ?? {};
      return {
        team: String(team.name ?? ''),
        position: Number(r.position ?? 0),
        playedGames: Number(r.playedGames ?? 0),
        won: Number(r.won ?? 0),
        draw: Number(r.draw ?? 0),
        lost: Number(r.lost ?? 0),
        points: Number(r.points ?? 0),
        goalsFor: Number(r.goalsFor ?? 0),
        goalsAgainst: Number(r.goalsAgainst ?? 0),
        goalDifference: Number(r.goalDifference ?? 0),
      };
    });
  }

  toCache(cacheKey, result);
  return result;
}

// ─── Public: getGroups() ──────────────────────────────────────────────────────
// Returns group structure from source JSON with live scores/standings overlaid.
// Falls back cleanly to null scores if API is unavailable.
export interface GroupData {
  group: string;
  teams: string[];
  standings: LiveGroupStanding[] | null;
  matches: {
    match_id: string;
    home: string;
    away: string;
    date: string | null;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
  }[];
}

export async function getGroups(): Promise<GroupData[]> {
  // Fetch both in parallel; neither crash is fatal
  const [liveMatches, liveStandings] = await Promise.all([
    fetchLiveMatches().catch(() => [] as LiveMatch[]),
    fetchLiveStandings().catch(() => ({} as Record<string, LiveGroupStanding[]>)),
  ]);

  // Build lookup: "homeName|awayName" → live score
  const scoreByTeams = new Map<string, LiveMatch>();
  for (const m of liveMatches) {
    scoreByTeams.set(`${m.homeTeam}|${m.awayTeam}`, m);
    scoreByTeams.set(`${m.awayTeam}|${m.homeTeam}`, m);
  }

  return SOURCE.groups.map(g => {
    const standings = liveStandings[g.group] ?? null;

    const matches = g.matches.map(m => {
      const live = scoreByTeams.get(`${m.home}|${m.away}`);
      return {
        match_id: m.match_id,
        home: m.home,
        away: m.away,
        date: live?.utcDate ?? null,
        homeScore: live?.score.homeScore ?? null,
        awayScore: live?.score.awayScore ?? null,
        status: live?.score.status ?? 'SCHEDULED',
      };
    });

    return { group: g.group, teams: g.teams, standings, matches };
  });
}
