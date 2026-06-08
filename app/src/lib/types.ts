export type Quartile = 1 | 2 | 3 | 4;

export type Stage =
  | "GROUP"
  | "R32"
  | "R16"
  | "QF"
  | "SF"
  | "FINAL"
  | "WINNER";

export interface Team {
  id: string; // "ARG"
  name: string; // "Argentina"
  flag: string; // emoji
  fifaRank: number; // global rank, for display
  quartile: Quartile; // computed by re-ranking the 48
  group: string; // "A".."L"
}

export interface Person {
  id: string;
  name: string;
  colour: string; // for bracket tagging
}

export interface Pick {
  personId: string;
  teamIds: [string, string, string, string]; // one per quartile, in quartile order
}

export interface TeamResult {
  teamId: string;
  groupWins: number;
  groupDraws: number;
  goalsFor: number;
  goalsAgainst: number;
  stageReached: Stage;
  eliminated: boolean;
}
