import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PEOPLE } from "../data/people";
import {
  runDraw,
  assignmentsToPicks,
  type QuartileAssignment,
} from "../lib/draw";
import type { Quartile, Team, Person } from "../lib/types";

const ROMAN = ["I", "II", "III", "IV"] as const;
const POT_TAG: Record<Quartile, string> = {
  1: "TOP SEEDS",
  2: "POT II",
  3: "POT III",
  4: "UNDERDOGS",
};
const N = PEOPLE.length; // 12
const TOTAL = N * 4; // 48
const STORAGE_KEY = "wc26-draw-v1";

interface RevealInfo {
  team: Team;
  person: Person;
  quartile: Quartile;
  personIndex: number;
}

// Map a flat step index (0..47) to (quartileIndex, personIndex).
const stepToCoord = (step: number) => ({
  qi: Math.floor(step / N),
  pi: step % N,
});

export default function Draw() {
  const [seed, setSeed] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<QuartileAssignment[] | null>(
    null
  );
  const [revealed, setRevealed] = useState(0);
  const [locked, setLocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const restoredRef = useRef(false);

  const done = revealed >= TOTAL;
  const potIndex = Math.min(3, Math.floor(revealed / N)); // pot of the next reveal

  // --- Persistence: restore once on mount, save on change -------------------
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        seed?: number;
        revealed?: number;
        locked?: boolean;
      };
      if (typeof saved.seed === "number") {
        setSeed(saved.seed);
        setAssignments(runDraw(PEOPLE, saved.seed));
        setRevealed(Math.min(TOTAL, saved.revealed ?? 0));
        setLocked(!!saved.locked);
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    if (seed === null) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ seed, revealed, locked }));
  }, [seed, revealed, locked]);

  // --- Actions --------------------------------------------------------------
  const start = useCallback(() => {
    const s = Date.now();
    setSeed(s);
    setAssignments(runDraw(PEOPLE, s));
    setRevealed(0);
    setLocked(false);
  }, []);

  const advance = useCallback(() => {
    setRevealed((r) => Math.min(TOTAL, r + 1));
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAssignments(null);
    setSeed(null);
    setRevealed(0);
    setLocked(false);
    setCopied(false);
  }, []);

  // Keyboard control for the live host: Space / Enter reveals the next team
  // (and locks at the end). Works whatever has focus — only typing is exempt,
  // and secondary buttons (Reset, Copy) keep their own native behaviour.
  useEffect(() => {
    if (!assignments) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.code !== "Enter") return;
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (tag === "BUTTON" && el?.dataset.advance !== "true") return;
      e.preventDefault();
      if (!done) advance();
      else if (!locked) setLocked(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [assignments, done, locked, advance]);

  // The team just revealed, for the centre stage.
  const latest = useMemo<RevealInfo | null>(() => {
    if (!assignments || revealed === 0) return null;
    const { qi, pi } = stepToCoord(revealed - 1);
    const a = assignments[qi];
    return {
      team: a.pairs[pi].team,
      person: a.pairs[pi].person,
      quartile: a.quartile,
      personIndex: pi,
    };
  }, [assignments, revealed]);

  // Who's up next, for the prompt and the control deck.
  const next = useMemo(() => {
    if (!assignments || done) return null;
    const { qi, pi } = stepToCoord(revealed);
    const a = assignments[qi];
    return { person: a.pairs[pi].person, quartile: a.quartile };
  }, [assignments, revealed, done]);

  // Per-person, per-quartile revealed teams for the scoreboard.
  const grid = useMemo(() => {
    const m = new Map<string, Team>();
    if (assignments) {
      for (let s = 0; s < revealed; s++) {
        const { qi, pi } = stepToCoord(s);
        const a = assignments[qi];
        m.set(`${a.pairs[pi].person.id}|${a.quartile}`, a.pairs[pi].team);
      }
    }
    return m;
  }, [assignments, revealed]);

  const exportJson = useMemo(() => {
    if (!assignments) return "";
    return JSON.stringify(assignmentsToPicks(PEOPLE, assignments), null, 2);
  }, [assignments]);

  const copy = () => {
    navigator.clipboard?.writeText(exportJson);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  // -------------------------------------------------------------------------
  // Start screen
  // -------------------------------------------------------------------------
  if (!assignments) {
    return (
      <div className="pitch-stripes mx-auto max-w-2xl rounded-2xl border border-pitch-line bg-pitch-surface px-8 py-16 text-center">
        <p className="font-display text-sm tracking-[0.35em] text-brand">
          WORLD CUP 2026
        </p>
        <h2 className="font-display mt-2 text-5xl font-semibold uppercase tracking-tight text-chalk sm:text-6xl">
          The Draw
        </h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-chalk-muted">
          Four pots, twelve players, forty-eight teams. Each player lands one
          team from every FIFA-ranking quartile — revealed one at a time, top
          seeds first, underdogs last.
        </p>
        <button
          onClick={start}
          className="mt-9 inline-flex items-center gap-2 rounded-lg bg-brand px-7 py-3.5 font-display text-base font-semibold uppercase tracking-wide text-pitch transition hover:bg-brand/90 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-surface"
        >
          Start the draw
        </button>
        <p className="mt-4 text-xs uppercase tracking-widest text-chalk-muted">
          Tip: press <span className="text-chalk">Space</span> to reveal each pick
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Broadcast layout
  // -------------------------------------------------------------------------
  return (
    <div className="mx-auto max-w-6xl pb-4">
      {/* Screen-reader announcement of each reveal. */}
      <div aria-live="polite" className="sr-only">
        {done
          ? "Draw complete. All 48 teams drawn."
          : latest
            ? `${latest.team.name} drawn to ${latest.person.name}`
            : ""}
      </div>

      {/* Top broadcast bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pitch-line pb-3">
        <div className="flex items-center gap-3 font-display uppercase">
          <span className="text-lg font-semibold tracking-wide text-chalk">
            WC26 Draw
          </span>
          <span className="flex items-center gap-1.5 rounded bg-pitch-surface px-2 py-1 text-[11px] tracking-widest text-brand">
            <span
              aria-hidden="true"
              className="live-dot inline-block h-2 w-2 rounded-full bg-brand"
            />
            {done ? "COMPLETE" : "LIVE"}
          </span>
        </div>
        <div className="flex items-center gap-4 font-display text-sm uppercase tracking-widest text-chalk-muted">
          <span>
            Pot <span className="text-chalk">{ROMAN[potIndex]}</span>
            <span className="text-chalk-muted"> / IV</span>
          </span>
          <span className="tabular-nums">
            <span className="text-chalk">{revealed}</span>/{TOTAL}
          </span>
        </div>
      </div>

      {/* Centre stage — the single big reveal */}
      <section className="pitch-stripes relative mt-4 flex min-h-[19rem] flex-col overflow-hidden rounded-2xl border border-pitch-line bg-pitch-surface p-6 sm:min-h-[22rem]">
        <Stage latest={latest} done={done} next={next} revealKey={revealed} />
      </section>

      {/* Scoreboard — each player's four teams, named and spread out */}
      <section className="mt-4 overflow-hidden rounded-2xl border border-pitch-line">
        <div className="grid grid-cols-[minmax(6.5rem,1.2fr)_repeat(4,minmax(0,1fr))] bg-pitch-surface px-3 py-2.5 font-display text-[11px] uppercase tracking-widest text-chalk-muted">
          <span>Player</span>
          {([1, 2, 3, 4] as Quartile[]).map((q) => (
            <span key={q} className="text-center">
              Pot {ROMAN[q - 1]}
            </span>
          ))}
        </div>
        {PEOPLE.map((person, pi) => {
          const isLatestRow = latest?.personIndex === pi;
          return (
            <div
              key={person.id}
              className={`grid grid-cols-[minmax(6.5rem,1.2fr)_repeat(4,minmax(0,1fr))] items-stretch border-t border-pitch-line ${
                isLatestRow ? "bg-pitch-elevated" : ""
              }`}
            >
              <span className="flex items-center gap-2 px-3 py-2 font-display text-sm uppercase tracking-wide">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: person.colour }}
                />
                <span className="truncate text-chalk">{person.name}</span>
              </span>
              {([1, 2, 3, 4] as Quartile[]).map((q) => {
                const team = grid.get(`${person.id}|${q}`);
                const isFresh =
                  isLatestRow && latest?.quartile === q && team !== undefined;
                return (
                  <div
                    key={q}
                    className={`flex flex-col items-center justify-center gap-1 border-l border-pitch-line px-1 py-2 text-center ${
                      isFresh ? "anim-rowflash" : ""
                    }`}
                  >
                    {team ? (
                      <>
                        <span
                          role="img"
                          aria-label={team.name}
                          className="text-2xl leading-none"
                        >
                          {team.flag}
                        </span>
                        <span className="font-display text-[12px] uppercase leading-tight tracking-wide text-chalk sm:text-[13px]">
                          {team.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-pitch-line">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </section>

      {/* Sticky control deck — primary action always reachable */}
      <div className="sticky bottom-0 z-10 mt-4 -mx-4 border-t border-pitch-line bg-pitch/90 px-4 py-3 backdrop-blur">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={TOTAL}
          aria-valuenow={revealed}
          aria-label="Teams drawn"
          className="relative mb-3 h-1.5 overflow-hidden rounded-full bg-pitch-elevated"
        >
          <div
            className="progress-fill h-full w-full rounded-full bg-brand"
            style={{ transform: `scaleX(${revealed / TOTAL})` }}
          />
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              aria-hidden="true"
              className="absolute top-0 h-full w-0.5 bg-pitch"
              style={{ left: `${(i / 4) * 100}%` }}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!done && (
            <button
              data-advance="true"
              onClick={advance}
              className="rounded-lg bg-brand px-6 py-3 font-display text-base font-semibold uppercase tracking-wide text-pitch transition hover:bg-brand/90 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-pitch"
            >
              Reveal Next
            </button>
          )}
          {done && !locked && (
            <button
              data-advance="true"
              onClick={() => setLocked(true)}
              className="rounded-lg bg-brand px-6 py-3 font-display text-base font-semibold uppercase tracking-wide text-pitch transition hover:bg-brand/90 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-pitch"
            >
              Lock &amp; Save
            </button>
          )}
          <button
            onClick={reset}
            className="rounded-lg border border-pitch-line px-5 py-3 font-display text-sm uppercase tracking-wide text-chalk-muted transition hover:bg-pitch-surface hover:text-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chalk-muted focus-visible:ring-offset-2 focus-visible:ring-offset-pitch"
          >
            Reset
          </button>
          {next && (
            <span className="font-display text-xs uppercase tracking-widest text-chalk-muted">
              Next: <span className="text-chalk">{next.person.name}</span>
              <span className="hidden sm:inline"> · press Space</span>
            </span>
          )}
          <span className="ml-auto font-display text-sm uppercase tracking-widest tabular-nums text-chalk-muted">
            <span className="text-chalk">{revealed}</span>/{TOTAL}
          </span>
        </div>
      </div>

      {/* Export panel */}
      {locked && (
        <div className="mt-5 rounded-2xl border border-brand/30 bg-brand/5 p-5">
          <p className="font-display text-sm uppercase tracking-wide text-brand">
            Draw locked
          </p>
          <p className="mt-1 text-sm text-chalk-muted">
            Paste this into{" "}
            <code className="text-brand">src/data/picks.ts</code> as the{" "}
            <code className="text-brand">PICKS</code> array and commit to freeze
            it.
          </p>
          <textarea
            readOnly
            value={exportJson}
            className="mt-3 h-44 w-full rounded-lg border border-pitch-line bg-pitch p-3 font-mono text-xs text-chalk"
          />
          <button
            onClick={copy}
            className="mt-2 rounded-lg border border-pitch-line px-4 py-2 font-display text-sm uppercase tracking-wide text-chalk transition hover:bg-pitch-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-pitch-surface"
          >
            {copied ? "Copied ✓" : "Copy JSON"}
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Centre stage: the big reveal, or a "who's next" prompt.
// ---------------------------------------------------------------------------
function Stage({
  latest,
  done,
  next,
  revealKey,
}: {
  latest: RevealInfo | null;
  done: boolean;
  next: { person: Person; quartile: Quartile } | null;
  revealKey: number;
}) {
  if (done) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="font-display text-sm tracking-[0.35em] text-brand">
          ALL 48 DRAWN
        </p>
        <h3 className="font-display mt-2 text-5xl font-semibold uppercase tracking-tight text-chalk sm:text-6xl">
          Draw Complete
        </h3>
        <p className="mt-4 max-w-sm text-sm text-chalk-muted">
          Every player has their four teams. Lock &amp; Save to freeze the
          result, then it&rsquo;s into the group stage.
        </p>
      </div>
    );
  }

  // Before the first reveal: show who's first up.
  if (!latest) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="font-display text-sm tracking-[0.35em] text-chalk-muted">
          FIRST UP
        </p>
        <h3 className="font-display mt-2 text-6xl font-semibold uppercase tracking-tight text-chalk sm:text-7xl">
          {next?.person.name}
        </h3>
        <p className="font-display mt-2 text-sm uppercase tracking-[0.3em] text-brand">
          {next ? POT_TAG[next.quartile] : ""}
        </p>
        <p className="mt-5 text-sm text-chalk-muted">
          Press <span className="text-chalk">Reveal Next</span> or{" "}
          <span className="text-chalk">Space</span>.
        </p>
      </div>
    );
  }

  // Live reveal — keyed so it replays the animation each step.
  return (
    <div
      key={revealKey}
      className="flex flex-1 flex-col items-center justify-center text-center"
    >
      <p className="font-display text-xs uppercase tracking-[0.3em] text-chalk-muted">
        Pot {ROMAN[latest.quartile - 1]} · Group {latest.team.group} · FIFA #
        {latest.team.fifaRank}
      </p>

      <div className="anim-flagpop anim-landglow relative mt-4 overflow-hidden rounded-2xl border border-pitch-line bg-pitch px-10 py-6">
        <span
          role="img"
          aria-label={latest.team.name}
          className="block text-[5rem] leading-none sm:text-[6.5rem]"
        >
          {latest.team.flag}
        </span>
        <span
          aria-hidden="true"
          className="anim-sweep pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />
      </div>

      <h3 className="anim-nameslide font-display mt-5 text-5xl font-semibold uppercase tracking-tight text-chalk sm:text-6xl">
        {latest.team.name}
      </h3>

      <div className="anim-nameslide mt-4 flex items-center gap-2.5 font-display text-lg uppercase tracking-wide">
        <span className="text-chalk-muted">→</span>
        <span
          aria-hidden="true"
          className="h-3 w-3 rounded-full"
          style={{ background: latest.person.colour }}
        />
        <span className="text-brand">{latest.person.name}</span>
      </div>
    </div>
  );
}
