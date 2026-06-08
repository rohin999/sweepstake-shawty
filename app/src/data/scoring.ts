import type { Stage } from "../lib/types";

// The scoring config from section 3 of the plan. One object, easy to tweak.
// - Group results score per win/draw, summed across a person's 4 teams.
// - Knockout-round bonuses are CUMULATIVE: a finalist banks R32+R16+QF+SF+FINAL
//   on the way. Implemented via STAGE_BONUS being the per-stage increment, and
//   stageBonusTotal() summing every stage up to the one reached.
export const SCORING = {
  groupWin: 3,
  groupDraw: 1,
  // Incremental bonus awarded for REACHING each stage.
  stageBonus: {
    R32: 4,
    R16: 6,
    QF: 8,
    SF: 12,
    FINAL: 16,
    WINNER: 25,
  } as Record<Exclude<Stage, "GROUP">, number>,
} as const;

// Order of stages from earliest to latest, for cumulative bonus calculation.
export const STAGE_ORDER: Stage[] = [
  "GROUP",
  "R32",
  "R16",
  "QF",
  "SF",
  "FINAL",
  "WINNER",
];
