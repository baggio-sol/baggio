import { Team, Player, Match } from './types';
import SOURCE from '@/data/worldcup2026.json';

// ─── Cosmetic lookup (stable country facts, NOT draw-dependent) ───────────────
// These are the only values not present in the source JSON.
// If a team is missing here its flag/code/color will degrade gracefully.
const COUNTRY_META: Record<string, { code: string; flag: string; color: string }> = {
  'Mexico':                  { code: 'MEX', flag: '🇲🇽', color: '#006847' },
  'South Korea':             { code: 'KOR', flag: '🇰🇷', color: '#c60c30' },
  'South Africa':            { code: 'RSA', flag: '🇿🇦', color: '#007a4d' },
  'Czechia':                 { code: 'CZE', flag: '🇨🇿', color: '#d7141a' },
  'Canada':                  { code: 'CAN', flag: '🇨🇦', color: '#ff0000' },
  'Switzerland':             { code: 'SUI', flag: '🇨🇭', color: '#ff0000' },
  'Qatar':                   { code: 'QAT', flag: '🇶🇦', color: '#8d1b3d' },
  'Bosnia and Herzegovina':  { code: 'BIH', flag: '🇧🇦', color: '#002395' },
  'Brazil':                  { code: 'BRA', flag: '🇧🇷', color: '#009c3b' },
  'Morocco':                 { code: 'MAR', flag: '🇲🇦', color: '#c1272d' },
  'Scotland':                { code: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: '#003087' },
  'Haiti':                   { code: 'HAI', flag: '🇭🇹', color: '#00209f' },
  'USA':                     { code: 'USA', flag: '🇺🇸', color: '#002868' },
  'Australia':               { code: 'AUS', flag: '🇦🇺', color: '#00843d' },
  'Paraguay':                { code: 'PAR', flag: '🇵🇾', color: '#d52b1e' },
  'Türkiye':                 { code: 'TUR', flag: '🇹🇷', color: '#e30a17' },
  'Germany':                 { code: 'GER', flag: '🇩🇪', color: '#000000' },
  'Ecuador':                 { code: 'ECU', flag: '🇪🇨', color: '#ffd100' },
  'Ivory Coast':             { code: 'CIV', flag: '🇨🇮', color: '#f77f00' },
  'Curaçao':                 { code: 'CUW', flag: '🇨🇼', color: '#003087' },
  'Netherlands':             { code: 'NED', flag: '🇳🇱', color: '#ff6600' },
  'Japan':                   { code: 'JPN', flag: '🇯🇵', color: '#bc002d' },
  'Tunisia':                 { code: 'TUN', flag: '🇹🇳', color: '#e70013' },
  'Sweden':                  { code: 'SWE', flag: '🇸🇪', color: '#006aa7' },
  'Belgium':                 { code: 'BEL', flag: '🇧🇪', color: '#000000' },
  'Iran':                    { code: 'IRN', flag: '🇮🇷', color: '#239f40' },
  'Egypt':                   { code: 'EGY', flag: '🇪🇬', color: '#ce1126' },
  'New Zealand':             { code: 'NZL', flag: '🇳🇿', color: '#00247d' },
  'Spain':                   { code: 'ESP', flag: '🇪🇸', color: '#c60b1e' },
  'Uruguay':                 { code: 'URU', flag: '🇺🇾', color: '#5aaaa8' },
  'Saudi Arabia':            { code: 'KSA', flag: '🇸🇦', color: '#006c35' },
  'Cape Verde':              { code: 'CPV', flag: '🇨🇻', color: '#003893' },
  'France':                  { code: 'FRA', flag: '🇫🇷', color: '#002395' },
  'Senegal':                 { code: 'SEN', flag: '🇸🇳', color: '#00853f' },
  'Norway':                  { code: 'NOR', flag: '🇳🇴', color: '#ef2b2d' },
  'Iraq':                    { code: 'IRQ', flag: '🇮🇶', color: '#ce1126' },
  'Argentina':               { code: 'ARG', flag: '🇦🇷', color: '#74acdf' },
  'Austria':                 { code: 'AUT', flag: '🇦🇹', color: '#ed2939' },
  'Algeria':                 { code: 'ALG', flag: '🇩🇿', color: '#006233' },
  'Jordan':                  { code: 'JOR', flag: '🇯🇴', color: '#007a3d' },
  'Portugal':                { code: 'POR', flag: '🇵🇹', color: '#006600' },
  'Colombia':                { code: 'COL', flag: '🇨🇴', color: '#fcd116' },
  'Uzbekistan':              { code: 'UZB', flag: '🇺🇿', color: '#1eb53a' },
  'DR Congo':                { code: 'COD', flag: '🇨🇩', color: '#007fff' },
  'England':                 { code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#012169' },
  'Croatia':                 { code: 'CRO', flag: '🇭🇷', color: '#ff0000' },
  'Panama':                  { code: 'PAN', flag: '🇵🇦', color: '#da121a' },
  'Ghana':                   { code: 'GHA', flag: '🇬🇭', color: '#006b3f' },
};

// ─── Derive Team ID from name (lowercase, alphanumeric) ───────────────────────
function toId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// ─── Build TEAMS from source ──────────────────────────────────────────────────
export const TEAMS: Team[] = SOURCE.groups.flatMap(g =>
  g.teams.map(name => {
    const meta = COUNTRY_META[name] ?? null;
    return {
      id: toId(name),
      name,
      code: meta?.code ?? name.slice(0, 3).toUpperCase(),
      flag: meta?.flag ?? '🏳',
      group: g.group,
      color: meta?.color ?? '#888888',
    };
  })
);

// ─── Build GROUPS_DATA from source ────────────────────────────────────────────
export const GROUPS_DATA: { name: string; teamIds: string[] }[] = SOURCE.groups.map(g => ({
  name: g.group,
  teamIds: g.teams.map(toId),
}));

// ─── PLAYERS — pending a verified source file ─────────────────────────────────
// ⚠ FLAG: No verified players data provided. Awards player lists are empty.
// Replace this array when a players source file is supplied.
export const PLAYERS: Player[] = [];

// ─── POINTS SYSTEM ────────────────────────────────────────────────────────────
export const POINTS_SYSTEM = {
  groupWinner: 3,
  groupDraw: 3,
  exactScore: 5,
  qualifiedTeam: 5,
  r32Qualifier: 6,
  quarterFinalist: 8,
  semiFinalist: 10,
  finalist: 15,
  champion: 25,
  goldenBoot: 15,
  goldenBall: 15,
  bestYoungPlayer: 10,
  goldenGlove: 10,
  mostAssists: 10,
  surpriseTeam: 15,
  biggestFlop: 10,
};

export function getTeamById(id: string): Team | undefined {
  return TEAMS.find(t => t.id === id);
}

export function getPlayerById(id: string): Player | undefined {
  return PLAYERS.find(p => p.id === id);
}

export function buildGroupMatches(groupName: string, teams: Team[]): Match[] {
  const matches: Match[] = [];
  let matchNum = 1;
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: `group-${groupName}-${teams[i].id}-${teams[j].id}`,
        homeTeam: teams[i],
        awayTeam: teams[j],
        date: '2026-06-15',
        venue: 'Stadium',
        stage: 'group',
        group: groupName,
        matchNumber: matchNum++,
        status: 'upcoming',
      });
    }
  }
  return matches;
}

