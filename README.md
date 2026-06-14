# World Cup 2026 Sweepstakes

A web app for an 8-person, 6-teams-each World Cup sweepstakes.

## Features

- **Picks** — each player's six teams, with each team's outright-winner odds shown as an implied win probability and a visual bar.
- **Prizes** — buy-in and the prize breakdown.
- **Bracket** — knockout bracket (Phase 2, before ~28 Jun).

## Format

| | |
|---|---|
| Players | 8 |
| Teams each | 6 |
| Buy-in | £20/person → £160 pot |
| Main prizes | 1st £120 · 2nd £40 |

## Running locally

```bash
cd app
npm install
npm run dev     # http://localhost:5173
```

## Data files

| File | What it holds |
|---|---|
| `src/data/people.ts` | The 8 players and their colours |
| `src/data/teams.ts` | 48 qualified teams, FIFA ranks (Apr 2026), real groups from the Dec 2025 draw, and outright odds |
| `src/data/picks.ts` | Draw result — paste JSON from Lock & Save after the live draw |
