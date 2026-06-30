# Investment Time Machine — Detailed Design Plan v1.1

> Consolidated from the full product discussion. This version corrects four
> inconsistencies found in the original Spec v1 (see §0.1).

---

## 0. The one bet

Everything hinges on one question:

**Does the Decision Autopsy make a user say _"I thought I was right, but now I
understand my decision better"_ — and want to share it?**

If yes, the rest of the roadmap is worth building. The MVP exists only to answer
this.

### 0.1 Corrections applied to Spec v1

1. **The MVP cannot validate the growth hypothesis.** The Long Mirror needs ≥3
   encounters with the same provocation across multiple campaigns over time. In a
   single 3-day campaign that is physically impossible. Fix: separate
   **"validate now"** (engagement, D2 retention, Autopsy impact) from
   **"instrument now, validate later"** (growth, DNA, Long Mirror).
2. **"Alternate timelines" was cut — but the Autopsy's Multiverse needs them.**
   We are not building *playable/generated* timelines, but the Autopsy MUST show
   **3 static, hardcoded scenarios** (Real / Bad / Catastrophic) or the
   "lucky, not good" gut-punch disappears. That is a stub, not a system.
3. **Alex needs two definitions.** MVP Alex = a one-shot comparison inside the
   Autopsy. Full Alex = a recurring rival across campaigns (post-MVP).
4. **The loop diagram in v1 is the full-vision loop, not the MVP loop.** The MVP
   loop ends at the Autopsy.

---

## 1. Vision & philosophy

An investment **decision-training game**. Users relive real market history and
make decisions under genuine uncertainty. The goal is not to teach concepts or
predict prices — it is to **develop judgment, emotional control, and
self-awareness** through consequence and reflection.

**Principles:** Learn by doing · Consequences create memory · Process > outcome ·
Confidence, not predictions · Show behavior, never the math.

---

## 2. Strategic thesis (the moat)

Not the content, the news, or the rubric — those are commodities. The defensible
asset is **proprietary longitudinal behavioral data + a proven-improvement
loop**: a system that can *show* a user changed how they behave under financial
stress.

Supporting evidence:

- **Vanguard Advisor's Alpha:** behavioral coaching ≈ **150 bps/yr**, the single
  largest component of an advisor's value.
- **Morningstar "Mind the Gap" (2025):** the average dollar earned ~7.0%/yr vs
  ~8.2% for the funds themselves — a **~1.2-point behavior gap**, ~15% of returns
  lost to bad timing; near-zero in diversified/automatic products.
- **Annie Duke ("Thinking in Bets"):** judging a decision by its outcome is
  "resulting"; the antidote is to score process, not results.
- **Barber & Odean:** the households that traded most earned 11.4%/yr vs the
  market's 17.9% — overconfidence and over-trading underperform on average.

The engine is the mechanism; the data and the proof are the moat.

---

## 3. Target user

18–35, beginner investors, $500–$50k to invest, financially curious but
overwhelmed, allergic to traditional courses.

---

## 4. The two loops (corrected)

**MVP loop (what ships):**

```
Historical Event → Decision → Capture Why → (×3 days) → Decision Autopsy → Share / Return hook
```

**Full-vision loop (roadmap):**

```
Campaign → Autopsy → Investor DNA update → Long Mirror (milestones)
        → targeted next Campaign → … → Reality Mode
```

---

## 5. Core systems

### 5.1 Historical Campaign

- 3–7 decision nodes, each = one emotional beat
  (curiosity → FOMO → euphoria → fear → doubt → clarity).
- **Fog of war:** 3 competing signals per node (bullish / cautionary / noise +
  a planted red herring) so users cannot pattern-match the "right" answer.
- **Uncertainty:** outcomes and P&L hidden until the Autopsy. The delayed-outcome
  reveal doubles as the anti-outcome-bias mechanism *and* the retention
  cliffhanger.

### 5.2 Capture the Why *(the data spine)*

Every decision requires a one-tap motivation. Architecture: a reusable
**Motivation Library** (atomic, each carrying a 7-trait fingerprint) +
**Context Menus** that re-skin 4 motivations per situation.
See `whys.json`.

