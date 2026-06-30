// Tiny formatting helpers shared across components.

// "13,516" — no currency symbol (templates that need "$" supply it themselves).
export function num(n) {
  return Math.round(n).toLocaleString('en-US');
}

// "$13,516"
export function money(n) {
  return '$' + num(n);
}

// "+35.2%" / "-11.0%"
export function pct(n) {
  return (n >= 0 ? '+' : '') + (n * 100).toFixed(1) + '%';
}

// Replace {key} tokens in a template string from a vars object.
export function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
}
