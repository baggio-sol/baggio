export type Tier = 1|2|3|4|5;
export type GroupId = 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L';

export interface Team {
  name: string;
  code: string;
  flag: string;
  tier: Tier;
  group: GroupId;
  rank?: number; // FIFA world ranking (approximate)
}

export interface Bracket {
  groupPredictions: Record<GroupId, [string,string,string,string]>;
  thirdPlaceQualifiers: string[];
  knockout: {
    r32: Record<string,string>;
    r16: Record<string,string>;
    qf:  Record<string,string>;
    sf:  Record<string,string>;
    final: string;
    champion: string;
  };
}

export interface SpiceCategory {
  key: 'champion' | 'finalist' | 'deepRuns' | 'earlyExits' | 'groupUpsets';
  label: string;
  value: number; // clamped contribution
  cap: number;
}

export interface SpiceResult {
  score: number; // 0–100
  persona: string;
  personaEmoji: string;
  personaBlurb: string;
  boldestCall: string;
  categories: SpiceCategory[];
  // Derived hero picks (team codes; '' when not yet determinable).
  champion: string;
  runnerUp: string;
  darkHorse: string;
  earlyExit: string;
}

export interface League {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  created_at: string;
}
