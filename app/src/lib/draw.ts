import type { Person, Pick, Quartile, Team } from "./types";
import { teamsInQuartile } from "../data/teams";

// Seeded PRNG (mulberry32) so a given seed always reproduces the same draw —
// handy for re-running on screen, and means the result is auditable.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface QuartileAssignment {
  quartile: Quartile;
  // teams[i] is assigned to people[i].
  pairs: { person: Person; team: Team }[];
}

// Runs the full seeded draw: for each quartile, shuffle its 12 teams and deal
// one to each person in fixed order. Guarantees a valid allocation — everyone
// gets exactly one team per quartile, all 48 allocated, no clashes.
export function runDraw(
  people: Person[],
  seed: number = Date.now()
): QuartileAssignment[] {
  const rand = mulberry32(seed);
  const quartiles: Quartile[] = [1, 2, 3, 4];
  return quartiles.map((q) => {
    const shuffled = shuffle(teamsInQuartile(q), rand);
    return {
      quartile: q,
      pairs: people.map((person, i) => ({ person, team: shuffled[i] })),
    };
  });
}

// Flatten the per-quartile assignments into the frozen Pick[] shape for picks.ts.
export function assignmentsToPicks(
  people: Person[],
  assignments: QuartileAssignment[]
): Pick[] {
  return people.map((person) => {
    const teamIds = ([1, 2, 3, 4] as Quartile[]).map((q) => {
      const a = assignments.find((x) => x.quartile === q)!;
      return a.pairs.find((p) => p.person.id === person.id)!.team.id;
    }) as [string, string, string, string];
    return { personId: person.id, teamIds };
  });
}