- **Traits (backstage):** FOMO, Discipline, Patience, Conviction, Research,
  Risk Awareness, Calibration.
- **Key modeling rule:** Conviction is ambiguous alone —
  *Conviction + Research + Calibration = earned*;
  *Conviction − Research − Calibration = blind.*
- **Contexts:** Buying, Selling, Holding, Adding, Panic, FOMO, Crash, Euphoria.
- The why is the emotional payload for every downstream system (quoted back
  verbatim).

### 5.3 Decision Quality (scoring)

- **MVP:** hardcoded lookup table per choice (0–100). Indistinguishable from a
  "real engine" to a first-time user.
- **QA invariant:** DQ must show **~zero correlation with in-game P&L** — if they
  correlate, you have an outcome-bias leak.
- **Post-MVP:** dynamic, **goal-weighted** scoring (same trait vector judged
  differently for Student / Family / Retiree).

### 5.4 The Decision Autopsy *(the climax — build this best)*

A 5-act emotional reveal, not a results screen. Sequential, full-screen:

1. **Victory Lap** — show the outcome, let them feel like a genius.
2. **The Pivot** — "Was that a good decision, or a good outcome?"
3. **The Mirror** — quote their *own whys* back, name the bias (FOMO, recency,
   panic).
4. **The Multiverse** — their *same choices* across **3 static scenarios**
   (Real / Bad / Catastrophic) + the **Disciplined Twin** comparison +
   a luck-vs-skill verdict ("Lucky, not good").
5. **The Reframe** — turn the wound into agency; end on the skill they can build
   + the return hook.

**Voice:** poker coach, not schoolteacher. Never "wrong" — use
"risky / fragile / lucky." Credit before confronting. End on power.

### 5.5 The Disciplined Twin — "Alex"

- **MVP:** a one-shot shadow in Autopsy Act 4 ("you beat Alex this round; he'd
  win the decade").
- **Post-MVP:** a recurring rival whose narrowing gap *is* the growth narrative.

### 5.6 Investor DNA

- **MVP:** computed and *stored* from why-taps, **not displayed** (or only a
  single playful archetype label). Instrument now; the data is impossible to
  backfill.
- **Post-MVP:** trajectory with confidence bands (never jumpy single-campaign
  numbers — that would betray the thesis), shareable archetype evolution.

### 5.7 The Long Mirror *(post-MVP; data foundation in MVP)*

Rare, earned milestone: Past Self vs Present Self on the *same provocation
archetype*. Shows two choices + two verbatim whys → **"Same fear. Different
you."** Trait math runs backstage to detect/validate the moment (consistency
guard against noise); onstage shows only behavior, words, and the archetype
shift. **Cannot appear in a 3-day MVP** — moved to roadmap, but its fuel
(why-capture, archetype tags) ships in MVP.

Emotional arc: Re-immersion → Recognition (cringe + empathy) → Reveal →
Contrast → Identity shift → Continuity. Be compassionate toward past-self.

### 5.8 Long-Term Growth System *(post-MVP)*

Matched-provocation behavior change + spaced repetition on weakest trait +
pre-commitment + Rematch + mastery-gated progression toward "graduation" to
Reality Mode.

---

## 6. MVP scope (precise)

**Ships:**

- 1 campaign: **AI Boom, 3 days** (The Spike → The Peak → The Shock), played in
  one ~10-minute sitting. See `campaign.json`.
- Profile: **New Graduate, $10,000, long-term wealth** (single, fixed).
- Full session loop: story → 3 fog-of-war signals → 4 choices → **why-capture** →
  process-only feedback → cliffhanger.
- **Decision Autopsy** (all 5 acts) with **3 static scenarios** + **one-shot Alex**.
- Share card + reaction capture + email/return hook.

**Faked / stubbed (deliberately):** scoring = lookup table; DNA = stored, not
shown; "alternate timelines" = 3 hardcoded scenario numbers; Alex = fixed ideal
choices.

**Explicitly NOT built:** brokerage integration, real news assistant,
*playable/generated* timelines, confidence calibration, Bayesian DNA, multiple
profiles, multiple campaigns, Long Mirror, growth visualizations.

