// Render-safety coverage: walk EVERY possible playthrough and assert that every
// value the Autopsy indexes into actually resolves. The Autopsy does lookups
// like campaign.counterfactuals[riskBucket], campaign.verdicts[verdict],
// familiesById[motivation.family].biasLine, and nearestArchetype(...). If any
// path could produce a key that misses, the Autopsy would crash at runtime.
// This proves it can't — across all 4x4x4 choice paths and every why option.

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

const motivationById = (id) => whys.motivations.find((m) => m.id === id);
const familyById = (id) => whys.families.find((f) => f.id === id);

test('all 64 choice paths resolve a valid risk bucket + verdict', () => {
  const [d1, d2, d3] = campaign.days;
  let count = 0;
  for (const c1 of d1.choices) {
    for (const c2 of d2.choices) {
      for (const c3 of d3.choices) {
        const choices = [c1, c2, c3];
        const { returnPct, finalValue } = runCampaign(choices, campaign.engine, campaign.meta.startCash);
        assert.ok(Number.isFinite(finalValue), `non-finite finalValue for ${c1.id}/${c2.id}/${c3.id}`);

        const dq = dqAverage(choices);
        const bucket = riskBucket(dq);
        const vk = verdict(returnPct, dq, campaign.engine.thresholds);

        // The exact lookups the Autopsy performs:
        assert.ok(campaign.counterfactuals[bucket], `no counterfactuals for bucket ${bucket}`);
        assert.ok(campaign.counterfactuals[bucket].scenarios.length === 3, 'expected 3 scenarios');
        assert.ok(campaign.verdicts[vk], `no verdict copy for ${vk}`);
        count++;
      }
    }
  }
  assert.equal(count, 64);
});

test('every why option resolves a motivation, family + biasLine, and an archetype', () => {
  for (const ctx of whys.contexts) {
    for (const opt of ctx.options) {
      const m = motivationById(opt.motivationId);
      assert.ok(m, `context ${ctx.context}: missing motivation ${opt.motivationId}`);

      const fam = familyById(m.family);
      assert.ok(fam, `motivation ${m.id}: missing family ${m.family}`);
      assert.ok(fam.biasLine && fam.biasLine.length > 0, `family ${fam.id}: missing biasLine`);

      // A single tap must still classify to a real archetype.
      const v = accumulate(emptyVector(), m.traits);
      const { archetype } = nearestArchetype(v, 1, whys.archetypes);
      assert.ok(archetype && archetype.name, `motivation ${m.id}: no archetype`);
    }
  }
});

test('every day whyContext maps to a context with exactly 4 options', () => {
  for (const day of campaign.days) {
    const ctx = whys.contexts.find((c) => c.context === day.whyContext);
    assert.ok(ctx, `day ${day.id}: no context for ${day.whyContext}`);
    assert.equal(ctx.options.length, 4, `context ${ctx.context} should offer 4 options`);
  }
});
