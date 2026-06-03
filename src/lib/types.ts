export type Tier = 1|2|3|4|5;
export type GroupId = 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L';

export interface Team {
  name: string;
  code: string;
  flag: string;
  tier: Tier;
  group: GroupId;
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

export interface SpiceResult {
  score: number;
  persona: string;
  personaEmoji: string;
  boldestCall: string;
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
