import { PEOPLE } from "../data/people";
import { PICKS } from "../data/picks";
import { TEAMS_BY_ID } from "../data/teams";
import { barFraction, formatProbability, impliedProbability } from "../lib/odds";
import type { Team } from "../lib/types";

// Map each person to their teams, strongest (best win chance) first.
const teamsByPerson = new Map<string, Team[]>();
for (const pick of PICKS) {
  const teams = pick.teamIds
    .map((id) => TEAMS_BY_ID[id])
    .filter((t): t is Team => Boolean(t))
    .sort((a, b) => impliedProbability(b.odds) - impliedProbability(a.odds));
  teamsByPerson.set(pick.personId, teams);
}

// Combined win chance across a person's teams (chance at least one wins ≈ sum,
// since at most one team can win — outright probabilities are mutually exclusive).
const combinedChance = (personId: string): number =>
  (teamsByPerson.get(personId) ?? []).reduce(
    (sum, t) => sum + impliedProbability(t.odds),
    0
  );

// Order players by their combined win chance (strongest squad first).
const SORTED_PEOPLE = [...PEOPLE].sort(
  (a, b) => combinedChance(b.id) - combinedChance(a.id)
);

// Subtle strength tint within tokens: bright lime for favourites, fading to
// dim, then muted-grey for longshots. The % label is the source of truth.
function thermoColour(fraction: number): string {
  if (fraction >= 0.66) return "var(--color-brand)";
  if (fraction >= 0.33) return "var(--color-brand-dim)";
  return "var(--color-chalk-muted)";
}

// A slim vertical thermometer that fills bottom-to-top by win chance.
function ThermoPill({ odds }: { odds: string }) {
  const fraction = barFraction(odds);
  const pct = formatProbability(impliedProbability(odds));
  return (
    <div
      className="flex flex-col items-center justify-end gap-1"
      title={`${pct} chance of winning (odds ${odds})`}
    >
      <div
        className="relative h-10 w-2 overflow-hidden rounded-full bg-pitch-line"
        role="img"
        aria-label={`${pct} chance of winning`}
      >
        <div
          className="progress-fill-y absolute inset-x-0 bottom-0 h-full rounded-full"
          style={{ transform: `scaleY(${fraction})`, background: thermoColour(fraction) }}
        />
      </div>
      <span className="text-[10px] leading-none tabular-nums text-chalk-muted">
        {pct}
      </span>
    </div>
  );
}

export default function Picks() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 text-center sm:text-left">
        <p className="font-display text-sm tracking-[0.35em] text-brand">
          WORLD CUP 2026
        </p>
        <h2 className="font-display mt-2 text-4xl font-semibold uppercase tracking-tight text-chalk sm:text-5xl">
          The Picks
        </h2>
        <p className="mt-3 text-sm text-chalk-muted">
          Eight players, six teams each.
        </p>
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-chalk-muted sm:justify-start">
          <span
            aria-hidden="true"
            className="relative inline-block h-5 w-2 shrink-0 overflow-hidden rounded-full bg-pitch-line"
          >
            <span className="absolute inset-x-0 bottom-0 h-3/4 rounded-full bg-brand" />
          </span>
          <span>
            <span className="text-chalk">% chance of winning</span> the
            tournament — from bookmaker outright odds. Fuller bar = stronger
            favourite.
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SORTED_PEOPLE.map((person) => {
          const teams = teamsByPerson.get(person.id) ?? [];
          return (
            <section
              key={person.id}
              className="overflow-hidden rounded-2xl border border-pitch-line bg-pitch-surface"
            >
              <header
                className="flex items-center justify-between border-l-[3px] px-4 py-3"
                style={{ borderLeftColor: person.colour }}
              >
                <h3 className="font-display truncate text-base uppercase tracking-wide text-chalk">
                  {person.name}
                </h3>
                <span
                  className="font-display text-xs uppercase tracking-widest tabular-nums text-chalk-muted"
                  title="Combined chance one of these teams wins the tournament"
                >
                  {formatProbability(combinedChance(person.id))}
                </span>
              </header>
              <ul className="divide-y divide-pitch-line border-t border-pitch-line">
                {teams.map((team) => (
                  <li
                    key={team.id}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-pitch-elevated"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pitch-elevated text-xl leading-none ring-1 ring-pitch-line">
                      {team.flag}
                    </span>
                    <span className="font-display flex-1 truncate text-sm uppercase tracking-wide text-chalk">
                      {team.name}
                    </span>
                    <ThermoPill odds={team.odds} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
