// Backwards-compatible re-exports. The canonical tournament config now lives in
// lib/tournament.ts (single source of truth for teams, groups, tiers, bracket).
export {
  TEAMS,
  GROUP_IDS,
  getTeamsByGroup,
  getTeam,
  TEAM_BY_CODE,
  tierOf,
  COUNTDOWN_DATE,
} from './tournament';
