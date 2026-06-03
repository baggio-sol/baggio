import { Team, GroupId } from './types';

export const TEAMS: Team[] = [
  { name: 'Brazil', code: 'BRA', flag: '🇧🇷', tier: 1, group: 'A' },
  { name: 'Serbia', code: 'SRB', flag: '🇷🇸', tier: 3, group: 'A' },
  { name: 'Switzerland', code: 'SUI', flag: '🇨🇭', tier: 3, group: 'A' },
  { name: 'Cameroon', code: 'CMR', flag: '🇨🇲', tier: 5, group: 'A' },
  { name: 'England', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', tier: 1, group: 'B' },
  { name: 'USA', code: 'USA', flag: '🇺🇸', tier: 3, group: 'B' },
  { name: 'Iran', code: 'IRN', flag: '🇮🇷', tier: 4, group: 'B' },
  { name: 'Wales', code: 'WAL', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', tier: 4, group: 'B' },
  { name: 'Argentina', code: 'ARG', flag: '🇦🇷', tier: 1, group: 'C' },
  { name: 'Saudi Arabia', code: 'KSA', flag: '🇸🇦', tier: 4, group: 'C' },
  { name: 'Mexico', code: 'MEX', flag: '🇲🇽', tier: 3, group: 'C' },
  { name: 'Poland', code: 'POL', flag: '🇵🇱', tier: 3, group: 'C' },
  { name: 'France', code: 'FRA', flag: '🇫🇷', tier: 1, group: 'D' },
  { name: 'Australia', code: 'AUS', flag: '🇦🇺', tier: 4, group: 'D' },
  { name: 'Denmark', code: 'DEN', flag: '🇩🇰', tier: 3, group: 'D' },
  { name: 'Tunisia', code: 'TUN', flag: '🇹🇳', tier: 5, group: 'D' },
  { name: 'Spain', code: 'ESP', flag: '🇪🇸', tier: 1, group: 'E' },
  { name: 'Costa Rica', code: 'CRC', flag: '🇨🇷', tier: 5, group: 'E' },
  { name: 'Germany', code: 'GER', flag: '🇩🇪', tier: 2, group: 'E' },
  { name: 'Japan', code: 'JPN', flag: '🇯🇵', tier: 4, group: 'E' },
  { name: 'Belgium', code: 'BEL', flag: '🇧🇪', tier: 2, group: 'F' },
  { name: 'Canada', code: 'CAN', flag: '🇨🇦', tier: 3, group: 'F' },
  { name: 'Morocco', code: 'MAR', flag: '🇲🇦', tier: 3, group: 'F' },
  { name: 'Croatia', code: 'CRO', flag: '🇭🇷', tier: 2, group: 'F' },
  { name: 'Portugal', code: 'POR', flag: '🇵🇹', tier: 1, group: 'G' },
  { name: 'Ghana', code: 'GHA', flag: '🇬🇭', tier: 5, group: 'G' },
  { name: 'Uruguay', code: 'URU', flag: '🇺🇾', tier: 2, group: 'G' },
  { name: 'South Korea', code: 'KOR', flag: '🇰🇷', tier: 3, group: 'G' },
  { name: 'Netherlands', code: 'NED', flag: '🇳🇱', tier: 2, group: 'H' },
  { name: 'Senegal', code: 'SEN', flag: '🇸🇳', tier: 3, group: 'H' },
  { name: 'Ecuador', code: 'ECU', flag: '🇪🇨', tier: 4, group: 'H' },
  { name: 'Qatar', code: 'QAT', flag: '🇶🇦', tier: 5, group: 'H' },
  { name: 'Italy', code: 'ITA', flag: '🇮🇹', tier: 2, group: 'I' },
  { name: 'Colombia', code: 'COL', flag: '🇨🇴', tier: 3, group: 'I' },
  { name: 'Chile', code: 'CHI', flag: '🇨🇱', tier: 4, group: 'I' },
  { name: 'Honduras', code: 'HON', flag: '🇭🇳', tier: 5, group: 'I' },
  { name: 'Nigeria', code: 'NGA', flag: '🇳🇬', tier: 3, group: 'J' },
  { name: 'Turkey', code: 'TUR', flag: '🇹🇷', tier: 3, group: 'J' },
  { name: 'Paraguay', code: 'PAR', flag: '🇵🇾', tier: 4, group: 'J' },
  { name: 'New Zealand', code: 'NZL', flag: '🇳🇿', tier: 5, group: 'J' },
  { name: 'Ukraine', code: 'UKR', flag: '🇺🇦', tier: 3, group: 'K' },
  { name: 'Egypt', code: 'EGY', flag: '🇪🇬', tier: 3, group: 'K' },
  { name: 'Algeria', code: 'ALG', flag: '🇩🇿', tier: 4, group: 'K' },
  { name: 'Bolivia', code: 'BOL', flag: '🇧🇴', tier: 5, group: 'K' },
  { name: 'Ivory Coast', code: 'CIV', flag: '🇨🇮', tier: 3, group: 'L' },
  { name: 'Romania', code: 'ROU', flag: '🇷🇴', tier: 4, group: 'L' },
  { name: 'Cameroon2', code: 'CMR', flag: '🇨🇲', tier: 5, group: 'L' },
  { name: 'Venezuela', code: 'VEN', flag: '🇻🇪', tier: 5, group: 'L' },
];

export function getTeamsByGroup(group: GroupId): Team[] {
  return TEAMS.filter(t => t.group === group);
}

export const GROUP_IDS: GroupId[] = ['A','B','C','D','E','F','G','H','I','J','K','L'];

export const COUNTDOWN_DATE = new Date('2026-06-11T18:00:00Z');
