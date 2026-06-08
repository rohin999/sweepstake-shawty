import type { TeamResult } from "../lib/types";
import { TEAMS } from "./teams";

// The ONLY file you edit during the tournament. After each match day, update the
// handful of teams that played, commit, push — the host redeploys automatically.
//
// In Phase 2 this same shape is fed by the football-data.org API instead, so the
// scoring functions never change.
//
// Every team starts at zero / GROUP / not-eliminated. Override individual teams
// in OVERRIDES below; anything not overridden keeps its default row.
const OVERRIDES: Partial<Record<string, Partial<TeamResult>>> = {
  // Example (delete once real results come in):
  // ARG: { groupWins: 2, groupDraws: 1, goalsFor: 6, goalsAgainst: 1, stageReached: "R32" },
};

export const RESULTS: TeamResult[] = TEAMS.map((t) => ({
  teamId: t.id,
  groupWins: 0,
  groupDraws: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  stageReached: "GROUP",
  eliminated: false,
  ...OVERRIDES[t.id],
}));

export const RESULTS_BY_ID: Record<string, TeamResult> = Object.fromEntries(
  RESULTS.map((r) => [r.teamId, r])
);
