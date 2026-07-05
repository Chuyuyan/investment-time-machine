# Investment Time Machine — Project Log & Handoff

> **Purpose of this file.** A complete, self-contained record of the project's
> vision, the design discussion that shaped it, every principle we've settled,
> the open questions we haven't, and the exact technical state — so work can
> resume on any device (or by any collaborator/assistant) without losing the
> thread. If you are picking this up cold, read top to bottom once.
>
> Last updated: 2026-07-01. **Start with §0.5 (Mission & design spine) — it is
> the current governing section; §§1–8 predate the July rebuild.**

---

## 0. One-paragraph orientation

**Investment Time Machine** is a pixel-art *decision-training game*, **not** a
stock simulator and **not** a finance course. The player relives real market
history (Chapter One = the AI/NVDA boom) and makes financial decisions under
genuine uncertainty. The point is not to pick the right stock or learn finance
facts — it is to build **judgment under uncertainty** and to feel: *"What kind
of life would I build if I consistently made different financial decisions?"*
Investing is the arena; the real subject is **life**, and beneath that,
**thinking**.

---

## 0.5 Mission & design spine (settled 2026-07-01 — governs everything)

> This section is the current spine and a knife. It supersedes anything below it
> that conflicts. §§1–8 predate the July rebuild and are partly stale; trust §0.5
> and §5-current (build status) first.

**Mission.** *Help people become better investors by helping them make better
investment decisions.* Investing is the domain; decision-making is the transferable
skill; reflection/coaching is the learning mechanism. We do **not** teach what to
buy, how to read statements, or investing rules — we improve investors by having
them make, and then understand, many investment decisions. Success looks like a
player saying: *"I finally understand how I make investment decisions, and I feel
more confident making them in real life."*

**The filter — apply to every feature.** *Will this help someone make better
investment decisions in the real world?* NOT "is it more realistic?", NOT "does it
teach finance?", NOT "does it teach general decision-making?" Keep investing at the
center; this is not a generic decision game.

**The two mysteries (the engine model).**
- **Situational mystery — "What's happening here?"** The job of the **gameplay**.
  Makes a single decision gripping. Every situation must feel genuinely *different*
  from every prior one (AI boom, rates, tariffs, crypto, a company you love / one
  everyone hates) — the pull is *"what makes THIS one different?"*, never a generic
  "should I buy?". The market mystery constantly changes.
- **Self mystery — "What kind of investor am I?"** The job of the **Autopsy**.
  Makes you want the *next* chapter. Persistent; one decision can't answer it; you
  return to assemble a picture of yourself you can't finish in one sitting.

**Refinements that correct earlier drafts:**
- **The Autopsy is the payoff, not the engine.** The engine is the experience
  itself — every decision must be meaningful, difficult, and emotionally engaging
  *on its own*. Nobody should play just to reach the next Autopsy. Gameplay → curious
  about the market; Autopsy → curious about yourself.
- **Conviction, not certainty.** Not a detective game with a correct answer. The
  player builds *enough confidence to act* — never tries to be sure. Research
  *increases* uncertainty (reveals how much was always there); the skill is acting
  clearly anyway.
- **The amount is not the signal — how you arrived at it is.** Never imply "bigger
  bet = more meaningful" (that rewards gambling and corrupts the Autopsy). Same
  allocation can earn opposite verdicts; different allocations can earn the same one.
  Coaching question: *"why this amount, and what changed your mind?"* — never *"why
  not more?"*
- **The real conflict is internal** (your reach vs. your fear), not two NPCs giving
  advice. "A reasonable amount" settles the external argument, not the internal one;
  the unavoidable cost of any choice is finding out what kind of investor you are.
- **The transformation:** *become someone who can make investment decisions without
  needing certainty.* Late-game calm is self-knowledge, not market knowledge.

**Build status (2026-07-01).** The Chapter One vertical slice is implemented
end-to-end in `src/components/DecisionClimax.jsx` (the `?proto=decision` prototype)
and is the live deliverable: mysterious opening → interactive cold open (Ray) →
roam-able phone morning on a world clock (Marcus = badge pressure, Mom = a phone
**call** = weight, News breaks, market opens 9:30, texture apps with one job each)
→ decision (say → drag-to-commit → hold) → order ritual → settle ("what have I
done") → night cliffhanger → **Result** (the second clock) → **Autopsy** (5 acts:
decouple what-happened from what-you-did · echo-chamber reveal · words-vs-hands ·
process verdict · Investor-DNA seed) → **Day Two** hook. Day One stays guided
(tutorial); later chapters open up. Next: put it in front of real players.