**Money model (deterministic, no real data):** track {nvda, etf, cash}; each
choice rebalances; scripted phase returns (Run-up: NVDA +55% / ETF +18%;
Crash: −28% / −9%; Recovery: +30% / +10%). Full numbers in `campaign.json`.

---

## 7. Validation plan

| Hypothesis                 | Testable in MVP?              | Metric                                   | Target |
|----------------------------|------------------------------|------------------------------------------|--------|
| Engagement                 | Yes                          | % of starters reaching Autopsy           | ≥60%   |
| **Autopsy impact (primary)** | Yes                        | "Did this surprise you?" yes / rating ≥4 | ≥40%   |
| Worth sharing              | Yes                          | share / copy rate                        | ≥15%   |
| Day-2 retention            | Yes (proxy)                  | next-day return                          | ≥25%   |
| **Long-term growth**       | No — needs longitudinal play | instrument why-data now                  | later  |

**Most important:** watch 5 real faces hit Act 3–4 in person. That beats 500
analytics rows.

---

## 8. Tech & architecture (solo dev, 1 week)

SPA (React/Vite or Svelte) · all content in `campaign.json` + `whys.json` ·
`localStorage` for return detection · **PostHog** for funnels · email capture via
Tally/serverless (hand-send the D2 nudge for a small beta) · share via Canvas +
Web Share API. **No backend required.**

---

## 9. Data model (key schemas)

```json
Motivation:  { "id", "text", "family", "archetype", "traits": { "fomo","discipline","patience","conviction","research","riskAwareness","calibration" } }
ContextMenu: { "context", "options": [ { "motivationId", "text" } ] }
DayNode:     { "id","title","date","story","whyContext","signals":[], "choices":[ { "id","label","alloc","dq","archetype","feedback" } ] }
RunState:    { "nvda","etf","cash","chosen":[], "dnaVector":{}, "dqScore","returnPct","verdict","archetype" }
```

---

## 10. Build plan (7 days)

1. Scaffold + JSON schemas + all copy.
2. Day-screen + money/DQ pure functions.
3. Wire 3 days, verify math against worked examples.
4. Autopsy Acts 1–5 + 3-scenario grid.
5. Share card + reaction capture + PostHog.
6. Mobile polish + drop-off instrumentation + copy pass.
7. In-person test (5 users), fix worst friction, ship link.

---

## 11. Roadmap (post-MVP sequence)

DNA display & archetypes → goal-based scoring (profiles) → recurring Alex →
static → generated alternate timelines → **Long Mirror** → growth system &
spaced repetition → Reality Mode → B2B2C / broker-referral monetization.

---

## 12. Risks & open questions

- **Fun risk (highest):** hiding P&L removes the usual dopamine — does
  process-feedback + the Autopsy replace it? *This is what the MVP tests.*
- **Friction risk:** is the why-tap delightful or homework? (A/B if unsure.)
- **Tone risk:** a gut-punch in the wrong voice creates defensiveness, not
  insight.
- **Open:** is "New Graduate" the most relatable single profile, or should the
  MVP let users pick one of two?

---

## 13. Glossary

Capture the Why · Decision Autopsy · The Multiverse · Disciplined Twin (Alex) ·
Investor DNA · Long Mirror · Provocation Archetype · Decision Quality (DQ).

---

## Files in this folder

- `design-plan-v1.1.md` — this document.
- `campaign.json` — the full 3-day AI Boom campaign + Autopsy + Alex + scenarios.
- `whys.json` — the Motivation Library (27 motivations) + 8 Context Menus +
  9 Archetypes.

## Sources

- Morningstar "Mind the Gap" (2025): https://www.morningstar.com/funds/11-takeaways-our-research-missed-investor-returns
- Vanguard Advisor's Alpha (behavioral coaching ≈ 150 bps): https://corporate.vanguard.com/content/dam/corp/research/pdf/putting_a_value_on_your_value_quantifying_advisors_alpha.pdf
- Annie Duke, "Thinking in Bets" (resulting / decision quality): https://www.annieduke.com/books/
- Barber & Odean, "Trading Is Hazardous to Your Wealth": http://faculty.haas.berkeley.edu/odean/papers/returns/individual_investor_performance_final.pdf
