export interface Team {
  id: string;
  name: string;
  code: string;
  flag: string;
  group?: string;
  color?: string;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  position: string;
  number?: number;
  photo?: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  venue: string;
  stage: 'group' | 'r32' | 'r16' | 'qf' | 'sf' | '3rd' | 'final';
  group?: string;
  matchNumber?: number;
  homeScore?: number;
  awayScore?: number;
  status: 'upcoming' | 'live' | 'finished';
}

export interface Prediction {
  matchId: string;
  homeScore: number;
  awayScore: number;
  winner: string | 'draw';
  penaltyWinner?: string;
}

export interface GroupStanding {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface KnockoutBracket {
  r32: BracketMatch[];
  r16: BracketMatch[];
  qf: BracketMatch[];
  sf: BracketMatch[];
  third: BracketMatch | null;
  final: BracketMatch | null;
  winner: Team | null;
}

export interface BracketMatch {
  id: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeScore?: number;
  awayScore?: number;
  winner?: Team | null;
  penaltyWinner?: Team | null;
  stage: string;
  position: number;
}

export interface TournamentAwards {
  goldenBoot?: Player;
  goldenBall?: Player;
  bestYoungPlayer?: Player;
  goldenGlove?: Player;
  mostAssists?: Player;
  surpriseTeam?: Team;
  biggestFlop?: Team;
}

export interface UserPrediction {
  userId: string;
  tournamentId: string;
  groupPredictions: Record<string, Prediction>;
  knockoutBracket: KnockoutBracket;
  awards: TournamentAwards;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  country?: string;
  totalPoints: number;
  correctScores: number;
  correctResults: number;
}

export interface League {
  id: string;
  name: string;
  code: string;
  adminId: string;
  members: string[];
  createdAt: string;
}

export interface Group {
  name: string;
  teams: Team[];
  matches: Match[];
  standings: GroupStanding[];
}

export interface Tournament {
  id: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  host: string;
  logo?: string;
  groups: Group[];
  teams: Team[];
  players: Player[];
}
