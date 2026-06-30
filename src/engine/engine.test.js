// Build Plan day 3: verify the engine math against worked examples.
// Run with:  npm test   (uses node:test; loads the real JSON via fs).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { runCampaign } from './money.js';
import { dqAverage, riskBucket, verdict } from './scoring.js';
import { emptyVector, accumulate, nearestArchetype } from './dna.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const campaign = JSON.parse(readFileSync(join(root, 'campaign.json'), 'utf8'));
const whys = JSON.parse(readFileSync(join(root, 'whys.json'), 'utf8'));

const startCash = campaign.meta.startCash;
const choiceById = (dayIdx, id) => campaign.days[dayIdx].choices.find((c) => c.id === id);
const motivationById = (id) => whys.motivations.find((m) => m.id === id);

// ---------------------------------------------------------------------------
// Worked example A — the disciplined path 1C / 2C / 3C.
// 10000 -> ETF 7000 (Run-up) -> rebalance -> Crash -> hold -> Recovery
// = $11,086.03  (+10.86%). This is exactly Alex's path, matching realReturn +11%.
// ---------------------------------------------------------------------------
test('disciplined 1C/2C/3C = $11,086 (+10.86%), matches Alex realReturn ~+11%', () => {
  const choices = [choiceById(0, '1C'), choiceById(1, '2C'), choiceById(2, '3C')];
  const { finalValue, returnPct } = runCampaign(choices, campaign.engine, startCash);

  assert.ok(Math.abs(finalValue - 11086.03) < 0.5, `finalValue was ${finalValue}`);
  assert.ok(Math.abs(returnPct - 0.108603) < 0.0005, `returnPct was ${returnPct}`);

  const dq = dqAverage(choices); // (85 + 90 + 90) / 3 = 88.33
  assert.ok(Math.abs(dq - 88.333) < 0.01);
  assert.equal(riskBucket(dq), 'disciplined');
  assert.equal(verdict(returnPct, dq, campaign.engine.thresholds), 'unlucky_sound');
});

// ---------------------------------------------------------------------------
// Worked example B — the reckless leveraged path 1A / 2A / 3B.
// All-in NVDA -> Run-up -> leverage 2x (borrow 15,500) -> Crash -> buy dip ->
// Recovery -> repay loan = $13,516 net (+35.16%). The signature "lucky not good".
// ---------------------------------------------------------------------------
test('reckless leveraged 1A/2A/3B = $13,516 net (+35.16%) = lucky_not_good', () => {
  const choices = [choiceById(0, '1A'), choiceById(1, '2A'), choiceById(2, '3B')];
  const { finalValue, returnPct } = runCampaign(choices, campaign.engine, startCash);

  assert.ok(Math.abs(finalValue - 13516) < 1, `finalValue was ${finalValue}`);
  assert.ok(Math.abs(returnPct - 0.3516) < 0.0005, `returnPct was ${returnPct}`);

  const dq = dqAverage(choices); // (25 + 10 + 45) / 3 = 26.67
  assert.equal(riskBucket(dq), 'reckless');
  assert.equal(verdict(returnPct, dq, campaign.engine.thresholds), 'lucky_not_good');
});

// ---------------------------------------------------------------------------
// QA INVARIANT (§5.3): high DQ must NOT track high P&L. In this campaign the
// disciplined path has the higher DQ yet makes LESS money than the reckless one
// — proving DQ is decoupled from outcome (no outcome-bias leak).
// ---------------------------------------------------------------------------
test('QA invariant: higher-DQ path makes LESS money than lower-DQ path', () => {
  const disc = [choiceById(0, '1C'), choiceById(1, '2C'), choiceById(2, '3C')];
  const reck = [choiceById(0, '1A'), choiceById(1, '2A'), choiceById(2, '3B')];

  const discReturn = runCampaign(disc, campaign.engine, startCash).returnPct;
  const reckReturn = runCampaign(reck, campaign.engine, startCash).returnPct;

  assert.ok(dqAverage(disc) > dqAverage(reck), 'disciplined should out-score on DQ');
  assert.ok(reckReturn > discReturn, 'reckless should out-earn on P&L');
});

// ---------------------------------------------------------------------------
// DNA: disciplined why-taps should classify as The Steady Hand.
// ---------------------------------------------------------------------------
test('disciplined why-taps classify as steady_hand', () => {
  const taps = ['size_to_risk', 'take_profits', 'corrections_normal'].map(motivationById);
  let v = emptyVector();
  for (const m of taps) v = accumulate(v, m.traits);
  const { archetype } = nearestArchetype(v, taps.length, whys.archetypes);
  assert.equal(archetype.id, 'steady_hand');
});

test('reckless why-taps classify toward gambler/thrill_seeker', () => {
  const taps = ['dont_miss_out', 'leverage', 'reflexive_buy'].map(motivationById);
  let v = emptyVector();
  for (const m of taps) v = accumulate(v, m.traits);
  const { archetype } = nearestArchetype(v, taps.length, whys.archetypes);
  assert.ok(['gambler', 'thrill_seeker'].includes(archetype.id), `got ${archetype.id}`);
});

// ---------------------------------------------------------------------------
// Content integrity: every alloc must sum to 1; every choice archetype and
// every context motivationId must exist in whys.json.
// ---------------------------------------------------------------------------
test('content integrity: allocs sum to 1, ids resolve', () => {
  const archetypeIds = new Set(whys.archetypes.map((a) => a.id));
  const motivationIds = new Set(whys.motivations.map((m) => m.id));

  for (const day of campaign.days) {
    for (const c of day.choices) {
      if (c.alloc) {
        const sum = (c.alloc.nvda || 0) + (c.alloc.etf || 0) + (c.alloc.cash || 0);
        assert.ok(Math.abs(sum - 1) < 1e-9, `${c.id} alloc sums to ${sum}`);
      }
      assert.ok(archetypeIds.has(c.archetype), `${c.id} has unknown archetype ${c.archetype}`);
    }
    // every day's whyContext must exist as a context
    const ctx = whys.contexts.find((x) => x.context === day.whyContext);
    assert.ok(ctx, `day ${day.id} whyContext ${day.whyContext} missing`);
    for (const o of ctx.options) {
      assert.ok(motivationIds.has(o.motivationId), `unknown motivation ${o.motivationId}`);
    }
  }
});