export function calculateStandings(
  teams: Team[],
  predictions: Record<string, { homeScore: number; awayScore: number }>
): Record<string, { team: Team; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; gd: number; points: number }> {
  const standings: Record<string, { team: Team; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; gd: number; points: number }> = {};

  teams.forEach(team => {
    standings[team.id] = { team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
  });

  Object.entries(predictions).forEach(([matchId, pred]) => {
    const parts = matchId.split('-');
    if (parts.length < 4) return;
    const homeTeamId = parts[2];
    const awayTeamId = parts[3];
    if (!standings[homeTeamId] || !standings[awayTeamId]) return;

    const h = standings[homeTeamId];
    const a = standings[awayTeamId];
    h.played++; a.played++;
    h.gf += pred.homeScore; h.ga += pred.awayScore;
    a.gf += pred.awayScore; a.ga += pred.homeScore;
    h.gd = h.gf - h.ga; a.gd = a.gf - a.ga;

    if (pred.homeScore > pred.awayScore) { h.won++; h.points += 3; a.lost++; }
    else if (pred.homeScore < pred.awayScore) { a.won++; a.points += 3; h.lost++; }
    else { h.drawn++; a.drawn++; h.points++; a.points++; }
  });

  return standings;
}

export const TOURNAMENT = {
  id: 'wc2026',
  name: SOURCE.tournament,
  year: 2026,
  startDate: SOURCE.key_dates.opening_match,
  endDate: SOURCE.key_dates.final,
  host: SOURCE.hosts.join(', '),
  format: SOURCE.format,
};

export const COUNTDOWN_DATE = new Date('2026-06-11T18:00:00Z');