**Second prototype — the naked loop (`?proto=core`, `src/components/CoreLoop.jsx`).**
Built 2026-07-02 to test the skeleton with no story: 10 REAL historical moments
(NVIDIA '24, GameStop '21, First Republic '23, Meta '22, Tesla '19, Sears '14,
Apple '16, Zoom '20, Moderna '20, Microsoft '13), names hidden until after the
call. Plain language only (playtest rule: no finance terms, no short forms, no
unexplained symbols — clues literally say "says UP / says DOWN" plus loudness in
words). Outcomes are what really happened, so it cannot teach fake rules; an
authored "careful read" per case separates judgment from result. End report
mirrors loss-aversion (bet size after losses vs. wins) and outcome concentration
(one call carries the profit → why whole-market funds win). **Playtest verdict:
learnable but "feels like a test, not a game" → the skeleton needs the skin.
Next: merge — real-history moments inside the lived Chapter One frame. Open
design question from playtest: teach single-stock judgment vs. index-fund
reality (student/married/how-much-money identities) — see life chapters, §7.**

**v3 (insight-as-reward) + v4 (rule-proofing), 2026-07-02.** Playtests drove two
more iterations: (a) reflection ≠ reward — added the RHYME mechanic (cases carry
hidden shapes: craze/scare/fade/machine/flip; noticing a rhyme before it's named
pays a bonus; report confirms discoveries, told-lesson block deleted). (b) A
player solved v3 at 9/10 with one rule ("always bet against the loudest clue")
because famous stories are famous for being ironic → added 6 counter-rule cases
(Amazon '15, Nikola '20, AMD '15, Best Buy '12, Enron '01, Intel '20; pool now
20, draw 10) so every simple rule scores ~6/10, plus a RULE DETECTOR in the
report that names the player's rule to their face. Key playtest sentence: "he is
actually thinking about each question — in the chapter he wasn't." The loop
creates thinking; the chapter creates feeling. Merge later, deliberately.

**Chapter curriculum (agreed direction, 2026-07-02).** Chapters organized by
QUESTION, not by time order and not by labeled topic (labels re-create the rule
problem). Each chapter argues both sides of one question: 1. "Is loud the same
as true?" (GME, Amazon, Nikola, NVDA, Cisco) · 2. "When is a falling price a
bargain?" (Meta, FRC, Netflix, AmEx) · 3. "When is cheap a trap?" (Sears, Kodak,
AMD, Best Buy) · 4. "Does boring win?" (Apple, MSFT, Intel, Enron) · 5. "How do
you bet on a coin flip?" (Tesla, Moderna — really about sizing) · Final: mixed,
unlabeled. Every clue type in the game maps to free real-world sources (insider
filings, results, valuation, charts, news) — eventually say so IN the game
("everything you just used exists free in real life — here's where") as the
bridge to real-money confidence. All case figures are directionally real but
simplified; do a fact-check pass with exact numbers + sources before any public
release.

**Chapter mode built (2026-07-02), with two settled refinements:** (1) The
hidden question is DISCOVERED, not announced — chapter tiles say only "one
hidden question"; the report reveals it afterward ("Did you feel it? Every
moment was asking: …") with both sides argued. Rhyme mechanic lives only in The
Exam (in themed chapters it would be trivial and would leak the question).
(2) The rule detector is now a FRAMEWORK-BOUNDARY mirror, not an anti-rule
scold: great investors keep frameworks and learn their edges, so the report
itemizes exactly where the player's rule earned and where it cost ("It earned
on Amazon, NVIDIA. It cost you Nikola, GameStop, Cisco… learn exactly where it
stops working").

---

## 1. The vision, in its current (evolved) form

The vision sharpened a great deal through discussion (see §3 for the journey).
Where it currently stands:

- **It is a game about financial *character*** — who you become when money meets
  uncertainty — **not a life simulator.** "Life simulator" is a trap: the moment
  you *simulate* a life you owe systems for it (jobs to manage, errands,
  relationship meters), which is a second genre with a second mastery
  (optimization) that quietly eats the core. **Life is the stage, not the
  system.** You *experience* the life; you only ever *do* one thing.

