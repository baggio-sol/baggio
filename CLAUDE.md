# CLAUDE.md — WC2026 Spice Bracket

Project context for Claude Code. Read this first every session. The one-time build plan lives in `wc2026-claude-code-build-prompt.md`; **this file holds the invariants that must stay true throughout the project.**

## What this is
A FIFA World Cup 2026 prediction app with full bracket depth (rank all 12 groups, pick the 8 third-place qualifiers, predict every knockout match R32→Final, real stage-weighted scoring). **The differentiator** is the social share layer: every bracket gets a **Spice Score (0–100)** + a **persona** based on how contrarian it is, and renders a share card that **unfurls as a rich preview on X**. Being *interesting* is rewarded instantly; being *right* is rewarded later. Optimize for the share moment.

## Stack & conventions
- Next.js (App Router) + TypeScript, Tailwind, Supabase (Postgres/Auth), `@vercel/og` for share images, deploy on Vercel, pnpm.
- Auth via `@supabase/ssr` — **never hand-roll auth.**
- Strict TS. Prefer server components; client components only where interactivity needs them.
- No new dependencies beyond those above without asking first.

## Architecture invariants (do not violate)
1. **`lib/spice.ts` is the single source of truth for scoring.** The live client preview AND the server OG image MUST call the exact same function. A card that says 73 while the page says 68 is a trust-killer.
2. **All external sports data goes through the `lib/data/` adapter** (`SportsProvider` interface). The provider is swappable; the rest of the app never imports a provider directly.
3. **Never call the data provider from the client or per-request.** The draw is fetched once and cached (DB/config). Results come via a Vercel Cron job that writes to the `results` table; scoring reads only from our DB.
4. **`tier` (1=elite favorite … 5=longshot) is our editorial config, not from the API.** It drives the spice math. Documented below.
5. The user's predicted knockout tree is **derived** from their predicted group standings + third-place picks via `buildKnockoutTree()`. If group picks change, re-derive and clear invalidated knockout picks.

## Design tokens
- Dark, glassmorphic, dark-purple-into-blue. Hot accent for spice.
- `--purple:#8b5cf6  --blue:#3b82f6  --spice:#fb7185  --text:#f5f3ff  --muted:#c4bdec  --faint:#6f6796`
- `--surface:rgba(255,255,255,0.04)  --border:rgba(255,255,255,0.10)`
- Page bg: `radial-gradient(900px 600px at 85% -5%, rgba(139,92,246,0.30), transparent 60%), radial-gradient(900px 700px at 0% 110%, rgba(59,130,246,0.28), transparent 55%), linear-gradient(160deg,#1a0d36,#120931 45%,#080f28)`
- Display font **Syne** (700/800); body/UI **Montserrat** (400–800).
- Tier accents: `1:#60a5fa 2:#818cf8 3:#a78bfa 4:#f472b6 5:#fb7185`

## Spice spec (canonical — `lib/spice.ts`, must match exactly)
Helpers over the full bracket: `L(t)=(tier-1)/4` (longshotness), `F(t)=(5-tier)/4` (favoriteness).
Five categories, each clamped to its own cap; caps sum to 100:
```
1 Champion boldness     = L(champion)*30                          cap 30
2 Final-opponent boldness = L(runnerUp)*8                         cap 8
3 Longshot deep runs    = Σ L(team)*w for teams reaching QF+      cap 25   w: QF=2 SF=3 Final=4
4 Favorite early exits   = Σ F(team)*w                            cap 25   out-in-group w=3, lost-R32 w=1.5
5 Group-stage upsets     = Σ max(0, tier(1st)-tier(4th))/4 *2     cap 12
score = round( min(100, sum of clamped categories) )
```
Personas: `0–20 Chalk Merchant 📊` · `21–40 The Realist 🎯` · `41–60 Calculated Gambler 🎲` · `61–80 Chaos Agent 🔥` · `81–100 Certified Menace 💀`.
Boldest call = category with the largest contribution, rendered with the specific team; if top `<4` → "Honestly? Nothing bold here. Pure chalk."
Derived hero picks (for the card): `champion`=final winner; `runnerUp`=final loser; `darkHorse`=lowest-tier team reaching QF+ (tie-break deepest round); `earlyExit`=highest-tier team eliminated earliest (else boldest knockout upset).
**These weights/tiers are tunable — change them HERE and in this file together, never in just one place.**

## Scoring vs results (`lib/scoring.ts`) — points scale up each round
```
Group stage: +3 per team in exact predicted position (max 12/group)
Third-place qualifiers: +4 per correct advancing team (max 32)
Knockout winner: R32 +5 · R16 +8 · QF +12 · SF +18 · Final +30
Champion correct: +15 bonus
```
Tiebreakers: total points → correct champion → correct finalists → earliest created.

## Core types
```ts
type Tier = 1|2|3|4|5;
type GroupId = 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L';
type Team = { name:string; code:string; flag:string; tier:Tier; group:GroupId };
type Bracket = {
  groupPredictions: Record<GroupId,[string,string,string,string]>; // 1st→4th, team codes
  thirdPlaceQualifiers: string[];                                   // 8 codes, must be 3rd-placed
  knockout: { r32:Record<string,string>; r16:Record<string,string>;
              qf:Record<string,string>; sf:Record<string,string>;
              final:string; champion:string };
};
```

## Database (Supabase) — RLS on every table
Tables: `profiles`, `brackets` (full prediction as jsonb + derived hero picks + spice_score/persona/points), `leagues`, `league_members`, `results`.
RLS: users mutate only their own rows; anyone reads `brackets` where `is_public`; league members read their league + members.
**Ask before any destructive migration.** Migrations live in `supabase/migrations/`.

## ⚠️ The hard part
Mapping predicted group standings + third-place qualifiers into correct Round-of-32 matchups uses FIFA's official third-place combination table. Prefer the data API's **placeholder slots** ("Winner A vs 3rd-place B/E/F/I") over hand-encoding. Unit-test `buildKnockoutTree()` thoroughly **before** building any UI on top of it — if it's wrong, every downstream knockout pick is silently wrong.

## Commands
```
pnpm dev        # local
pnpm build      # production build
pnpm lint       # eslint
pnpm typecheck  # tsc --noEmit
pnpm test       # unit tests (spice + tournament tree are mandatory)
```

## Working agreement
- Build one phase at a time (see build prompt); stop for review before the next.
- Commit per phase, clear messages.
- Run typecheck + lint + tests before declaring a phase done.
- `lib/spice.ts` and `lib/tournament.ts` (tree derivation) must have unit tests.
- Ask before: destructive migrations, new dependencies, or changing the spice/scoring formulas.

## Out of scope (v1)
No real money / betting / gambling (free, bragging rights only). No native mobile (responsive web). Winner-per-match only — no exact scoreline predictions.
