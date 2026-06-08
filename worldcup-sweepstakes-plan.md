# World Cup 2026 Sweepstakes — Web App Project Plan

A build plan for a private web app for a 12-person, 4-teams-each World Cup sweepstakes with a seeded live draw, per-person standings, and a knockout bracket.

---

## 1. What we're building

One small single-page web app with three screens that unlock in sequence:

1. **The Draw** — a seeded, animated picker that assigns each of the 12 people one team from each of the four FIFA-ranking quartiles. Run live on Tuesday, result saved.
2. **Standings & "My Teams"** — after the draw, anyone can open the app, click their name, and see their 4 teams, their points, and the overall leaderboard.
3. **The Bracket** — once the group stage ends, a Round-of-32 → Final tree where each surviving team is tagged with its owner, so you can see whose teams are still alive.

It's a tiny dataset (12 people, 48 teams) for a known group of friends, so the whole thing can be simple, free to host, and shareable by one link.

---

## 2. Facts locked in

| Thing | Value |
|---|---|
| People | 12 |
| Teams per person | 4 (one from each ranking quartile) |
| Total teams | 48 |
| Buy-in | £10/team → £40/person → £480 pot |
| Prizes | 1st £300 · 2nd £120 · 3rd £40 · 4th £20 |
| Draw | Live, Tuesday evening |
| Tournament | 11 Jun – 19 Jul 2026, USA/Canada/Mexico |
| Format | 12 groups of 4 → top 2 + 8 best 3rd-placed → Round of 32 → R16 → QF → SF → Final |

**Seeding rule:** take the 48 qualified teams, sort them by FIFA world ranking, then cut into four bands of 12 — Quartile 1 = the 12 highest-ranked teams, Q2 = next 12, and so on. Each person gets exactly one team from each quartile. Note this is ranked *among the 48 World Cup teams only* (re-numbered 1–48), not the global ranking. Use the freshest FIFA list available on draw day — the official update lands ~9–11 June, right around your draw.

---

## 3. The one decision to make first: scoring

Prizes go to the top 4 **people**, so you need a rule that turns "how my 4 teams did" into a single score. Everything else in the build is mechanical; this is the only real design choice. Recommended default (one config object, easy to tweak):

| Event | Points (per team, summed across your 4) |
|---|---|
| Group-stage win | 3 |
| Group-stage draw | 1 |
| Reached Round of 32 | 4 |
| Reached Round of 16 | 6 |
| Reached Quarter-final | 8 |
| Reached Semi-final | 12 |
| Reached Final | 16 |
| Won the World Cup | 25 |

Progression bonuses are cumulative (a finalist earns the R32 + R16 + QF + SF + Final bonuses on the way). This rewards the people whose lower-quartile underdogs overperform, which is the fun of a seeded draw. Tiebreak: combined goal difference across your 4 teams (goals for minus goals against), then a coin flip.

Decide this before Tuesday so the standings screen is meaningful from match one. If you'd rather keep it dead simple, an alternative is "1 point per goal your teams score + a flat bonus per round reached" — fewer fields to update.

---

## 4. Recommended tech stack

**Primary recommendation — static React app, no backend:**

- **React + Vite** single-page app, **Tailwind** for styling.
- All data lives in **a few JSON/TS files** in the repo: `teams.ts`, `people.ts`, `picks.ts` (written by the draw), `results.ts`, `scoring.ts`.
- Hosted free on **Vercel or Netlify** → gives you one clean link to share.
- To update scores during the tournament you edit `results.ts` and push; the host redeploys automatically in ~30 seconds.

Why: 12 people and 48 teams is a tiny, mostly-static dataset. A backend and database are overkill, cost nothing to skip, and remove a whole category of things that can break the night before. The only "writes" are the draw result and periodic score updates, both of which you control.

**Not doing for now — Supabase:** you could add **Supabase** (free tier, hosted Postgres) and store `picks`/`results` there with a password-protected admin screen for phone updates. We've decided **files-only** instead — simpler and free — so this stays parked unless editing-and-pushing genuinely becomes a chore mid-tournament.

**Auto-fetching results — the planned upgrade:** start with manual entry (section 9), then move to `football-data.org` (free tier, covers the World Cup) to pull fixtures and results automatically. Building the scoring engine against a clean `TeamResult` shape now means the API swap later is just a different data source feeding the same functions — no rework. Targeted for Phase 2, once the manual version is live and proven.

---

## 5. Data model

```ts
// teams.ts — the 48 qualified teams
Team {
  id: string            // "ARG"
  name: string          // "Argentina"
  flag: string          // emoji or /flags/arg.svg
  fifaRank: number       // global rank, for display
  quartile: 1 | 2 | 3 | 4 // computed by re-ranking the 48
  group: string         // "A".."L"
}

// people.ts — the 12 players
Person {
  id: string
  name: string
  colour: string        // for bracket tagging
}

// picks.ts — written by the draw, then frozen
Pick {
  personId: string
  teamIds: [string, string, string, string] // one per quartile
}

// results.ts — the only thing you edit during the tournament
TeamResult {
  teamId: string
  groupWins: number
  groupDraws: number
  goalsFor: number
  goalsAgainst: number    // goalsFor − goalsAgainst = your goal-difference tiebreaker
  stageReached: "GROUP" | "R32" | "R16" | "QF" | "SF" | "FINAL" | "WINNER"
  eliminated: boolean
}

// scoring.ts — the config from section 3
```