- **The one repeatable verb is `commit`.** Under pressure, with incomplete
  information, the player puts some portion of what they have toward a future
  they want — or doesn't. Everything else (messages, news, family, the dream)
  exists only to load that one act with meaning, pressure, or revelation.

- **What's being mastered:** not "investing," not stock-picking. The deepest
  framing we reached is **better thinking under uncertainty** — the *process* of
  deciding when certainty never arrives (gather → commit → own), not the
  correctness of any conclusion. Decision *quality* is the root; *self-alignment*
  (acting in line with your goals/values) is its long-run *result*.

- **The product's job is to REVEAL what was invisible while the decision was
  being made** — the pressure you didn't notice, the sources you avoided,
  confirmation bias, luck vs. skill, opportunity cost, long-term consequence.
  Not to teach. Reveal.

---

## 2. Canonical design principles (settled)

These are load-bearing. Treat changes to them as changes to the product.

1. **Money is a tool to build the life you want.** Dreams (a first car, moving
   out, supporting family, starting a company) are the *reason* money matters —
   never rewards. Without dreams, investing is a math game.

2. **Show behavior, never the math.** No finance jargon in the gameplay loop.
   The hype lives in *characters* (Marcus) so a wiser player hears it *as* hype.
   Real numbers are allowed only inside an optional, diegetic primary source (the
   earnings report) that deliberately does **not** resolve the decision.

3. **Process over outcome.** A good decision can lose money; a reckless one can
   get lucky (the engine already encodes a `lucky_not_good` archetype). The game
   rewards decision quality, **never** the result. Outcome must never contaminate
   the quality signal.

4. **Two Clocks.** Fast emotional feedback at the moment of action is
   deliberately decoupled from the slow financial truth, which is revealed later
   in an Autopsy. The portfolio value is blurred at commit time on purpose.

5. **Temptation is emotional, never computed.** Show the *gap* to the dream as a
   fact; never show a projected return — that would rebuild the min-max
   calculator and break the Two Clocks. The upside is made concrete through
   **time** ("keys in your hand by summer, not next year"), not a number.

6. **Reveal is the twin of concealment.** You can only reveal what you first
   deliberately hid. The art is choosing *what to hide during the act*, because
   that determines what's available to surface afterward. Hide → Reveal is one
   mechanism seen from both ends; the gap between what you see while acting and
   while reflecting *is* the product.

7. **Mirror over judgment; reveal over coaching (mostly).** The Autopsy should
   reflect/reveal, not score. Scoring decision quality creates a target players
   game (Goodhart): they'll perform diligence theater (open the report, nod at
   the warning, do what they wanted anyway). A reveal lets players convict
   themselves. (Caveat we surfaced: even a *reveal* isn't neutral — the
   **selection of which facts to surface is itself a thesis**. Reveal is just the
   *quietest* form of authorship, not the absence of it.)

8. **Capture silently, show selectively.** Behavioral telemetry is recorded
   continuously and invisibly; the behavioral "fingerprint" is dev-only for now.
   This is the raw material for the future Autopsy / Investor DNA.

9. **Discover information, don't consume it.** The phone *is* the world. The
   player investigates; the game never delivers a briefing.

10. **Sources must be differentiated by emotional function** (see §4). Messages =
    *emotional pressure*; News = *complexity*. News should complicate what Marcus
    makes simple.

---

## 3. The design conversation — how the vision evolved (the "history")

This is the part hardest to reconstruct from code, and the most valuable to
carry. Each step is a realization, the pushback it met, and where it landed.

### Round 1 & 2 feedback (UI → meaning)
- Make the phone behave like a real phone (notifications clear after reading).
- Add a research/exploration layer so the player investigates, not just receives
  pressure.
- Stronger immediate post-investment emotion **without** revealing P&L.
- **Differentiate the sources:** Messages = emotional pressure (FOMO, social
  comparison — Marcus); News = complexity (Is this justified? Too expensive? What
  do the numbers say? What are the risks?). Each source should create a *distinct
  feeling*. Add one **truth source** (a dry earnings report with real numbers)
  whose read/unread state the Autopsy can later reflect.
- Make the upside *feel* real (a concrete fantasy, not a guarantee).
- (Deferred by mutual agreement) Structure the whole game as life **chapters**.

