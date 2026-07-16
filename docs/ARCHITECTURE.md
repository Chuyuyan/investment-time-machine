# Architecture

> How the code is organised. For *why* the game is designed this way, see
> [PROJECT-LOG.md](./PROJECT-LOG.md) (mission, design vision, decision history).

## The shape of it

A single **React 18 + Vite 5 SPA**. No backend, no API, no network calls at
runtime. Every price, headline and fact is hardcoded in the prototype that uses
it. That is why the whole game can be bundled into one self-contained HTML file
and hosted anywhere.

```
URL ?proto=…
     │
     ▼
┌──────────────────────────────────────────────────┐
│  Investment Time Machine — one React SPA         │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │ main.jsx — the router                      │  │
│  │ reads ?proto=, mounts exactly one root     │  │
│  └────────────────────────────────────────────┘  │
│         │                        │               │
│         ▼                        ▼               │
│  ┌──────────────────┐   ┌──────────────────┐     │
│  │ Rent's Due       │   │ 6 earlier        │     │
│  │ PressureGame.jsx │   │ prototypes       │     │
│  │ ← current        │   │ kept as reference│     │
│  └──────────────────┘   └──────────────────┘     │
│         │                        │               │
│         ▼                        ▼               │
│  ┌──────────────────┐   ┌──────────────────┐     │
│  │ styles.css       │   │ engine/          │     │
│  │ one prefix-      │   │ pure functions   │     │
│  │ scoped sheet     │   │ 9 node tests     │     │
│  └──────────────────┘   └──────────────────┘     │
└──────────────────────────────────────────────────┘
     │
     ▼
vite build → JS+CSS inlined → one page → cloud
```

## Prototype routing

`src/main.jsx` reads the `?proto=` query param and mounts one root. Each
prototype is a **whole self-contained experiment** — its own data, state, UI and
CSS namespace. They are deliberately *not* refactored into shared components:
each one answers a different design question, and keeping them frozen lets us
replay what we learned.

| Route | Component | What it is |
|---|---|---|
| `?proto=pressure` | `PressureGame.jsx` | **Rent's Due** — current. Survival pressure + Cousin Sal + desk world |
| `?proto=research` | `InvestGame.jsx` | The Investigation — research as detective clue-hunting |
| `?proto=run` | `RunGame.jsx` | Investment FTL — portfolio as a decision generator |
| `?proto=game` | `DeskGame.jsx` | The Living Financial Desk MVP |
| `?proto=v2` | `AllocLoop.jsx` | The naked capital-allocation loop |
| `?proto=core` | `CoreLoop.jsx` | v1 — decision loop with hidden-question chapters |
| `?proto=decision` | `DecisionClimax.jsx` | The narrative Chapter One slice |
| *(none)* | `App.jsx` | The original scaffold |

## Inside Rent's Due (`PressureGame.jsx`)

The flagship. One file, four layers:

**1 · Data (all real, all hardcoded)**
- `DATES` / `HEADLINE` — six periods, Feb 2020 → Jun 2022 (crash, mania, bust)
- `COMPANIES` — 6 real companies with real split-adjusted price paths. Includes
  genuine losers (Peloton 27 → 145 → 12) so chasing hype actually hurts.
- `INFO[id][period]` — three look-up-able facts per company per period:
  money / price / news. **Never the "why"** — the player connects the dots.
- `LEADS`, `SAL_BASE` — what's worth a look, and Sal's scripted beats

**2 · The character system**
- `SalGuy` — the SVG character. Huge head, tiny body, giant glasses whose
  lenses *are* the expression screen (star / `$` / `✕` / wide eyes), optional
  `thief` mask.
- `SalOverlay` — he pops in from the side with a speech bubble and choices
- `SalInterject` — his 4th-wall move: bursts over the trade button to stop you
  selling one of his darlings

**3 · Game state** (all `useState`, no store)
`t` (period) · `cash` · `shares` / `avg` · `acts` (moves left) · `dug`
(researched this period) · `pend` (slider) · `helped` / `refused` (Sal karma) ·
`indep` (times you overruled him) · `interject` · `robbing` · `rentWarn`

**4 · The loop**
`dig`/`gig` → `applyTrade` (guarded by the rent warning and Sal's interject) →
`endMonth` (pay rent, advance prices, fire `salFor(t)`)

Two exits, neither of which is a score: **evicted** (cash < rent) or **free**
(net ≥ `FREEDOM`).

## Styling

One global `src/styles.css`. No CSS modules, no framework. Each prototype owns a
class prefix so they can't collide:

`.pg-` Rent's Due · `.rn-` Investment FTL · `.iv-` The Investigation ·
`.dk-` Living Desk · `.v2-` capital allocation · `.core-` v1

Later rules intentionally override earlier ones (the dark comic reskin is
appended overrides on top of the original warm theme).

## Engine and tests

`src/engine/` holds pure functions with no React. Run:

```bash
npm test      # node --test "src/engine/*.test.js"  → 9 tests
```

## Build and deploy

```bash
npm run dev -- --host 127.0.0.1 --port 5173   # local
npm run build                                  # → dist/
```

For the shareable cloud build, `dist/` is post-processed into **one
self-contained page**: the CSS is inlined into a `<style>` and the JS bundle
into an inline `<script type="module">`, so the page makes zero external
requests and can be hosted under a strict CSP.
