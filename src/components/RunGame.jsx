import React, { useState, useRef, useEffect } from 'react';

/*
 * RunGame — "Investment FTL": the Portfolio as a Decision Generator  (?proto=run)
 * ------------------------------------------------------------------------------
 * The point of this prototype is ONE thing: does the portfolio keep PUSHING you
 * to decide, so you always want to make "one more decision"? Not a quiz, not a
 * slideshow of rebalance moments — a stream of tradeoffs the portfolio itself
 * generates. Four generators:
 *   1) New opportunity      — a company shows up; buy? pass? (funded how?)
 *   2) Holding pressure     — a position grew too big, or is deep in the red
 *   3) Storm                — a crash tests the WHOLE book at once
 *   4) Life event           — cash is demanded; raise it by selling what?
 * Real named companies, real (approximate) history. Replay variance comes from
 * random run-modifiers + random life event + shuffled opportunities — not from
 * hiding anything. Deliberately lean UI: this tests the ENGINE, not the skin.
 */

const START = 10000;
const RENT = 1500;
const FREEDOM = { emoji: '🏠', label: 'a place of your own', goal: 40000 };

const COMPANIES = [
  { id: 'AAPL', name: 'Apple', sector: 'the iPhone maker' },
  { id: 'MSFT', name: 'Microsoft', sector: 'software & cloud' },
  { id: 'TSLA', name: 'Tesla', sector: 'electric cars' },
  { id: 'ZM', name: 'Zoom', sector: 'video calls' },
  { id: 'DAL', name: 'Delta', sector: 'an airline' },
  { id: 'MRNA', name: 'Moderna', sector: 'a small biotech' },
  { id: 'PTON', name: 'Peloton', sector: 'home fitness bikes' },
];

const COLORS = { AAPL: '#3f6fb0', MSFT: '#3f8f5a', TSLA: '#c9962f', ZM: '#8a5cc0', DAL: '#b23a34', MRNA: '#2b9c8f', PTON: '#d0678f', CASH: '#8a7a5c' };

// Real, approximate, split-adjusted paths. null = not yet public / investable.
const TICKS = [
  { date: 'Jan 2019', mood: 'calm', prices: { AAPL: 42, MSFT: 104, TSLA: 62, ZM: null, DAL: 50, MRNA: 16, PTON: null } },
  { date: 'Jan 2020', mood: 'calm', prices: { AAPL: 78, MSFT: 170, TSLA: 130, ZM: 76, DAL: 59, MRNA: 19, PTON: 31 } },
  { date: 'Mar 2020', mood: 'storm', storm: true, prices: { AAPL: 57, MSFT: 135, TSLA: 100, ZM: 155, DAL: 23, MRNA: 28, PTON: 27 } },
  { date: 'Sep 2020', mood: 'boom', prices: { AAPL: 116, MSFT: 210, TSLA: 430, ZM: 470, DAL: 31, MRNA: 67, PTON: 100 } },
  { date: 'Feb 2021', mood: 'boom', prices: { AAPL: 121, MSFT: 233, TSLA: 700, ZM: 400, DAL: 46, MRNA: 150, PTON: 145 } },
  { date: 'Dec 2021', mood: 'calm', prices: { AAPL: 178, MSFT: 336, TSLA: 1060, ZM: 185, DAL: 39, MRNA: 255, PTON: 36 } },
];
const LAST = TICKS.length - 1;