Everything the UI shows is derived from these by pure functions: `scoreForPerson(person)`, `leaderboard()`, `teamsStillAlive(person)`. No hidden state.

---

## 6. Feature 1 — The seeded draw  ⭐ priority for Tuesday

**Algorithm (guarantees a valid allocation every time):**

```
for each quartile Q in [1,2,3,4]:
    teams  = shuffle(all teams where quartile == Q)   // 12 teams
    people = the 12 people                            // fixed order
    assign teams[i] to people[i]
```

That's it. Shuffling each quartile independently and dealing one to each person guarantees everyone gets exactly one team per quartile and all 48 teams are allocated with no clashes. Seed the shuffle from a timestamp so it's different each run.

**Live-draw UX (keep it theatrical but simple):**
- Show the 12 names down one side.
- Reveal **quartile by quartile**: work through all 12 people for Q1, then Q2, Q3, Q4 — a short "spin"/flip animation landing on each team, with flag + name. This builds nicely: the big names go first, the underdogs land last.
- A "Draw next" button you press to advance, so you control the pace on the call.
- At the end, a **"Lock & Save"** button that writes `picks.ts` (or copies the JSON for you to paste/commit). Once locked, the draw screen is read-only.

**Build it as a self-contained component first** so it works offline on the night even if hosting hiccups — you can run it from a laptop and share screen.

---

## 7. Feature 2 — Standings & "My Teams"

- **Leaderboard:** all 12 people ranked by total points, with position, points, and a "teams alive / 4" indicator. Highlights the top-4 prize positions.
- **Click a name → person detail:** their 4 teams (with quartile badge, group, current stage), points contributed by each, and a running total. A subtle "you're 2nd, 6 pts off 1st" line is a nice touch.
- All values computed live from `results.ts`, so updating results updates every view at once.

---

## 8. Feature 3 — The knockout bracket

- Standard left-half / right-half bracket: 32 → 16 → 8 → 4 → 2 → 1, plus the third-place match.
- Each slot shows the team **plus a coloured dot/initials for its owner**, so the story of the tournament reads as "whose teams are left."
- Greyed out / struck through when a team is eliminated.
- Lives behind a tab that only becomes active once the group stage finishes and you've entered who advanced (the 24 group qualifiers + 8 best third-placed).
- On mobile, let it scroll horizontally or collapse to a round-by-round list — a full bracket is wide.

---

## 9. Updating results during the tournament

**Now — manual:** after each match day, open `results.ts`, update the handful of teams that played (wins/draws/goals for and against, and `stageReached` when the bracket fills in), commit, push. Vercel/Netlify redeploys automatically. Five minutes a day at most.

**Later — API:** once the manual version is running smoothly, swap the data source to `football-data.org` so results update themselves. Because the scoring functions only read the `TeamResult` shape, the changeover is contained — you replace where the data comes from, not how it's scored. This is the intended direction, just not Tuesday's problem.

---

## 10. Build phases

**Phase 0 — by Tuesday (the only hard deadline):**
- `teams.ts` populated and tiered into quartiles (using the latest FIFA list).
- `people.ts` with the 12 names.
- The draw component, working and animated, with Lock & Save.
- That alone runs the live draw. Everything else can come after.

**Phase 1 — before first matches (11 Jun):**
- Standings + My Teams screens.
- `scoring.ts` wired in.
- A rules/info panel: format and prizes (payment details sent separately in the group chat, not on the page).
- Deploy to Vercel/Netlify; share the link.

**Phase 2 — before knockouts (~28 Jun):**
- The bracket screen.
- Move results from manual entry to the `football-data.org` API.
- Polish.

---

## 11. Deployment & sharing

- Push to a private GitHub repo → connect to Vercel or Netlify → free auto-deploys on every push.
- You get a single URL to send the group.
- Anyone can view; only you can change data (you hold the repo). Good enough for a private 12-person pool — no logins needed.

---

## 12. Decisions — confirmed

- [x] **Scoring:** real group points (3/1) + cumulative knockout-round bonuses + 25 for winning the cup. **Tiebreak: combined goal difference, then a coin flip.**
- [x] **Results:** start **manual**, move to the **football-data.org API** in Phase 2.
- [x] **Storage:** **files-only** (no Supabase/backend).
- [x] **Draw reveal:** **quartile by quartile** (all 12 for Q1, then Q2, Q3, Q4).
- [x] **Payment details:** kept **off the page**, sent in a separate group message.

Only genuinely open item: the **12 names** (and the final tiered team list, once the ~9–11 June FIFA update is out). Everything else is settled enough to start building.
