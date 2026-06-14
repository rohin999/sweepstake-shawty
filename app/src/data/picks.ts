import type { Pick } from "../lib/types";

// The frozen draw result. Each Pick's teamIds list the person's six teams.
export const PICKS: Pick[] = [
  { personId: "p01", teamIds: ["ARG", "SWE", "GHA", "JPN", "ECU", "BIH"] },
  { personId: "p02", teamIds: ["BRA", "SUI", "KSA", "COL", "KOR", "AUT"] },
  { personId: "p03", teamIds: ["FRA", "MAR", "PAN", "CRO", "UZB", "ALG"] },
  { personId: "p04", teamIds: ["ENG", "CIV", "PAR", "NOR", "CUW", "JOR"] },
  { personId: "p05", teamIds: ["ESP", "EGY", "AUS", "GER", "HAI", "COD"] },
  { personId: "p06", teamIds: ["NED", "SEN", "TUN", "POR", "CZE", "CPV"] },
  { personId: "p07", teamIds: ["USA", "BEL", "IRN", "MEX", "NZL", "IRQ"] },
  { personId: "p08", teamIds: ["CAN", "URU", "RSA", "QAT", "TUR", "SCO"] },
];

export const hasPicks = (): boolean => PICKS.length > 0;