// Terse, real, per-tick note: valuation + one situation line.
const NOTE = {
  AAPL: [['fair', 'Cheap-ish; fears over slowing iPhone sales in China.'], ['fair', 'Nearly doubled; services booming.'], ['fair', 'On sale in the crash; stores shut but cash-rich.'], ['exp', 'Split 4-for-1; work-from-home device demand.'], ['exp', 'Record holiday quarter.'], ['exp', 'Still strong, still pricey.']],
  MSFT: [['fair', 'Steady cloud grower, quietly compounding.'], ['fair', 'Cloud keeps taking share from Amazon.'], ['fair', 'Crash-resistant; the world needs Teams & Azure.'], ['exp', 'Priced richly, but demand is real.'], ['exp', 'Cloud climbs again.'], ['exp', 'The boring winner.']],
  TSLA: [['exp', 'Barely profitable; the most bet-against stock in America.'], ['exp', 'First real profits; China factory opening.'], ['exp', 'Factories shut; is there enough cash?'], ['exp', 'Split its stock; S&P 500 mania building.'], ['exp', 'Worth more than most carmakers combined.'], ['exp', 'Peak hype — some call it a bubble.']],
  ZM: [null, ['exp', 'Hot IPO; sales doubling but barely profitable.'], ['exp', 'Lockdown darling; downloads explode.'], ['exp', 'Sales up 350%+; priced for perfection.'], ['exp', 'Growth cooling; vaccines are coming.'], ['exp', 'Fading fast as offices reopen.']],
  DAL: [['cheap', 'Cheap; airlines finally profitable.'], ['cheap', 'Strong travel bookings.'], ['cheap', 'Down ~60%; burning $60M a day; Buffett sells.'], ['cheap', 'Still bleeding; planes half-empty.'], ['fair', 'Vaccine reopening hope.'], ['fair', 'Profits still far below normal.']],
  MRNA: [['exp', 'Tiny biotech; no approved products yet.'], ['exp', 'Now working on a coronavirus vaccine.'], ['exp', 'In the vaccine race; huge hopes, unproven science.'], ['exp', 'Vaccine in final trials; stock soaring.'], ['exp', 'Vaccine authorized — real profits at last.'], ['exp', 'Boosters selling, but what comes after COVID?']],
  PTON: [null, ['exp', 'Just went public; premium bikes with a screen.'], ['exp', 'Gyms closed — demand is exploding.'], ['exp', "Can't build bikes fast enough."], ['exp', 'Priced as if everyone stays home forever.'], ['cheap', 'Gyms reopen; sales collapse; cheap now — trap or bargain?']],
};
const VAL = { cheap: 'Cheap', fair: 'Fair', exp: 'Expensive' };

const OPPS = [
  { id: 'ZM', tick: 1, hook: 'Zoom just went public — video calls for businesses.' },
  { id: 'PTON', tick: 1, hook: 'Peloton just went public — premium exercise bikes with a screen.' },
  { id: 'MRNA', tick: 2, hook: 'A tiny biotech, Moderna, is racing to make a COVID vaccine.' },
  { id: 'TSLA', tick: 3, hook: 'Tesla is joining the S&P 500 — the hype is deafening.' },
  { id: 'MRNA', tick: 3, hook: "Moderna's vaccine has entered final trials." },
];
const LIFE_POOL = [
  { amount: 6000, title: 'Your car just died', body: 'You need $6,000 for a replacement or you lose your way to work.' },
  { amount: 4500, title: 'A medical bill arrives', body: 'An unexpected $4,500 is due now — it will not wait.' },
  { amount: 3000, title: 'Rent is due and you are short', body: 'You need $3,000 in cash this month.' },
];
const MODS = [
  { id: 'steady', label: 'Steady start', desc: 'You begin with $10,000 in cash. Nothing fancy.' },
  { id: 'inherit', label: 'An inheritance', desc: 'A relative left you $5,000 of Apple stock. You also have $5,000 cash.' },
  { id: 'cap', label: 'Keep it simple', desc: 'You will only ever hold up to 4 companies at once. Focus is forced.' },
  { id: 'debt', label: 'Carrying a loan', desc: 'You start with $10,000 but a $4,000 student loan comes due in early 2020.' },
];

const LESSONS = {
  AAPL: 'Apple dipped in the crash then compounded from ~$42 to ~$178. Rarely thrilling, rarely a disaster.',
  MSFT: 'Microsoft went ~$104 to ~$336 with almost no drama — the quiet compounder.',
  TSLA: 'Tesla ran ~$62 to over $1,000 (~17x). Size it big and you got rich; size it too big and one bad month could have ruined you. The difference was position size, not prediction.',
  ZM: 'Zoom looked unstoppable in 2020 — and was the most dangerous buy at the top, falling from ~$470 to ~$185.',
  DAL: 'Delta looked cheap down ~60%, but a low price is not a safe price — it recovered slowly and stalled.',
  MRNA: 'Moderna went from a ~$16 unknown to over $250 on the vaccine — a real moonshot, but a binary bet: if the science had failed it could have gone near zero.',
  PTON: 'Peloton rocketed while gyms were shut, then collapsed from ~$145 to ~$36 as they reopened. Another "this trend lasts forever" trap.',
};

