// Decision Quality scoring — pure functions, no imports.
// MVP scoring is a hardcoded lookup (each choice carries a `dq` 0-100 in
// campaign.json). DQ is the average of the chosen choices' dq values.
//
// QA INVARIANT (design plan §5.3): DQ must show ~zero correlation with in-game
// P&L. If high DQ tracks high return, there is an outcome-bias leak. See the
// engine test that asserts the disciplined (high-DQ) path makes LESS money than
// the reckless (low-DQ) path in this campaign.

export function dqAverage(choices) {
  if (!choices.length) return 0;
  const sum = choices.reduce((s, c) => s + (c.dq || 0), 0);
  return sum / choices.length;
}

// Risk bucket from average DQ (campaign.engine.riskBucketByDqAvg).
export function riskBucket(dqAvg) {
  if (dqAvg >= 75) return 'disciplined';
  if (dqAvg <= 45) return 'reckless';
  return 'balanced';
}

// Verdict: the 2x2 of (good outcome?) x (good process?).
//   thresholds = campaign.engine.thresholds { returnHigh, dqHigh }
export function verdict(returnPct, dqAvg, thresholds) {
  const highReturn = returnPct >= thresholds.returnHigh;
  const highDq = dqAvg >= thresholds.dqHigh;
  if (highReturn && highDq) return 'skilled';
  if (highReturn && !highDq) return 'lucky_not_good';
  if (!highReturn && highDq) return 'unlucky_sound';
  return 'poor';
}
