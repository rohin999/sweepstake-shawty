const MAIN_PRIZES = [
  { place: "Takes the whole pot", label: "Winner", amount: "£140", accent: true, icon: "🏆" },
] as const;

export default function PrizesInfo() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 text-center sm:text-left">
        <p className="font-display text-sm tracking-[0.35em] text-brand">
          WORLD CUP 2026
        </p>
        <h2 className="font-display mt-2 text-4xl font-semibold uppercase tracking-tight text-chalk sm:text-5xl">
          Prizes &amp; Buy-in
        </h2>
        <p className="mt-3 text-sm text-chalk-muted">
          Six teams each. Here&rsquo;s what&rsquo;s on the line.
        </p>
      </div>

      {/* Buy-in hero */}
      <section className="mb-8 flex flex-col items-start gap-4 rounded-2xl border border-pitch-line bg-pitch-surface px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-xs uppercase tracking-widest text-chalk-muted">
            Buy-in
          </p>
          <p className="mt-1 text-sm text-chalk-muted">
            7 players pay &times; £20 &rarr; £140 pot
          </p>
        </div>
        <p className="font-display text-5xl font-semibold leading-none text-brand">
          £20
          <span className="ml-2 align-middle text-sm font-normal uppercase tracking-widest text-chalk-muted">
            per player
          </span>
        </p>
      </section>

      {/* Podium motif (winner takes all) — decorative; data announced below */}
      <section className="mb-8" aria-hidden="true">
        <div className="flex items-end justify-center">
          {/* 1st */}
          <div className="flex w-28 flex-col items-center sm:w-36">
            <span className="text-5xl [filter:drop-shadow(0_0_10px_color-mix(in_srgb,var(--color-brand)_55%,transparent))]">
              🏆
            </span>
            <div className="mt-2 flex h-24 w-full items-start justify-center rounded-t-lg border border-brand-dim bg-pitch-elevated pt-2 font-display text-lg font-semibold text-brand">
              £140
            </div>
          </div>
        </div>
        <div className="mx-auto h-1 max-w-md rounded-full bg-pitch-line" />
      </section>

      {/* Main prizes */}
      <section className="mb-8">
        <h3 className="font-display mb-3 text-lg font-semibold uppercase tracking-wide text-chalk">
          Prize
        </h3>
        <ul className="overflow-hidden rounded-2xl border border-pitch-line bg-pitch-surface">
          {MAIN_PRIZES.map((p) => (
            <li
              key={p.place}
              className={`flex items-center justify-between border-t border-pitch-line px-5 py-4 first:border-t-0 ${
                p.accent ? "bg-pitch-elevated/60" : ""
              }`}
            >
              <span className="flex items-center gap-4">
                <span
                  className={`font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                    p.accent
                      ? "bg-brand text-pitch shadow-[0_0_16px_color-mix(in_srgb,var(--color-brand)_45%,transparent)]"
                      : "border border-pitch-line"
                  }`}
                  aria-hidden="true"
                >
                  {p.icon}
                </span>
                <span className="flex flex-col">
                  <span className="font-display text-base uppercase tracking-wide text-chalk">
                    {p.label}
                  </span>
                  <span className="font-display text-[11px] uppercase tracking-widest text-chalk-muted">
                    {p.place}
                  </span>
                </span>
              </span>
              <span
                className={`font-display font-semibold tabular-nums ${
                  p.accent
                    ? "text-3xl text-brand sm:text-4xl"
                    : "text-2xl text-chalk sm:text-3xl"
                }`}
              >
                {p.amount}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
