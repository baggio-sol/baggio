import { Team, Player, Match, Group, Tournament } from './types';

export const TEAMS: Team[] = [
  { id: 'bra', name: 'Brazil', code: 'BRA', flag: '🇧🇷', group: 'A', color: '#009c3b' },
  { id: 'ser', name: 'Serbia', code: 'SRB', flag: '🇷🇸', group: 'A', color: '#c6363c' },
  { id: 'swi', name: 'Switzerland', code: 'SUI', flag: '🇨🇭', group: 'A', color: '#ff0000' },
  { id: 'cam', name: 'Cameroon', code: 'CMR', flag: '🇨🇲', group: 'A', color: '#007a5e' },
  { id: 'eng', name: 'England', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'B', color: '#012169' },
  { id: 'usa', name: 'USA', code: 'USA', flag: '🇺🇸', group: 'B', color: '#002868' },
  { id: 'ira', name: 'Iran', code: 'IRN', flag: '🇮🇷', group: 'B', color: '#239f40' },
  { id: 'wal', name: 'Wales', code: 'WAL', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', group: 'B', color: '#c8102e' },
  { id: 'arg', name: 'Argentina', code: 'ARG', flag: '🇦🇷', group: 'C', color: '#74acdf' },
  { id: 'ksa', name: 'Saudi Arabia', code: 'KSA', flag: '🇸🇦', group: 'C', color: '#006c35' },
  { id: 'mex', name: 'Mexico', code: 'MEX', flag: '🇲🇽', group: 'C', color: '#006847' },
  { id: 'pol', name: 'Poland', code: 'POL', flag: '🇵🇱', group: 'C', color: '#dc143c' },
  { id: 'fra', name: 'France', code: 'FRA', flag: '🇫🇷', group: 'D', color: '#002395' },
  { id: 'aus', name: 'Australia', code: 'AUS', flag: '🇦🇺', group: 'D', color: '#00843d' },
  { id: 'den', name: 'Denmark', code: 'DEN', flag: '🇩🇰', group: 'D', color: '#c60c30' },
  { id: 'tun', name: 'Tunisia', code: 'TUN', flag: '🇹🇳', group: 'D', color: '#e70013' },
  { id: 'spa', name: 'Spain', code: 'ESP', flag: '🇪🇸', group: 'E', color: '#c60b1e' },
  { id: 'crc', name: 'Costa Rica', code: 'CRC', flag: '🇨🇷', group: 'E', color: '#002b7f' },
  { id: 'ger', name: 'Germany', code: 'GER', flag: '🇩🇪', group: 'E', color: '#000000' },
  { id: 'jap', name: 'Japan', code: 'JPN', flag: '🇯🇵', group: 'E', color: '#bc002d' },
  { id: 'bel', name: 'Belgium', code: 'BEL', flag: '🇧🇪', group: 'F', color: '#000000' },
  { id: 'can', name: 'Canada', code: 'CAN', flag: '🇨🇦', group: 'F', color: '#ff0000' },
  { id: 'mor', name: 'Morocco', code: 'MAR', flag: '🇲🇦', group: 'F', color: '#c1272d' },
  { id: 'cro', name: 'Croatia', code: 'CRO', flag: '🇭🇷', group: 'F', color: '#ff0000' },
  { id: 'bra2', name: 'Brazil', code: 'BRA', flag: '🇧🇷', group: 'G', color: '#009c3b' },
  { id: 'srb', name: 'Serbia', code: 'SRB', flag: '🇷🇸', group: 'G', color: '#c6363c' },
  { id: 'swz', name: 'Switzerland', code: 'SUI', flag: '🇨🇭', group: 'G', color: '#ff0000' },
  { id: 'cmr', name: 'Cameroon', code: 'CMR', flag: '🇨🇲', group: 'G', color: '#007a5e' },
  { id: 'por', name: 'Portugal', code: 'POR', flag: '🇵🇹', group: 'H', color: '#006600' },
  { id: 'gha', name: 'Ghana', code: 'GHA', flag: '🇬🇭', group: 'H', color: '#006b3f' },
  { id: 'uru', name: 'Uruguay', code: 'URU', flag: '🇺🇾', group: 'H', color: '#5aaaa8' },
  { id: 'kor', name: 'South Korea', code: 'KOR', flag: '🇰🇷', group: 'H', color: '#c60c30' },
];

// Simplified 8-group tournament structure
export const GROUPS_DATA: { name: string; teamIds: string[] }[] = [
  { name: 'A', teamIds: ['bra', 'ser', 'swi', 'cam'] },
  { name: 'B', teamIds: ['eng', 'usa', 'ira', 'wal'] },
  { name: 'C', teamIds: ['arg', 'ksa', 'mex', 'pol'] },
  { name: 'D', teamIds: ['fra', 'aus', 'den', 'tun'] },
  { name: 'E', teamIds: ['spa', 'crc', 'ger', 'jap'] },
  { name: 'F', teamIds: ['bel', 'can', 'mor', 'cro'] },
  { name: 'G', teamIds: ['por', 'gha', 'uru', 'kor'] },
  { name: 'H', teamIds: ['por', 'gha', 'uru', 'kor'] },
];

export const PLAYERS: Player[] = [
  { id: 'neymar', name: 'Neymar Jr', teamId: 'bra', position: 'FW' },
  { id: 'vini', name: 'Vinicius Jr', teamId: 'bra', position: 'FW' },
  { id: 'mbappe', name: 'Kylian Mbappé', teamId: 'fra', position: 'FW' },
  { id: 'benzema', name: 'Karim Benzema', teamId: 'fra', position: 'FW' },
  { id: 'messi', name: 'Lionel Messi', teamId: 'arg', position: 'FW' },
  { id: 'dimaria', name: 'Ángel Di María', teamId: 'arg', position: 'MF' },
  { id: 'ronaldo', name: 'Cristiano Ronaldo', teamId: 'por', position: 'FW' },
  { id: 'bernardo', name: 'Bernardo Silva', teamId: 'por', position: 'MF' },
  { id: 'kane', name: 'Harry Kane', teamId: 'eng', position: 'FW' },
  { id: 'saka', name: 'Bukayo Saka', teamId: 'eng', position: 'FW' },
  { id: 'lewandowski', name: 'Robert Lewandowski', teamId: 'pol', position: 'FW' },
  { id: 'modric', name: 'Luka Modrić', teamId: 'cro', position: 'MF' },
  { id: 'muller', name: 'Thomas Müller', teamId: 'ger', position: 'MF' },
  { id: 'gnabry', name: 'Serge Gnabry', teamId: 'ger', position: 'FW' },
  { id: 'pedri', name: 'Pedri', teamId: 'spa', position: 'MF' },
  { id: 'morata', name: 'Álvaro Morata', teamId: 'spa', position: 'FW' },
  { id: 'hazard', name: 'Eden Hazard', teamId: 'bel', position: 'FW' },
  { id: 'lukaku', name: 'Romelu Lukaku', teamId: 'bel', position: 'FW' },
  { id: 'pulisic', name: 'Christian Pulisic', teamId: 'usa', position: 'FW' },
  { id: 'ziyech', name: 'Hakim Ziyech', teamId: 'mor', position: 'MF' },
  { id: 'suarez', name: 'Luis Suárez', teamId: 'uru', position: 'FW' },
  { id: 'son', name: 'Son Heung-min', teamId: 'kor', position: 'FW' },
  { id: 'salisu', name: 'Mohammed Salisu', teamId: 'gha', position: 'DF' },
  { id: 'alisson', name: 'Alisson Becker', teamId: 'bra', position: 'GK' },
  { id: 'courtois', name: 'Thibaut Courtois', teamId: 'bel', position: 'GK' },
  { id: 'lloris', name: 'Hugo Lloris', teamId: 'fra', position: 'GK' },
  { id: 'pickford', name: 'Jordan Pickford', teamId: 'eng', position: 'GK' },
  { id: 'pedri2', name: 'Gavi', teamId: 'spa', position: 'MF' },
  { id: 'bellingham', name: 'Jude Bellingham', teamId: 'eng', position: 'MF' },
  { id: 'pedros', name: 'Pedri González', teamId: 'spa', position: 'MF' },
];

export const POINTS_SYSTEM = {
  groupWinner: 3,
  groupDraw: 3,
  exactScore: 5,
  qualifiedTeam: 5,
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
        id: `group-${groupName}-${matchNum}`,
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

export function calculateStandings(teams: Team[], predictions: Record<string, { homeScore: number; awayScore: number }>): Record<string, { team: Team; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; gd: number; points: number }> {
  const standings: Record<string, { team: Team; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; gd: number; points: number }> = {};

  teams.forEach(team => {
    standings[team.id] = { team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
  });

  Object.entries(predictions).forEach(([matchId, pred]) => {
    const parts = matchId.split('-');
    if (parts.length < 3) return;
    const homeTeamId = parts[2];
    const awayTeamId = parts[3];
    if (!standings[homeTeamId] || !standings[awayTeamId]) return;

    const h = standings[homeTeamId];
    const a = standings[awayTeamId];
    h.played++;
    a.played++;
    h.gf += pred.homeScore;
    h.ga += pred.awayScore;
    a.gf += pred.awayScore;
    a.ga += pred.homeScore;
    h.gd = h.gf - h.ga;
    a.gd = a.gf - a.ga;

    if (pred.homeScore > pred.awayScore) {
      h.won++;
      h.points += 3;
      a.lost++;
    } else if (pred.homeScore < pred.awayScore) {
      a.won++;
      a.points += 3;
      h.lost++;
    } else {
      h.drawn++;
      a.drawn++;
      h.points++;
      a.points++;
    }
  });

  return standings;
}

export const TOURNAMENT: Tournament = {
  id: 'wc2026',
  name: 'FIFA World Cup 2026',
  year: 2026,
  startDate: '2026-06-11',
  endDate: '2026-07-19',
  host: 'USA, Canada & Mexico',
  groups: [],
  teams: TEAMS,
  players: PLAYERS,
};

export const COUNTDOWN_DATE = new Date('2026-06-11T18:00:00Z');