→ **All of round 1 & 2 is built and verified.** See §5.

### Realization A — "We're building a parallel life simulator."
Player: the real subject is life, not the portfolio; character identity changes
the meaning of an identical market event.
→ **Pushback/landing:** Agree with the *soul*, reject the *label*. Not a life
simulator (the systems trap). It's a game about **financial character**; **life
is the stage, not the system**; the one verb stays **commit**. Identity is the
highest-leverage, cheapest idea (same market, different stakes: to a grad an NVDA
spike means "the car comes faster"; to an international student on a thin
emergency fund it means "if this drops I can't make rent" — existential, not
material). **Knife test for any feature:** *does this load the decision, or
create a second thing to optimize?* If the latter, cut it.

### Realization B — "Mastery is becoming a better *decision-maker*, not just alignment."
Player: two players who both go all-in — one from hype, one after examining
conflicting information and consciously accepting uncertainty — are *not* the
same investor. Reward decision quality, not style.
→ **Landing:** Conceded — **decision quality is the root; alignment is its
result.** But two warnings: (1) the **checklist-theater trap** — reading isn't
quality; on a *single* decision, genuine examination and diligence-cosplay are
behaviorally identical, so **don't reward quality, *mirror* it**; (2) quality is
**only legible across a life**, not one decision — which is *why chapters matter*
(they're the measuring instrument for judgment, not content variety).

### Realization C — "The Autopsy should be a *coach*, not just a mirror" + "the subject is *thinking under uncertainty*."
Player: a mirror explains the past; a coach improves the future via Socratic
questions ("Were you searching for information, or for certainty?"). The real
skill is thinking; investing is just the practice court; could later expand to
careers/entrepreneurship.
→ **Landing:** Granted coach > mirror (reflection without vocabulary is just
staring). But: **a leading question is a judgment wearing a question mark** — the
coach smuggles back a "right *way to think*" after we exiled the "right answer."
That may be fine, but **name the coach's thesis on purpose.** Also: "thinking
under uncertainty" is a **north star, not a knife** — it can justify anything;
keep `commit` as the design constraint. Each zoom-out buys vision but spends
discipline.

### Realization D — "Why would the player *open* the Autopsy?" → curiosity first → **Reveal.**
Player: in Hades/Chess.com, players open analysis because they're *already
curious*, not because the game teaches well. The Autopsy's first job is a
**Reveal** of what was invisible during the decision. Proposed order: **Curiosity
→ Reveal → Reflection → Coaching → Growth.** Candidate core principle: *"We reveal
what was invisible when the decision was made."*
→ **Landing:** Strongest foundational sentence yet (it actually cuts features).
But sharpened: those games power curiosity with **outcome** ("did I lose? why?"),
and **we deliberately hid the outcome** (Two Clocks). So **curiosity must be
engineered *upstream*, in the decision** — via the blurred value, the relational
dissonance (Marcus cheered, Mom worried), and time. **The Autopsy doesn't create
curiosity; it discharges a debt the decision incurred.** If a player isn't
curious, the bug is in the *decision*, not the Autopsy. Also: reveal is the twin
of concealment (principle #6), and a reveal isn't neutral (principle #7 caveat).

### Realization E — "Reveal is a *capability*, not a screen → reveal *patterns* across a lifetime."
Player: patterns ("every time social excitement rose, your allocation rose too";
"you've never opened a primary source before deciding") are more powerful than
single-decision reveals. Reframe **Investor DNA** from trait scores
(FOMO = 72) to **discovered behavioral patterns** ("you trust friends more than
reports") — self-discovery, not analytics. Proposed: define the lifetime
*pattern engine* before building the first reveal screen.
→ **Pushback (current edge of the discussion):** **The dependency is backwards.**
A pattern is just *one signal, aggregated* — you can't build the molecule before
the atom exists and is validated, or you'll define atoms of the wrong shape. A
pattern across six campaigns needs six campaigns *and* a single-campaign signal
that already lands; we have one decision and zero human-tested reveals. The whole
thing lives or dies on **voice** (self-discovery vs. horoscope), which is
**empirical** — only resolvable by rendering one real line about real behavior
and reading it back. ("FOMO = 72" and "you trust friends over reports" come from
the *same data*; the difference is voice, not architecture.) The one
legitimately-upfront concern — *log richly now so patterns are reconstructable
later* — we already satisfy.

**Observation worth keeping:** the player's three best pattern examples are the
*same atom* — **your relationship to disconfirming information** ("you read
opinions that agreed with you," "you trust friends over reports," "never opened a
primary source"). That's the richest first atom to build, and the root of most of
the patterns they want.

---

## 4. Source differentiation (built) — the four News sources

Opening News should feel like four different rooms, not one repeated headline.
Each carries a `tone` that drives a distinct color "spine" + source-label color,
and a distinct emotional job:

| Source | `tone` | Emotional job | Accent |
| --- | --- | --- | --- |
| NVDA Investor Relations (the **truth source**) | `report` | dry, clinical, trustworthy; *slows you down*. Opens into a monospace stat block: revenue +94%, data-center +206%, gross margin 74%, guidance raised, **price-to-sales ~40× vs 5-yr avg ~18×**. Business booming **and** price extreme — both true → "is it worth *this* price?" is left unanswerable on purpose. | cool blue |
| Marketwatch · Opinion | `warning` | makes you *nervous* ("the best company at the worst price") | amber |
| r/wallstreetbets | `social` | *chaotic, contagious* ("turned $4k into $14k, quit my job") | magenta |
| The Wire · Explainer | `explainer` | *understand it, still no clear answer* | neutral grey |

Kicker: *"Four takes on the same morning. They don't agree."* The read/unread
state of each source is captured silently; `readReport` and `newsOpened` feed the
(future) Autopsy.

---

## 5. Technical state (what's built & verified)

**Stack:** React 18 + Vite 5, ESM. Pure engine functions runnable under
`node --test`.

**Routes:**
- `/` — the main app (intro → day screens → why-capture → autopsy shell).
- `/?proto=decision` — the standalone **decision-climax** prototype (the furthest
  along, the real deliverable right now).
- `/?proto=decision&dev=1` — same, with the **behavioral-fingerprint dev panel**.

**The decision-climax flow** (`src/components/DecisionClimax.jsx`, ~1,260 lines):
`wake → phone (lock / home / messages / savings / trade / news) → house (Mom in
the kitchen) → say (what are you telling yourself?) → move (drag-to-commit) →
done (world feed + locked position card)`.

**Verified working this session (round-2 feedback, all live in the preview):**
- Four differentiated News sources render with distinct tone colors; the earnings
  report opens its dry monospace stat block.
- Phone badges clear after reading (Messages 3→0, News 1→0).
- Centralized "‹ Home" nav bar (fixes an earlier dead-end where News couldn't be
  closed).
- The **dream-whisper** fades in as the thumb nears all-in; warm italic; `.reach`
  variant ("you can almost feel the wheel in your hands") + pulse when all-in.
- The **resistance curve** still reaches a true $10,000 all-in (heavy over the top
  decile but not capped).
- Hold-to-commit → `done`. Position card shows shares @ price, value blurred as
  `$▮▮▮▮▮` with a **breathing `posAche` animation** ("it won't tell you a thing").
- **World feed** branches by commit fraction: all-in → Marcus "LETS GOOO 🚀",
  Wire rally, dream flicker ("you see it parked outside… then it's gone — you
  won't know for a while"), Mom "…what did you do."
- DEV fingerprint captures: deliberation time, allocation changes, reversals,
  max-then-settled, commits-aborted, times stepped away, pause-before-commit,
  **Sources opened (N of 4)**, **Read the earnings report (yes/no)**, plus a
  **research-verdict** line ("You read the warning. You went big anyway.", etc.).

**Engine:** `npm test` → **9 tests pass**, including the QA invariant that a
higher-decision-quality path makes *less* money than a lower-DQ path
(process ≠ outcome), and `lucky_not_good` for reckless-but-lucky.

**Build:** `npm run build` clean.

### File map
```
investment-time-machine/
├── README.md
├── index.html · package.json · vite.config.js
├── campaign.json        # 3-day AI-Boom campaign + autopsy + static scenarios (content)
├── whys.json            # Motivation Library + context menus (instrument data)
├── src/
│   ├── main.jsx         # boot + ?proto=decision toggle
│   ├── App.jsx          # main app shell
│   ├── content.js       # imports campaign.json + whys.json
│   ├── format.js        # num / money / pct / fill helpers
│   ├── styles.css       # ALL styling (~2,400 lines): pixel UI, phone, animations
│   ├── components/
│   │   ├── DecisionClimax.jsx  # THE prototype (phone world + drag-to-commit)
│   │   ├── DayScreen.jsx · Intro.jsx · WhyCapture.jsx · Signals.jsx
│   │   └── Autopsy.jsx         # slow-clock reflection (shell)
│   └── engine/          # pure, tested
│       ├── money.js · scoring.js (DQ) · dna.js
│       └── engine.test.js · coverage.test.js
└── docs/
    ├── design-plan-v1.1.md   # the detailed product design plan
    └── PROJECT-LOG.md        # this file
```

**Content / engine / UI are intentionally separated.** Content lives in the
root JSON; the engine interprets it (pure, tested); the UI renders it. Don't move
`campaign.json` / `whys.json` — they're imported by relative path from
`src/content.js`, both test files, and `vite.config.js`.

### Run / resume on a new device
```bash
git clone https://github.com/Chuyuyan/investment-time-machine.git
cd investment-time-machine
npm install
npm run dev      # http://localhost:5173/?proto=decision&dev=1
npm test         # 9 engine tests
npm run build
```
The repo is currently **private**. `node_modules/`, `dist/`, and `.claude/` are
git-ignored (the last holds machine-specific absolute paths — recreate local
tooling config per device).

---

## 6. The immediate next step (where we paused)

**Decision before the next step:** *name the coach's thesis — what does this game
believe good thinking under uncertainty looks like?* (e.g. curiosity over
certainty-seeking; owning a decision over reacting to one). That belief is now the
game's spine; every reveal/question encodes it whether chosen or not.

**Then build ONE reveal** on the Chapter One decision that already exists — do not
design the lifetime pattern engine first (see Realization E). Recommended first
atom: **confirmation-seeking / relationship to disconfirming information** —
*"You opened the source that cheered Marcus. The one that challenged him? You left
it closed."* Rendered as a **discovered statement, not a stat**. The data already
exists in the fingerprint (`newsReadIds`, which sources, `readReport`). Put one
real line in front of one real person and find out whether it reads as
self-discovery or as a horoscope. **That single test de-risks the entire
mirror → coach → pattern vision** — because voice can only be judged empirically.

**Three candidate first-reveal atoms** (pick one):
1. **The echo chamber** — what you read vs. what challenged you *(recommended;
   root of most desired patterns)*.
2. **Words vs. hands** — what you told yourself in the `say` phase vs. what your
   thumb committed (already computed, shown in dev as "your words said careful,
   your hands said more").
3. **Speed / pressure** — how fast and how socially-pressured the commit was.

---

## 7. Roadmap / deferred (with rationale)

- **The slow-clock Autopsy / time-skip that closes Chapter One.** The single most
  important unbuilt piece — it turns all the silently-captured behavior into the
  payoff, and it's the spine the whole "reveal / decision-quality / life-shaping"
  vision depends on. Must cleanly separate **what you did** from **what happened**
  (and be willing to say "strong decision, lost money" / "sloppy decision, got
  lucky").
- **Life chapters** (different age / cash / goal / market / pressure). Important
  long-term — the emotional backbone and the *measuring instrument* for judgment
  (mastery is only legible across a life). Prove Chapter One first. Identity =
  (what you have / what you want / what ruin means / whose voice is in your phone)
  over the *same* market.
- **Investor DNA as discovered patterns** (not trait scores) and the **Long
  Mirror** (≥3 encounters with the same provocation across campaigns). Both are
  *aggregations of validated single-decision atoms* — downstream of §6, not
  upstream.
- **Coaching questions** that emerge *after* a reveal (never before), anchored to
  what was actually revealed (anchored = insight; floating = fortune cookie).

### Open questions not yet resolved
1. **Does the Autopsy ever *judge*, or only ever *mirror*?** (Leaning hard toward
   mirror — judging reintroduces the "right answer" we threw out.)
2. **What is the coach's thesis about good thinking?** (Asked twice; unanswered.
   Blocks writing the first real reveal/question well.)
3. **Which first-reveal atom** to build (see §6; recommend the echo chamber).

---

## 8. The one bet (from the design plan)

> Does the **Decision Autopsy** make a player say *"I thought I was right, but now
> I understand my decision better"* — and want to share it?

Everything else exists to answer this. The MVP's job is to answer it; the rest of
the roadmap is worth building only if the answer is yes.
