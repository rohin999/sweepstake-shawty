# World Cup 2026 Sweepstakes

Static React app for a 12-person, 4-teams-each World Cup sweepstakes. See the
[project plan](../worldcup-sweepstakes-plan.md) for the full spec.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
```

## Where the data lives

Everything is files-only — no backend. Edit these:

| File | What it holds | When you touch it |
|---|---|---|
| `src/data/people.ts` | The 12 players | set ✓ |
| `src/data/teams.ts` | The real 48 qualified teams + real groups; quartile is computed from FIFA rank (Apr 1 2026) | refresh fifaRank from the 11 Jun update if it shifts |
| `src/data/picks.ts` | The draw result | written once by the live draw, then frozen |
| `src/data/results.ts` | Match results | edited through the tournament |
| `src/data/scoring.ts` | Points config | tweak if you change the rules |

## Phase status (per the plan)

- **Phase 0 (Tuesday): done** — seeded animated draw with Lock & Save.
- **Phase 1: done** — standings + "My Teams", scoring wired in.
- **Phase 2: stubbed** — bracket screen + football-data.org API still to build.

## Running the draw

Open the **Draw** tab → *Start the draw* → *Draw next* to reveal each pick
(all 12 players for Q1, then Q2, Q3, Q4) → *Lock & Save*. Copy the exported
JSON into `src/data/picks.ts` as the `PICKS` array and commit to freeze it. The
Standings tab then comes alive automatically.

## Deploy

Push to a private GitHub repo → connect to Vercel or Netlify (root: `app/`,
build `npm run build`, output `dist`) → free auto-deploys on every push.