/* ---------- helpers ---------- */
const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
function sPct(x) { const v = x * 100; return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(Math.abs(v) < 10 ? 1 : 0) + '%'; }
const cls = (x) => (x > 0.0005 ? 'up' : x < -0.0005 ? 'down' : 'flat');
const sizeLife = (a) => { const r = a / RENT; return r >= 1 ? `${r >= 10 ? Math.round(r) : r.toFixed(1)} months of rent` : `${Math.max(1, Math.round(a / (RENT / 4)))} weeks of rent`; };
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function useCountUp(target, dur = 600) {
  const [val, setVal] = useState(target);
  const from = useRef(target); const raf = useRef();
  useEffect(() => {
    const start = performance.now(); const a = from.current; cancelAnimationFrame(raf.current);
    const tick = (now) => { const t = Math.min(1, (now - start) / dur); setVal(a + (target - a) * (1 - Math.pow(1 - t, 3))); if (t < 1) raf.current = requestAnimationFrame(tick); else from.current = target; };
    raf.current = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf.current);
  }, [target]); return val;
}

/* ---------- component ---------- */
export default function RunGame() {
  const [phase, setPhase] = useState('intro'); // intro | run | reflect
  const [tick, setTick] = useState(0);
  const [port, setPort] = useState({ shares: {}, avg: {}, cash: START });
  const [events, setEvents] = useState([]);   // event queue for current tick
  const [evIdx, setEvIdx] = useState(0);
  const [mod, setMod] = useState(MODS[0]);
  const [log, setLog] = useState([]);         // per-tick portfolio snapshots (for reflect)
  const run = useRef({ decisions: 0, offered: new Set(), lifeTick: 3, life: LIFE_POOL[0], debtDone: false, stormNet: 0 });

  const prices = TICKS[tick].prices;
  const sharesOf = (id) => port.shares[id] || 0;
  const holdingsValue = COMPANIES.reduce((s, c) => s + sharesOf(c.id) * (prices[c.id] || 0), 0);
  const V = holdingsValue + port.cash;
  const chunk = Math.max(500, Math.round((V * 0.1) / 100) * 100);
  const shownV = useCountUp(V);
  const heldCount = COMPANIES.filter((c) => sharesOf(c.id) * (prices[c.id] || 0) > 0.5).length;

  /* --- trades (functional, atomic) --- */
  function doBuy(id, amount) {
    const p = prices[id]; if (!p) return;
    setPort((pr) => {
      const cash = pr.cash; const a = Math.min(amount, cash); if (a < 1) return pr;
      const cur = pr.shares[id] || 0; const ns = cur + a / p;
      const na = ns > 0 ? ((cur * (pr.avg[id] || 0)) + a) / ns : 0;
      return { shares: { ...pr.shares, [id]: ns }, avg: { ...pr.avg, [id]: na }, cash: cash - a };
    });
  }
  function doSell(id, amount) { // amount in dollars; Infinity = all
    const p = prices[id]; if (!p) return;
    setPort((pr) => {
      const cur = pr.shares[id] || 0; const posv = cur * p; if (posv <= 0) return pr;
      const a = Math.min(amount, posv); let ns = cur - a / p; if (ns < 1e-6) ns = 0;
      return { shares: { ...pr.shares, [id]: ns }, avg: ns === 0 ? { ...pr.avg, [id]: 0 } : pr.avg, cash: pr.cash + a };
    });
  }
  const canBuyNew = (id) => sharesOf(id) > 0 || !(mod.id === 'cap' && heldCount >= 4);
  function buyChunk(id) { if (canBuyNew(id)) { run.current.decisions++; doBuy(id, chunk); } }
  function sellChunk(id) { run.current.decisions++; doSell(id, chunk); }
  function sellAll(id) { run.current.decisions++; doSell(id, Infinity); }

  /* --- event generation on advance --- */
  function buildEvents(nt, p, pr) {
    const evs = [];
    const val = COMPANIES.reduce((s, c) => s + (pr.shares[c.id] || 0) * (p[c.id] || 0), 0) + pr.cash;
    if (TICKS[nt].storm) evs.push({ type: 'storm' });
    // life event (scheduled) or debt
    if (nt === run.current.lifeTick) evs.push({ type: 'life', ...run.current.life });
    if (mod.id === 'debt' && !run.current.debtDone && nt >= 1) { run.current.debtDone = true; evs.push({ type: 'life', amount: 4000, title: 'Your student loan is due', body: 'The $4,000 you borrowed must be repaid now.' }); }
    // holding pressure: at most one (biggest concentration, else worst drawdown)
    let conc = null, draw = null;
    COMPANIES.forEach((c) => {
      const pv = (pr.shares[c.id] || 0) * (p[c.id] || 0); if (pv <= 0.5) return;
      const w = pv / val; const g = (pr.avg[c.id] || 0) > 0 ? p[c.id] / pr.avg[c.id] - 1 : 0;
      if (w > 0.35 && (!conc || w > conc.w)) conc = { id: c.id, w };
      if (g < -0.25 && (!draw || g < draw.g)) draw = { id: c.id, g };
    });
    if (conc) evs.push({ type: 'hold', kind: 'conc', id: conc.id, w: conc.w });
    else if (draw) evs.push({ type: 'hold', kind: 'draw', id: draw.id, g: draw.g });
    // opportunity: at most one (shuffled among this tick's, not yet offered)
    const cands = OPPS.filter((o) => o.tick === nt && p[o.id] && !run.current.offered.has(o.tick + o.id) && (pr.shares[o.id] || 0) < 1e-6);
    if (cands.length) { const o = pick(cands); run.current.offered.add(o.tick + o.id); evs.push({ type: 'opp', id: o.id, hook: o.hook }); }
    return evs;
  }

  function advance() {
    // snapshot current tick for reflection
    const alloc = {}; COMPANIES.forEach((c) => { alloc[c.id] = V > 0 ? sharesOf(c.id) * (prices[c.id] || 0) / V : 0; });
    const nextLog = [...log, { tick, date: TICKS[tick].date, V, alloc, storm: !!TICKS[tick].storm }];
    if (tick >= LAST - 1) {
      const fp = TICKS[LAST].prices;
      const fV = COMPANIES.reduce((s, c) => s + sharesOf(c.id) * (fp[c.id] || 0), 0) + port.cash;
      const fAlloc = {}; COMPANIES.forEach((c) => { fAlloc[c.id] = fV > 0 ? sharesOf(c.id) * (fp[c.id] || 0) / fV : 0; });
      nextLog.push({ tick: LAST, date: TICKS[LAST].date, V: fV, alloc: fAlloc, final: true });
      setLog(nextLog); setTick(LAST); setPhase('reflect'); window.scrollTo({ top: 0 }); return;
    }
    const nt = tick + 1;
    const evs = buildEvents(nt, TICKS[nt].prices, port);
    setLog(nextLog); setTick(nt); setEvents(evs); setEvIdx(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const closeEvent = () => { run.current.decisions++; setEvIdx((i) => i + 1); };

  /* --- start / reset --- */
  function begin(m) {
    const shares = {}, avg = {};
    if (m.id === 'inherit') { const p0 = TICKS[0].prices.AAPL; shares.AAPL = 5000 / p0; avg.AAPL = p0; }
    const cash = m.id === 'inherit' ? 5000 : START;
    run.current = { decisions: 0, offered: new Set(), lifeTick: pick([2, 3, 4]), life: pick(LIFE_POOL), debtDone: false, stormNet: 0 };
    setPort({ shares, avg, cash }); setMod(m); setLog([]); setEvents([]); setEvIdx(0); setTick(0); setPhase('run');
  }
  function restart() { setPhase('intro'); setMod(MODS[Math.floor(Math.random() * MODS.length)]); }

  /* ---------- INTRO ---------- */
  if (phase === 'intro') {
    const offered = mod;
    return (
      <div className="rn rn-calm">
        <div className="rn-col rn-introcol">
          <p className="rn-kick">Investment Time Machine · a run</p>
          <h1 className="rn-title">Build a portfolio.<br />Survive market history.</h1>
          <p className="rn-lead">You start in <b>January 2019</b> with <b>$10,000</b>. Real companies, real prices, through the end of 2021. The market — and your own holdings — will keep handing you decisions. There's no quiz. There's just: <b>what do you do with your money next?</b></p>
          <div className="rn-modcard">
            <span className="rn-modtag">This run</span>
            <b>{offered.label}</b>
            <p>{offered.desc}</p>
          </div>
          <p className="rn-fine">Every run deals a different hand — a different twist, a different life event. Same history, new puzzle.</p>
          <button className="rn-btn rn-primary" onClick={() => begin(offered)}>Start this run →</button>
          <button className="rn-btn rn-ghost" onClick={() => setMod(pick(MODS.filter((x) => x.id !== mod.id)))}>Deal a different hand</button>
        </div>
      </div>
    );
  }

  /* ---------- REFLECT ---------- */
  if (phase === 'reflect') {
    const finalV = V; const ret = finalV / START - 1; const dreamPct = Math.min(1, finalV / FREEDOM.goal);
    let big = { id: null, w: 0 }; log.forEach((h) => Object.entries(h.alloc).forEach(([id, w]) => { if (w > big.w) big = { id, w }; }));
    const bigName = big.id ? COMPANIES.find((c) => c.id === big.id).name : null;
    const end = COMPANIES.map((c) => ({ id: c.id, name: c.name, value: sharesOf(c.id) * prices[c.id], weight: sharesOf(c.id) * prices[c.id] / finalV, gain: (port.avg[c.id] || 0) > 0 ? prices[c.id] / port.avg[c.id] - 1 : 0 })).filter((h) => h.value > 0.5).sort((a, b) => b.value - a.value);
    const touched = COMPANIES.filter((c) => end.some((e) => e.id === c.id) || (port.avg[c.id] || 0) > 0);
    const lessons = (touched.length ? touched : COMPANIES).map((c) => c.id);
    return (
      <div className="rn rn-calm">
        <div className="rn-col">
          <p className="rn-kick">December 2021 — the run ends</p>
          <div className="rn-final">
            <span className="rn-final-lbl">Your $10,000 became</span>
            <span className={'rn-final-num ' + cls(ret)}>{fmt(finalV)}</span>
            <span className={'rn-final-ret ' + cls(ret)}>{sPct(ret)}</span>
          </div>
          <div className="rn-dream">
            <span className="rn-dream-emoji">{FREEDOM.emoji}</span>
            <div className="rn-dream-body"><div className="rn-bar"><div className="rn-bar-fill" style={{ width: (dreamPct * 100) + '%' }} /></div>
              <span>{dreamPct >= 1 ? `You made it — ${FREEDOM.label} is within reach.` : `${Math.round(dreamPct * 100)}% of the way to ${FREEDOM.label}.`}</span></div>
          </div>
          <h2 className="rn-h2">How this run went</h2>
          <p className="rn-mir">You made <b>{run.current.decisions}</b> decisions across three years.</p>
          {bigName && <p className="rn-mir">Your biggest bet was <b>{bigName}</b> — up to <b>{Math.round(big.w * 100)}%</b> of everything you owned. {big.w >= 0.4 ? 'Concentration cuts both ways.' : 'You stayed fairly spread out.'}</p>}
          <p className="rn-mir">Your run began with <b>{mod.label.toLowerCase()}</b>. A different hand next time.</p>
          <h2 className="rn-h2">Where you ended up</h2>
          {end.map((h) => <div className="rn-row" key={h.id}><span className="rn-dot" style={{ background: COLORS[h.id] }} /><span className="rn-rn">{h.name}</span><span className="rn-rv">{fmt(h.value)} · {Math.round(h.weight * 100)}%</span><span className={'rn-rg ' + cls(h.gain)}>{sPct(h.gain)}</span></div>)}
          <div className="rn-row"><span className="rn-dot" style={{ background: COLORS.CASH }} /><span className="rn-rn">Cash</span><span className="rn-rv">{fmt(port.cash)} · {Math.round(port.cash / finalV * 100)}%</span><span className="rn-rg flat">—</span></div>
          <h2 className="rn-h2">What actually happened</h2>
          {lessons.map((id) => <p className="rn-lesson" key={id}><b style={{ color: COLORS[id] }}>{COMPANIES.find((c) => c.id === id).name}.</b> {LESSONS[id]}</p>)}
          <div className="rn-bridge"><p><b>Every company, price and event is real</b> (prices approximate, split-adjusted). You can verify all of it — SEC EDGAR, Yahoo Finance, Macrotrends, company investor pages. The winners weren't found by predicting the future; they came from how you sized risk and what you did under pressure.</p></div>
          <button className="rn-btn rn-primary" onClick={restart}>New run →</button>
        </div>
      </div>
    );
  }

  /* ---------- RUN ---------- */
  const ev = evIdx < events.length ? events[evIdx] : null;
  const T = TICKS[tick];
  const prevV = log.length ? log[log.length - 1].V : null;
  const move = prevV ? V / prevV - 1 : null;
  const dreamPct = Math.min(1, V / FREEDOM.goal);

  // small helpers for rendering a company line
  const info = (id) => NOTE[id][tick];
  const compLine = (id) => {
    const p = prices[id]; const n = info(id);
    const prev = tick > 0 ? TICKS[tick - 1].prices[id] : null;
    const mv = p && prev ? p / prev - 1 : null;
    const pv = sharesOf(id) * (p || 0); const w = V > 0 ? pv / V : 0;
    const g = sharesOf(id) > 0 && (port.avg[id] || 0) > 0 ? p / port.avg[id] - 1 : 0;
    return { p, n, mv, pv, w, g };
  };

  return (
    <div className={'rn rn-' + T.mood}>
      <div className="rn-col">
        {/* status bar */}
        <div className="rn-status">
          <div className="rn-status-l">
            <span className="rn-date">{T.date}</span>
            <div className="rn-time">{TICKS.map((t, i) => <span key={i} className={'rn-tk ' + (i === tick ? 'now' : i < tick ? 'past' : '') + (t.storm ? ' storm' : '')} />)}</div>
          </div>
          <div className="rn-status-r">
            <span className="rn-worth">{fmt(shownV)}</span>
            <span className="rn-dreammini">{FREEDOM.emoji} {Math.round(dreamPct * 100)}%</span>
          </div>
        </div>

        {move != null && !ev && (
          <div className={'rn-move ' + cls(move)}>Since {TICKS[tick - 1].date}: {fmt(prevV)} → <b>{fmt(V)}</b> ({sPct(move)})</div>
        )}

        {/* ============ EVENT MODE ============ */}
        {ev ? (
          <div className="rn-eventwrap">
            <span className="rn-ev-of">Decision {evIdx + 1} of {events.length}</span>

            {ev.type === 'storm' && (
              <div className="rn-event rn-ev-storm">
                <span className="rn-ev-kind">⚡ Storm — the whole market</span>
                <h2 className="rn-ev-title">The crash of March 2020</h2>
                <p className="rn-ev-body">In weeks the market has fallen faster than at any time in history. Your book is worth <b>{fmt(V)}</b>{move != null && <> — <b className="down">{sPct(move)}</b></>}. No one knows how much worse it gets. This tests everything you hold at once.</p>
                <div className="rn-choices">
                  <button className="rn-choice" onClick={() => { COMPANIES.forEach((c) => doSell(c.id, sharesOf(c.id) * (prices[c.id] || 0) * 0.5)); run.current.stormNet -= 1; closeEvent(); }}><b>Sell to safety</b><span>Cash out half of everything. Sleep at night, miss the rebound.</span></button>
                  <button className="rn-choice" onClick={() => { run.current.stormNet += 0; closeEvent(); }}><b>Hold the line</b><span>Touch nothing. Ride it down and hope it comes back.</span></button>
                  <button className="rn-choice" onClick={() => { run.current.stormNet += 1; closeEvent(); }}><b>Go bargain hunting</b><span>Keep your cash ready — everything is on sale below.</span></button>
                </div>
              </div>
            )}

            {ev.type === 'life' && (() => { const canPay = port.cash >= ev.amount; return (
              <div className="rn-event rn-ev-life">
                <span className="rn-ev-kind">🧾 Life — this won't wait</span>
                <h2 className="rn-ev-title">{ev.title}</h2>
                <p className="rn-ev-body">{ev.body} That's <b>{fmt(ev.amount)}</b> — about {sizeLife(ev.amount)}. You have <b className={canPay ? 'up' : 'down'}>{fmt(port.cash)}</b> in cash.</p>
                {!canPay && (
                  <div className="rn-raise">
                    <p className="rn-raise-h">Not enough cash. Sell something to cover it:</p>
                    {COMPANIES.filter((c) => sharesOf(c.id) * (prices[c.id] || 0) > 0.5).map((c) => { const L = compLine(c.id); return (
                      <div className="rn-raise-row" key={c.id}><span className="rn-dot" style={{ background: COLORS[c.id] }} /><span className="rn-raise-n">{c.name} {fmt(L.pv)} <em className={cls(L.g)}>{sPct(L.g)}</em></span>
                        <button className="rn-mini" onClick={() => doSell(c.id, chunk)}>Sell {fmt(Math.min(chunk, L.pv))}</button>
                        <button className="rn-mini" onClick={() => doSell(c.id, Infinity)}>All</button></div>); })}
                  </div>
                )}
                <div className="rn-choices">
                  <button className="rn-choice" disabled={!canPay} onClick={() => { setPort((pr) => ({ ...pr, cash: pr.cash - ev.amount })); closeEvent(); }}><b>{canPay ? `Pay ${fmt(ev.amount)}` : 'Sell above to pay'}</b><span>{canPay ? 'Money leaves the desk. Life goes on.' : 'Raise the cash first.'}</span></button>
                </div>
              </div>
            ); })()}

            {ev.type === 'hold' && (() => { const L = compLine(ev.id); const c = COMPANIES.find((x) => x.id === ev.id); return (
              <div className="rn-event rn-ev-hold">
                <span className="rn-ev-kind">📊 Your portfolio is pushing</span>
                {ev.kind === 'conc' ? <>
                  <h2 className="rn-ev-title">{c.name} is now {Math.round(ev.w * 100)}% of everything you own</h2>
                  <p className="rn-ev-body">One winner has grown into a giant slice of your net worth. It's {fmt(L.pv)}, up {sPct(L.g)} for you. Great — until one bad month erases it. Do you lock some in, or let it ride?</p>
                  <div className="rn-choices">
                    <button className="rn-choice" onClick={() => { const target = V * 0.25; doSell(ev.id, Math.max(0, L.pv - target)); closeEvent(); }}><b>Trim to ~25%</b><span>Take some off the table, keep most of the upside.</span></button>
                    <button className="rn-choice" onClick={closeEvent}><b>Let it ride</b><span>Conviction over caution. Live and die by it.</span></button>
                  </div>
                </> : <>
                  <h2 className="rn-ev-title">{c.name} is down {sPct(L.g)} since you bought</h2>
                  <p className="rn-ev-body">Your {fmt(L.pv)} in {c.name} is deep in the red. {info(ev.id) ? info(ev.id)[1] : ''} Cut the loss, hold, or buy more at a lower price?</p>
                  <div className="rn-choices">
                    <button className="rn-choice" onClick={() => { sellAll(ev.id); setEvIdx((i) => i + 1); }}><b>Cut it</b><span>Take the loss, free the cash, move on.</span></button>
                    <button className="rn-choice" onClick={closeEvent}><b>Hold</b><span>Your reasons haven't changed. Wait it out.</span></button>
                    <button className="rn-choice" disabled={port.cash < 1} onClick={() => { doBuy(ev.id, chunk); setEvIdx((i) => i + 1); }}><b>Buy more ({fmt(Math.min(chunk, port.cash))})</b><span>Double down if you still believe — or catch a falling knife.</span></button>
                  </div>
                </>}
              </div>
            ); })()}

            {ev.type === 'opp' && (() => { const L = compLine(ev.id); const c = COMPANIES.find((x) => x.id === ev.id); const canFund = port.cash >= 1 && canBuyNew(ev.id); return (
              <div className="rn-event rn-ev-opp">
                <span className="rn-ev-kind">✨ A new opportunity</span>
                <h2 className="rn-ev-title">{c.name} — {c.sector}</h2>
                <p className="rn-ev-body">{ev.hook} Trading at <b>${L.p}</b>. <span className={'rn-val v-' + info(ev.id)[0]}>{VAL[info(ev.id)[0]]}</span> — {info(ev.id)[1]} You have {fmt(port.cash)} cash.</p>
                <div className="rn-choices">
                  <button className="rn-choice" disabled={!canFund} onClick={() => { doBuy(ev.id, chunk); setEvIdx((i) => i + 1); }}><b>{mod.id === 'cap' && !canBuyNew(ev.id) ? 'No room (4 max)' : port.cash < 1 ? 'No cash' : `Buy ${fmt(Math.min(chunk, port.cash))}`}</b><span>Take a starting position.</span></button>
                  <button className="rn-choice" onClick={closeEvent}><b>Pass</b><span>Not every opportunity is yours to take.</span></button>
                </div>
              </div>
            ); })()}

            <button className="rn-skip" onClick={closeEvent}>Skip / decide later →</button>
          </div>
        ) : (
          /* ============ OVERVIEW MODE ============ */
          <>
            {tick === 0 && (
              <div className="rn-hint">
                <p><b>Your desk is open.</b> Below is the market. Tap <b>Buy</b> on what you believe in — your cash is limited, so every buy means giving something else up. When you're ready, <b>advance time</b> and the market (and your holdings) will start handing you decisions.</p>
              </div>
            )}
            <div className="rn-holdbar">
              <div className="rn-hb-top"><span className="rn-lbl">Cash</span><span className={'rn-cash ' + (port.cash > 1 ? 'has' : 'none')}>{fmt(port.cash)}</span><span className="rn-cash-life">≈ {sizeLife(port.cash)}</span></div>
              <div className="rn-shape">{COMPANIES.map((c) => { const w = V > 0 ? sharesOf(c.id) * (prices[c.id] || 0) / V : 0; return w > 0.001 ? <div key={c.id} className="rn-seg" style={{ width: w * 100 + '%', background: COLORS[c.id] }} /> : null; })}<div className="rn-seg" style={{ width: (V > 0 ? port.cash / V : 0) * 100 + '%', background: COLORS.CASH }} /></div>
            </div>

            <p className="rn-section">The market</p>
            {COMPANIES.map((c) => { const L = compLine(c.id); if (!L.p) return (
              <div className="rn-card locked" key={c.id}><div className="rn-card-top"><span className="rn-co"><span className="rn-dot" style={{ background: COLORS[c.id] }} />{c.name}</span><span className="rn-na">not public yet</span></div></div>);
              const owned = L.pv > 0.5;
              return (
                <div className={'rn-card' + (owned ? ' owned' : '')} key={c.id}>
                  <div className="rn-card-top">
                    <span className="rn-co"><span className="rn-dot" style={{ background: COLORS[c.id] }} />{c.name}</span>
                    <span className="rn-pb"><span className="rn-price">${L.p}</span>{L.mv != null && <span className={'rn-mv ' + cls(L.mv)}>{sPct(L.mv)}</span>}</span>
                  </div>
                  <div className="rn-card-mid"><span className={'rn-val v-' + L.n[0]}>{VAL[L.n[0]]}</span><span className="rn-note">{L.n[1]}</span></div>
                  {owned && <div className="rn-card-own">you own {fmt(L.pv)} · {Math.round(L.w * 100)}% <em className={cls(L.g)}>{sPct(L.g)}</em></div>}
                  <div className="rn-card-btns">
                    <button className="rn-mini" disabled={!owned} onClick={() => sellChunk(c.id)}>Sell {fmt(chunk)}</button>
                    <button className="rn-mini" disabled={!owned} onClick={() => sellAll(c.id)}>All</button>
                    <button className="rn-mini buy" disabled={port.cash < 1 || !canBuyNew(c.id)} onClick={() => buyChunk(c.id)}>{!canBuyNew(c.id) ? '4 max' : `Buy ${fmt(Math.min(chunk, port.cash))}`}</button>
                  </div>
                </div>
              );
            })}

            <button className="rn-btn rn-primary rn-advance" onClick={advance}>{T.storm ? 'Move on from the crash →' : tick === LAST - 1 ? 'Play the final months →' : 'Advance time →'}</button>
            <p className="rn-advsub">Jump to {tick < LAST ? TICKS[tick + 1].date : 'the end'} — the market moves, and new decisions arrive.</p>
          </>
        )}
      </div>
    </div>
  );
}
