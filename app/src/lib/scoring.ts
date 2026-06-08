import type { Person, Stage, Team, TeamResult } from "./types";
import { SCORING, STAGE_ORDER } from "../data/scoring";
import { PICKS } from "../data/picks";
import { RESULTS_BY_ID } from "../data/results";
import { TEAMS_BY_ID } from "../data/teams";

// Cumulative knockout bonus for reaching a given stage: sum the per-stage
// increments for every stage from R32 up to and including the one reached.
export function stageBonusTotal(stage: Stage): number {
  const reachedIdx = STAGE_ORDER.indexOf(stage);
  let total = 0;
  for (let i = 1; i <= reachedIdx; i++) {
    const s = STAGE_ORDER[i] as Exclude<Stage, "GROUP">;
    total += SCORING.stageBonus[s] ?? 0;
  }
  return total;
}

// Points a single team contributes: group points + cumulative stage bonus.
export function scoreForTeam(result: TeamResult): number {
  const groupPoints =
    result.groupWins * SCORING.groupWin + result.groupDraws * SCORING.groupDraw;
  return groupPoints + stageBonusTotal(result.stageReached);
}

export interface TeamScore {
  team: Team;
  result: TeamResult;
  points: number;
  goalDifference: number;
}

export interface PersonScore {
  person: Person;
  teams: TeamScore[];
  points: number;
  goalDifference: number; // combined GD across the 4 teams — tiebreaker
  teamsAlive: number;
}

function teamIdsFor(personId: string): string[] {
  return PICKS.find((p) => p.personId === personId)?.teamIds ?? [];
}

export function scoreForPerson(person: Person): PersonScore {
  const teams: TeamScore[] = teamIdsFor(person.id).map((id) => {
    const result = RESULTS_BY_ID[id];
    return {
      team: TEAMS_BY_ID[id],
      result,
      points: scoreForTeam(result),
      goalDifference: result.goalsFor - result.goalsAgainst,
    };
  });
  return {
    person,
    teams,
    points: teams.reduce((s, t) => s + t.points, 0),
    goalDifference: teams.reduce((s, t) => s + t.goalDifference, 0),
    teamsAlive: teams.filter((t) => !t.result.eliminated).length,
  };
}

// Leaderboard: people ranked by points, tiebreak combined goal difference.
// (A coin flip settles any remaining tie — not automated here on purpose.)
export function leaderboard(people: Person[]): PersonScore[] {
  return people
    .map(scoreForPerson)
    .sort(
      (a, b) => b.points - a.points || b.goalDifference - a.goalDifference
    );
}

export function teamsStillAlive(person: Person): TeamScore[] {
  return scoreForPerson(person).teams.filter((t) => !t.result.eliminated);
}
