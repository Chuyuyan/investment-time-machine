// Investor DNA — pure functions, no imports.
// On each "why" tap we ADD the motivation's 7-trait fingerprint to a running
// vector (the raw instrument data, faithfully summed per whys.json._readme).
// To CLASSIFY into an archetype we average that sum by the tap count first, so
// the vector sits on the same -2..+2 scale as the archetype prototypes and the
// Euclidean distance is meaningful.

export const TRAIT_IDS = [
  'fomo', 'discipline', 'patience', 'conviction', 'research', 'riskAwareness', 'calibration',
];

export function emptyVector() {
  const v = {};
  for (const t of TRAIT_IDS) v[t] = 0;
  return v;
}

// Add a motivation's traits to the running vector. Returns a NEW vector.
export function accumulate(vector, traits) {
  const v = { ...vector };
  for (const t of TRAIT_IDS) v[t] = (v[t] || 0) + (traits[t] || 0);
  return v;
}

function distance(a, b) {
  let s = 0;
  for (const t of TRAIT_IDS) {
    const d = (a[t] || 0) - (b[t] || 0);
    s += d * d;
  }
  return Math.sqrt(s);
}

// Average the summed vector by `count`, then find the nearest archetype prototype.
// Returns { archetype, distance, averaged }.
export function nearestArchetype(vector, count, archetypes) {
  const n = count || 1;
  const averaged = {};
  for (const t of TRAIT_IDS) averaged[t] = (vector[t] || 0) / n;

  let best = null;
  let bestDist = Infinity;
  for (const arch of archetypes) {
    const d = distance(averaged, arch.prototype);
    if (d < bestDist) {
      bestDist = d;
      best = arch;
    }
  }
  return { archetype: best, distance: bestDist, averaged };
}
