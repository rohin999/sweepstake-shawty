import type { Pick } from "../lib/types";

// Written by the live draw via "Lock & Save" — paste the exported JSON here and
// commit. Empty until the draw has happened. Once populated, treat as frozen.
//
// Each Pick's teamIds are in quartile order: [Q1, Q2, Q3, Q4].
export const PICKS: Pick[] = [];

export const hasPicks = (): boolean => PICKS.length > 0;
