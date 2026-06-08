import { useState } from "react";
import { PEOPLE } from "../data/people";
import { hasPicks } from "../data/picks";
import { leaderboard, scoreForPerson } from "../lib/scoring";

export default function Standings() {
  const [selected, setSelected] = useState<string | null>(null);

  if (!hasPicks()) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-pitch-line bg-pitch-surface px-8 py-16 text-center">
        <h2 className="font-display text-3xl font-semibold uppercase tracking-tight text-chalk">
          Standings
        </h2>
        <p className="mt-3 text-sm text-chalk-muted">
          No picks yet. Run the draw, then paste the result into{" "}
          <code className="text-brand">src/data/picks.ts</code>. The leaderboard
          fills in automatically from{" "}
          <code className="text-brand">results.ts</code>.
        </p>
      </div>
    );
  }

  const board = leaderboard(PEOPLE);
  const detail = selected
    ? scoreForPerson(PEOPLE.find((p) => p.id === selected)!)
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="font-display mb-4 text-3xl font-semibold uppercase tracking-tight text-chalk">
        Standings
      </h2>
      <div className="overflow-hidden rounded-2xl border border-pitch-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-pitch-surface font-display text-xs uppercase tracking-widest text-chalk-muted">
              <th className="px-3 py-2.5 text-left font-medium">#</th>
              <th className="px-3 py-2.5 text-left font-medium">Player</th>
              <th className="px-3 py-2.5 text-right font-medium">Pts</th>
              <th className="px-3 py-2.5 text-right font-medium">GD</th>
              <th className="px-3 py-2.5 text-right font-medium">Alive</th>
            </tr>
          </thead>
          <tbody>
            {board.map((row, i) => (
              <tr
                key={row.person.id}
                onClick={() => setSelected(row.person.id)}
                className={`cursor-pointer border-t border-pitch-line transition-colors hover:bg-pitch-surface ${
                  i < 4 ? "bg-brand/[0.04]" : ""
                }`}
              >
                <td className="px-3 py-2.5 font-display tabular-nums text-chalk-muted">
                  {i + 1}
                </td>
                <td className="px-3 py-2.5 font-display uppercase tracking-wide">
                  <span
                    className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
                    style={{ background: row.person.colour }}
                  />
                  {row.person.name}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-chalk">
                  {row.points}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-chalk-muted">
                  {row.goalDifference > 0 ? "+" : ""}
                  {row.goalDifference}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-chalk-muted">
                  {row.teamsAlive}/4
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="mt-6 rounded-2xl border border-pitch-line bg-pitch-surface p-5">
          <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-chalk">
            {detail.person.name}&rsquo;s teams
          </h3>
          <div className="mt-3 space-y-2">
            {detail.teams.map((t) => (
              <div
                key={t.team.id}
                className={`flex items-center justify-between text-sm ${
                  t.result.eliminated
                    ? "text-chalk-muted line-through"
                    : "text-chalk"
                }`}
              >
                <span>
                  {t.team.flag} {t.team.name}{" "}
                  <span className="text-chalk-muted">Q{t.team.quartile}</span>
                </span>
                <span className="font-semibold tabular-nums">
                  {t.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
