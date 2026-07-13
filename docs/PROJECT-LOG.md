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

**THE FUSION DESIGN (agreed direction, 2026-07-05) — how life and chapters
combine.** Principle: life is the wrapper, never the delay. Full production only
at chapter open (the pinch) and chapter close (the Autopsy); every decision in
between gets 1–2 minutes of compressed life: (1) a VOICE brings the situation
(Marcus/coworker/Mom), (2) the persistent savings bar + dream shows what the
money means, (3) ONE ripple after. Chapter = life stage × era × hidden question
(eras naturally cluster by mood, so real history supplies the curriculum):
Ch.1 = age 22, 2020–21, Moderna/Nikola/Zoom/GameStop, "Is loud the same as
true?" · Ch.2 = age 24, 2022–23, Meta/FRC/Netflix, "When is a falling price a
bargain?" · later chapters shift identity (married, obligations) so SIZING
overtakes PICKING and the whole-market-fund choice becomes a real dramatic
option (the XEQT resolution). Names stay hidden in-story ("the vaccine company
Marcus won't shut up about"); the chapter Autopsy reveals "this was Moderna —
it really happened" as the mic-drop. Bets come from the persistent life
bankroll (the car fund), which is the entire feeling-layer in one mechanic.
Rejected alternatives: study-app-in-phone framing (homework feeling), full
production per decision (buries thinking).

**v5 — THE INVESTIGATION GAME (2026-07-05).** Response to "still an interactive
story — the player consumes content": clues now start FACE-DOWN, labels only.
The player chooses where to look (2 free looks; deeper digging costs $200/$400
from the fund — time is money), or buys on the pitch alone (allowed, recorded).
This makes information-selection the second interlocking decision (what do I
look at? → what do I do?), which is the actual skill: deciding which information
deserves limited attention. At reveal, skipped cards flip anyway ("you never
opened this") with a regret line when the clue that pointed the right way went
unopened — reveal-is-the-twin-of-concealment, mechanized. The report gains an
INVESTIGATION MIRROR: your looking habit ("you opened Online buzz most, never
once What the bosses did" / "decided on the pitch alone 4 of 5 times"). This
finally implements principle #9 (discover information, don't consume it) in the
core loop.

**v10 — THE TAPE (2026-07-06).** Playtest on v9: "story unchanged/stronger is
not natural · I can't see any reason for the result · I still can't see this
moving toward a game." Root diagnosis: after nine versions of text cards, the
problem wasn't rules — NOTHING MOVED. Games have a world running in time under
your hovering thumb. Rebuilt the second act as a LIVE TAPE: after commit, the
real price path draws itself (~20s), P&L ticks live, news lands and PAUSES the
tape (decision space), and plain-language buttons sit under your thumb the
whole time (Buy $500 more · Sell half · Sell everything — all "story" jargon
deleted). Sell early and the tape keeps rolling without you — you WATCH what
you dodged or missed. Exits graded by what you sold ON, via timing attribution:
a fact ("you sold because the facts changed — the right reason"), a scary
headline ("changed nothing real"), or nothing at all ("nothing had happened —
except the price. The number scared you, not the facts."). The reveal shows the
whole ride as a chart with your actions marked (▲ adds · ◆ half-sells · ▼
exit) — the result explains itself visually. Report ledger: why-you-sell
(facts / headlines / price-alone / stayed-through-broken-facts).

**v9 — THE THESIS LOOP (2026-07-06).** Player caught v8's flaw before playing
it: hold-or-sell on price moves = a trading simulator that TRAINS price-reaction
(the disease we exist to cure). Rebuilt around the thesis (per Sid Meier's
interesting-decisions criteria + Koster's fun=learnable-pattern): (1) at commit
the game WRITES YOUR THESIS BACK with the steelman ("UP — because X. The
strongest voice against you: Y") — thesis formation is explicit, information
gets organized, autonomy preserved. (2) Beats carry hidden tags (kind:
fact/noise, side) — the game never shows them; judging fact-vs-noise IS the
learnable skill. Beat question: "You're in because of [your reason] — does this
news change that story?" Four actions: story unchanged—hold · stronger—add ·
shaky—sell half · broke—get out. (3) Exits graded by REASON, not price: "You
left because the STORY changed — the right reason, whatever the price did" vs
"You left on noise" vs "the facts broke your thesis and you stayed for the
price." Price comparison demoted to "for the record." (4) Report: "The pattern
you're developing" — why-you-leave ledger (story exits vs noise exits vs dead
holds). (5) MARCUS IS A PERSON now, not a bot: his last two results set his
mood, mood sets his size (heater→$2,000 double-down, down-bad→$500) with
emotional lines — he sizes on feelings, the anti-model alive; rival AND
relationship. Belief evolves, not just the position.

**v8 — THE SECOND ACT (2026-07-06).** Player: "career/rival/streaks are
amplifiers — the individual decision still isn't intrinsically interesting."
Diagnosis: the decision had no second act (read → bet → outcome = a quiz). Real
investing unfolds AFTER you're in. Cases now carry a normalized price `path`
(entry=100) and `beats`: after committing, the position LIVES — price moves
against you, news lands, Marcus reacts — and at each beat you choose HOLD /
ADD $500 / SELL EVERYTHING. Sell early → the reveal compares exit vs. end
("holding would have made you $X more — you read it right, the wiggle shook
you out" ↔ "selling saved you $X — knowing when you're wrong is a skill too").
Report gains the SHAKEN-OUT mirror. This is the Two Clocks as gameplay: each
beat is the fast clock trying to break your slow-clock thesis. Beats written
for Chapter I (NVIDIA dip→rip, GameStop squeeze-then-collapse, Amazon weak
quarter→cloud reveal, Nikola spike→downhill-truck report, Cisco climb→wobble);
other cases resolve single-shot until beats are authored. ALSO the LIFE FUND
(player: "when I lose money I want my life to change"): money converts to
Saturdays at Ray's $200/shift ("that's 10 Saturday shifts — gone"), and the
chapter-select shows the Civic bar ($15,400 goal) with life captions that
change with the balance ("bus pass, instant noodles" → "you could buy it today
— or keep it invested; people face this exact choice").

**v7 — MAKE IT A GAME (2026-07-06).** "Good lesson — how do we make it FUN?"
Three additions, each mission-checked: (1) CAREER FUND — one bankroll persists
across all chapters (localStorage); fall below $250 → BUST screen, career over
("the market didn't end your run — your bet sizes did; stay in the game").
Survival/sizing is now the game itself. (2) MARCUS THE RIVAL — follows the
loudest clue every round, always $1,000, never sits out; calls his bet BEFORE
you decide (social pressure, measured: conformity mirror "you bet with Marcus
8 of 10" + independence stat "when you disagreed you were right X of Y"); runs
his own career fund; chapter select is a You-vs-Marcus scoreboard; when he wins
a run the report says loud-and-lucky look identical over ten bets. (3) JUICE —
rolling P&L count-up, streak flair. Plus a teach-in-the-moment note when a DOWN
bet loses more than its stake (real short-selling danger, prevents "bug"
perception). Also same-day: valuation label → "Is the price fair for what you
get?" + collapsed "New to stocks? 20s of basics" primer with the corner-shop
analogy (playtest: user couldn't distinguish trend vs. value — the game never
taught what a stock IS).

**v6 — THE REASON (2026-07-05).** Player feedback: the skill isn't which card
you flip, it's WHICH SOURCE YOU TRUST; and the strongest regret isn't "you never
opened this" but "you opened it and talked yourself out of it." So: flip-cards
deleted — all clues open, always (reading is thinking). To place a bet you must
tap the ONE clue carrying your call ("what are you leaning on?"). The ignored
warning detects itself (bet against a strong clue history proved right → "You
read it. You decided it didn't matter. It was the one that mattered."). The
report becomes a personal TRUST LEDGER: per-source track record of the clues
that carried your calls ("'Online buzz' carried 4 — 1 held; you never once
leaned on 'what the bosses did'"), plus an override count. The ideal loop is
now the actual loop: pitch → investigate → conflicting evidence → less certain →
enough conviction → commit. Goal taught by structure: not knowing everything —
reaching enough conviction to act despite uncertainty.

**v5.1 CORRECTION (2026-07-05, same day) — agency ≠ scarcity.** The pay-to-look
version failed its first playtest immediately ("I cannot think and learn").
Lesson banked as a principle: you can't learn to value information you've never
seen, and paying-to-look is scarcity, not agency. Now: every clue shows its
direction chip + label up front (the CONFLICT is visible at a glance — that's
what powers thinking); full text is one FREE tap away; read all, some, or none;
choices still recorded. When reading is free, what you skip reveals character,
not budget — a STRONGER mirror. Real attention-scarcity belongs to the life
layer's clock (the 9:30 open), never to fees in the learning loop.

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

---

# PART TWO — THE v2 DESIGN VISION (2026-07-13)

> This is the clearest statement of the game we have. It supersedes the earlier
> exploratory framing as the **direction** (not by deleting it — v1 stays live at
> `?proto=core`). Read this before designing anything so we never drift back into a
> **Life Sim** or a dry **Investment Simulator** again.
>
> Structure: **Mission → Fantasy → Core Principle → Core Loop → Systems → Learning
> → Progression → Filter.**

## Mission
Help players become better **real-world** investors — not by teaching them to predict
the market, but by teaching them how to **discover opportunities, evaluate evidence,
allocate capital, and make better decisions under uncertainty.**
- Not a stock simulator. Not a finance-theory course.
- Goal: build the *thinking process* of a great investor.
- Everything practiced must transfer directly to real investing.

## Fantasy
**Become the investor who finds what everyone else missed.**
Not "get rich," not "beat the market with luck." Become the person who recognizes
opportunity early, stays calm through uncertainty, and **survives the biggest moments
in market history.**

## Core Principle
- **Tradeoffs create gameplay.**
- **Uncertainty creates authenticity.**
- Uncertainty alone is not fun. Tradeoffs alone are not investing.
- **The game lives where the two overlap.**

## Core Gameplay Loop
The player opens the game out of **curiosity** ("what happened in the market today? is
there something everyone is misunderstanding?"), never to "answer another question."

    Market → something unusual happened → investigate → build conviction →
    allocate capital → manage portfolio → the market responds → reflect →
    something new catches your attention

Driven by **discovery**, not quizzes. Our equivalent of "what's in the next cave? /
the next Joker? / the next relic?" is: **what's the next opportunity hiding in the
market?** Research must feel like *exploration*, never homework.

## Systems
- **The market is always alive.** Several real companies at once, each with price,
  chart, news, earnings, valuation, insider trading, filings, sentiment, analyst
  views. Nothing hidden behind game mechanics. **Attention — not information — is
  scarce.** The player chooses what deserves attention.
- **Portfolio = a base, not a deck, and not a container.** It's the persistent
  consequence of every decision; ownership comes from persistence. But the real
  gameplay is **capital allocation**, not portfolio management. The question is never
  "should I buy this stock?" — it's **"given everything I already own, how should I
  reshape my capital?"** Every opportunity forces a *relative* tradeoff (sell A to buy
  B? raise cash? double down? diversify? hold? wait?). The portfolio exists to
  **generate these relative decisions** — that is the class of decision that cannot
  exist without it.
- **Capital allocation is the core skill:** constantly balancing opportunity, risk,
  liquidity, conviction, existing positions, and future uncertainty — exactly what
  real investors do.
- **Storms are market events, not chapters** (COVID crash, dot-com, 2008, AI boom,
  meme mania). The storm doesn't ask what to do — it **reveals whether the portfolio
  you built during calm can survive.** FTL: build during calm, storm tests the build.
- **Life is not another game.** No relationships, cooking, farming, errands. Life
  exists only to give financial decisions **emotional weight**, and appears in exactly
  three places: (1) **sizing** ("$5,000 — that's three months of rent"), (2) **dreams**
  (car, emergency fund, home, independence — quietly visible, never interrupt), (3)
  **major life events** (medical bill, job loss, new child — change the financial
  situation, never become separate gameplay).

## Learning Philosophy
Everything inside the game is **real**: real companies, prices, news, earnings, SEC
filings, insider trades, market history. **No fake clues, no magical hints, no hidden
answers.** The player learns using exactly the information real investors use.

- **Reflection never grades outcomes — it analyzes process.** Not "right/wrong." It
  mirrors *how you think* (e.g. "you focused on earnings and revenue, ignored
  valuation"; "you consistently followed insider buying").
- **Reality Bridge:** every era ends by explicitly connecting the game to real
  investing — the skills used, and *where to find the same data today* (SEC EDGAR,
  Yahoo Finance, company IR pages, Macrotrends, TradingView). Constantly reinforce:
  **nothing you learned only works inside the game.**

## Progression
Not more story, characters, or gear. Progression = **entering richer markets.** Early
eras: few companies, simple situations. Later eras: more sectors, more companies, more
conflicting evidence, more simultaneous opportunities, more complex portfolio
decisions. **Difficulty comes from market complexity, not artificial mechanics.**

## Long-Term Transformation
Player starts chasing legendary stock picks; discovers the greatest investors aren't
the ones who predict every winner — they're the ones who discover better
opportunities, evaluate evidence clearly, allocate intelligently, survive uncertainty,
and let compounding work. Final realization is not *"I learned to predict stocks"* but
**"I learned to think like an investor."**

## Design Filter
Every new feature passes one test: **Does this help players become better real-world
investors while making the game more engaging?** Only teaches but isn't fun → reject.
Fun but doesn't improve real investing thinking → reject. The game succeeds only when
**engagement and learning reinforce each other.**

---

## v2 build log — the naked capital-allocation test (`?proto=v2`)

**What we're testing (the one question):** does a *relative* capital-allocation
decision — "given everything I hold and my scarce cash, what do I give up to take
this?" — feel **tense** or **clerical** when repeated many times? Reasoning took us as
far as it can (the portfolio provably generates a decision class that can't exist
without it; whether that class is *fun* is empirical). This is the smallest build that
settles it.

**Scope (deliberately naked):** one real era, **Jan 2019 → Dec 2021** (the COVID
crash is the storm). Five real companies with real, checkable, split-adjusted prices:
Apple, Microsoft, Tesla, Zoom, Delta — chosen because their paths *diverge violently*
so allocation shape matters (Tesla ~17x moonshot; Zoom pump-and-fade darling; Delta
cheap value-trap; Apple/Microsoft steady compounders; cash as dry powder). Start with
$10,000 cash. Each of 5 moments: read what's happening → **reshape capital under scarce
cash** (buy forces selling or spending your only cash) → time advances → the market
answers. Then process-mirror reflection + reality bridge. **No phone, no Marcus/Mom, no
chapters, no life-sim.** Just the relative decision, naked.

**Not yet built (the full vision above):** live multi-datapoint market, discovery/attention
economy, multiple eras/progression, dreams & life events, insider/filings data. Those
come only if the naked decision proves it has legs.
