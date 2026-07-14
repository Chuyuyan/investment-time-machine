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
// Per-tick research: valuation, the news line, and a plain-language financials snapshot.
const N = (val, news, num) => ({ val, news, num });
const NOTE = {
  AAPL: [N('fair', 'First sales warning in years, blaming weak China demand.', 'Very profitable; ~$245B cash; growth slowing.'), N('fair', 'Services & AirPods booming; iPhone stabilized.', 'Sales growing again; services a big profit engine.'), N('fair', 'Stores shut worldwide; supply chain disrupted.', 'Still very profitable; cash-rich enough to ride it out.'), N('exp', 'Split 4-for-1; record work-from-home device demand.', 'Device sales at records; profit up sharply.'), N('exp', 'Record holiday quarter — iPhone & services highs.', 'Best quarter ever.'), N('exp', 'Still growing; nothing broken.', 'Profits at all-time highs.')],
  MSFT: [N('fair', 'Azure cloud growing fast; boringly reliable.', 'Cloud growing ~50%/yr; very profitable.'), N('fair', 'Cloud keeps taking share from Amazon.', 'Azure still growing fast; steady profits.'), N('fair', 'World suddenly needs Teams, Office, Azure.', 'Cloud demand jumps as everyone works from home.'), N('exp', 'Cloud and Xbox surge as the world stays indoors.', 'Cloud + gaming surging; profits strong.'), N('exp', 'Cloud revenue up sharply again.', 'Double-digit growth continues.'), N('exp', 'The boring winner keeps winning.', 'Steady, strong profits.')],
  TSLA: [N('exp', 'Model 3 production hell; heavy debt; Musk chaos.', 'Revenue ~$21B but LOSES money; low on cash; heavy debt.'), N('exp', 'First profitable quarters; China factory opening.', 'Just turned its first back-to-back profits; thin margins.'), N('exp', 'Factories shut by lockdowns; cash a real worry.', 'Cash burn is the question if shutdowns drag on.'), N('exp', 'Joining the S&P 500; retail traders obsessed.', 'Now consistently profitable; deliveries climbing fast.'), N('exp', 'Worth more than most carmakers combined.', 'Record deliveries; profits real but tiny vs the price.'), N('exp', 'Peak hype; some call it a bubble.', 'Profitable and growing — but priced for perfection.')],
  ZM: [null, N('exp', 'Hot IPO; a niche business-video app.', 'Sales nearly doubled; barely profitable; small.'), N('exp', '"Zoom" becomes a verb; downloads explode.', 'Usage explodes ~20x; revenue about to spike.'), N('exp', 'Everyone works and schools from Zoom.', 'Revenue up 350%+; now very profitable.'), N('exp', 'Vaccines coming — will the Zooming last?', 'Still growing fast, but decelerating.'), N('exp', 'Fading fast as offices reopen.', 'Growth stalling; the boom is cooling.')],
  DAL: [N('cheap', 'Record travel; airlines finally profitable.', 'Solidly profitable; cheap vs earnings; carries debt.'), N('cheap', 'Strong bookings into 2020.', 'Steady profits; statistically cheap.'), N('cheap', 'Travel down ~95%; Buffett sells all airlines.', 'Revenue down ~90%; losing ~$60M/day; piling on debt.'), N('cheap', 'Planes still half-empty; survival mode.', 'Still deeply lossmaking; kept alive by debt.'), N('fair', 'Vaccine reopening hopes lift it.', 'Losses narrowing on reopening hopes.'), N('fair', 'Recovery real but slow.', 'Small profits again, far below pre-COVID.')],
  MRNA: [N('exp', 'Tiny biotech; no approved products.', 'No products yet; burns cash on research.'), N('exp', 'Now racing to make a COVID vaccine.', 'Still no revenue; all promise.'), N('exp', 'Vaccine hopes send the stock flying.', 'Pre-revenue; valued entirely on hope.'), N('exp', 'Vaccine enters final trials; contracts signed.', 'First big government contracts; trials underway.'), N('exp', 'Vaccine authorized — real money at last.', 'Suddenly billions in real revenue; now profitable.'), N('exp', 'Boosters selling; but what after COVID?', 'Very profitable now — almost all from COVID.')],
  PTON: [null, N('exp', "Just IPO'd; premium bikes with a screen.", 'Fast sales growth; still unprofitable.'), N('exp', 'Gyms closed — demand is exploding.', 'Demand explodes; sold out; briefly profitable.'), N('exp', "Can't build bikes fast enough.", "Sales soaring; supply can't keep up."), N('exp', 'Priced as if everyone stays home forever.', 'Growth huge but priced sky-high.'), N('cheap', 'Gyms reopen; sales collapse.', 'Sales collapsing; back to big losses.')],
};
const VAL = { cheap: 'Cheap', fair: 'Fair', exp: 'Expensive' };
const VAL_WHY = { cheap: 'Priced low versus what it earns — the market expects little.', fair: 'Priced roughly in line with what it earns.', exp: 'Priced high — a lot of optimism is already baked in.' };
// Per-company research that barely changes over time: the business, and the two sides of the bet.
const DEEP = {
  AAPL: { biz: 'Sells iPhones, Macs and a fast-growing services business (App Store, iCloud). Enormous and cash-rich.', bull: 'A brand people never leave, a huge cash pile, services compounding — it grinds higher for years.', bear: 'So big that fast growth is hard; if iPhone sales stall it goes nowhere. Priced for a smooth ride.' },
  MSFT: { biz: 'Windows, Office and the Azure cloud. Sells software to nearly every business on earth.', bull: 'Cloud is a giant, growing river of recurring revenue; leaving it is painful for customers.', bear: 'Already huge and richly priced — little room for error; cloud rivals are fierce.' },
  TSLA: { biz: 'Designs and builds electric cars, led by Elon Musk. Also chasing batteries and self-driving.', bull: 'If EVs take over and it keeps its lead, today\'s price could look cheap in ten years.', bear: 'Barely profitable, lots of debt, a wild valuation. One stumble in growth or cash and it could fall 70%+.' },
  ZM: { biz: 'Cloud software for video meetings, sold mostly to businesses.', bull: 'Best-in-class product; if remote work is permanent it grows into its price.', bear: 'Tiny and priced for perfection; Microsoft and Google can bundle video for free.' },
  DAL: { biz: 'A major airline carrying passengers and cargo worldwide.', bull: 'When travel is strong it throws off real cash, and the stock looks statistically cheap.', bear: 'Airlines are brutal — huge fixed costs, debt, and demand that vanishes in any crisis.' },
  MRNA: { biz: 'A biotech using mRNA to make vaccines and drugs. Few products — mostly promise.', bull: 'If mRNA works it could reinvent medicine — and a COVID vaccine would print money.', bear: 'A binary science bet: if trials fail there is little underneath. Losses today, no track record.' },
  PTON: { biz: 'Sells premium exercise bikes and treadmills with a subscription for live classes.', bull: 'A loyal, subscription-like community; if home fitness sticks, recurring revenue grows.', bear: 'Expensive hardware people buy once; when gyms reopen, demand can evaporate fast.' },
};

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
  const [expanded, setExpanded] = useState(null); // which company's dossier is open (overview)
  const [look, setLook] = useState(false);         // "look closer" toggled inside an event
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
    setExpanded(null); setLook(false);
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

  const closeEvent = () => { run.current.decisions++; setLook(false); setEvIdx((i) => i + 1); };

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
                  <p className="rn-ev-body">Your {fmt(L.pv)} in {c.name} is deep in the red. Where it stands now: {info(ev.id)?.news || ''} <em>{info(ev.id)?.num || ''}</em> Cut the loss, hold, or buy more at a lower price?</p>
                  <div className="rn-choices">
                    <button className="rn-choice" onClick={() => { sellAll(ev.id); setEvIdx((i) => i + 1); }}><b>Cut it</b><span>Take the loss, free the cash, move on.</span></button>
                    <button className="rn-choice" onClick={closeEvent}><b>Hold</b><span>Your reasons haven't changed. Wait it out.</span></button>
                    <button className="rn-choice" disabled={port.cash < 1} onClick={() => { doBuy(ev.id, chunk); setEvIdx((i) => i + 1); }}><b>Buy more ({fmt(Math.min(chunk, port.cash))})</b><span>Double down if you still believe — or catch a falling knife.</span></button>
                  </div>
                </>}
              </div>
            ); })()}

            {ev.type === 'opp' && (() => { const L = compLine(ev.id); const c = COMPANIES.find((x) => x.id === ev.id); const n = info(ev.id); const d = DEEP[ev.id]; const canFund = port.cash >= 1 && canBuyNew(ev.id); const amt = Math.min(Math.max(500, Math.round(V * 0.18 / 100) * 100), port.cash); return (
              <div className="rn-event rn-ev-opp">
                <span className="rn-ev-kind">✨ A new opportunity</span>
                <h2 className="rn-ev-title">{c.name} — {c.sector}</h2>
                <p className="rn-ev-body">{ev.hook} Trading at <b>${L.p}</b>. Before you decide — look into it:</p>
                <div className="rn-ev-facets">
                  <div className="rn-facet"><span className="rn-fk">Valuation</span><span className="rn-fv"><b className={'v-' + n.val}>{VAL[n.val]}.</b> {VAL_WHY[n.val]}</span></div>
                  <div className="rn-facet"><span className="rn-fk">The numbers</span><span className="rn-fv">{n.num}</span></div>
                  {look && <>
                    <div className="rn-facet"><span className="rn-fk">Business</span><span className="rn-fv">{d.biz}</span></div>
                    <div className="rn-facet"><span className="rn-fk">Bull case</span><span className="rn-fv rn-bull">{d.bull}</span></div>
                    <div className="rn-facet"><span className="rn-fk">Bear case</span><span className="rn-fv rn-bear">{d.bear}</span></div>
                  </>}
                </div>
                {!look && <button className="rn-look" onClick={() => setLook(true)}>Look closer — the bull &amp; bear case ▾</button>}
                <div className="rn-choices">
                  <button className="rn-choice" disabled={!canFund} onClick={() => { doBuy(ev.id, amt); closeEvent(); }}><b>{!canBuyNew(ev.id) ? 'No room (4 max)' : port.cash < 1 ? 'No cash — pass' : `Buy a position · ${fmt(amt)}`}</b><span>{canFund ? `${Math.round(V > 0 ? amt / V * 100 : 0)}% of your money — you can add more later.` : 'Free up cash first.'}</span></button>
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

            <p className="rn-section">The market — tap a company to research it</p>
            {COMPANIES.map((c) => { const L = compLine(c.id); if (!L.p) return (
              <div className="rn-card locked" key={c.id}><div className="rn-card-top"><span className="rn-co"><span className="rn-dot" style={{ background: COLORS[c.id] }} />{c.name}</span><span className="rn-na">not public yet</span></div></div>);
              const owned = L.pv > 0.5; const open = expanded === c.id; const d = DEEP[c.id]; const n = L.n;
              const tiers = [['Starter', 0.08], ['Position', 0.18], ['Conviction', 0.35]].map(([lbl, f]) => ({ lbl, amt: Math.min(Math.max(500, Math.round(V * f / 100) * 100), port.cash) }));
              return (
                <div className={'rn-card' + (owned ? ' owned' : '') + (open ? ' open' : '')} key={c.id}>
                  <button className="rn-card-head" onClick={() => setExpanded(open ? null : c.id)}>
                    <div className="rn-card-top">
                      <span className="rn-co"><span className="rn-dot" style={{ background: COLORS[c.id] }} />{c.name}</span>
                      <span className="rn-pb"><span className="rn-price">${L.p}</span>{L.mv != null && <span className={'rn-mv ' + cls(L.mv)}>{sPct(L.mv)}</span>}</span>
                    </div>
                    <div className="rn-card-mid"><span className={'rn-val v-' + n.val}>{VAL[n.val]}</span><span className="rn-note">{n.news}</span></div>
                    {owned && <div className="rn-card-own">you own {fmt(L.pv)} · {Math.round(L.w * 100)}% <em className={cls(L.g)}>{sPct(L.g)}</em></div>}
                    <span className="rn-research">{open ? 'Close ▲' : 'Research ▾'}</span>
                  </button>
                  {open && (
                    <div className="rn-dossier">
                      <div className="rn-facet"><span className="rn-fk">Business</span><span className="rn-fv">{d.biz}</span></div>
                      <div className="rn-facet"><span className="rn-fk">The numbers</span><span className="rn-fv">{n.num}</span></div>
                      <div className="rn-facet"><span className="rn-fk">Valuation</span><span className="rn-fv"><b className={'v-' + n.val}>{VAL[n.val]}.</b> {VAL_WHY[n.val]}</span></div>
                      <div className="rn-facet"><span className="rn-fk">Bull case</span><span className="rn-fv rn-bull">{d.bull}</span></div>
                      <div className="rn-facet"><span className="rn-fk">Bear case</span><span className="rn-fv rn-bear">{d.bear}</span></div>
                      <div className="rn-sizing">
                        <p className="rn-sizing-h">{owned ? 'Add more — how much conviction?' : 'Buy — how much conviction?'}</p>
                        <div className="rn-tiers">
                          {tiers.map((t) => <button key={t.lbl} className="rn-tier buy" disabled={t.amt < 1 || !canBuyNew(c.id)} onClick={() => { run.current.decisions++; doBuy(c.id, t.amt); }}><b>{t.lbl}</b><span>{t.amt < 1 ? '—' : fmt(t.amt) + ' · ' + Math.round(V > 0 ? t.amt / V * 100 : 0) + '% of your money'}</span></button>)}
                        </div>
                        {owned && <div className="rn-tiers"><button className="rn-tier" onClick={() => sellChunk(c.id)}>Trim {fmt(Math.min(chunk, L.pv))}</button><button className="rn-tier" onClick={() => sellAll(c.id)}>Sell all</button></div>}
                        <p className="rn-sizing-note">{!canBuyNew(c.id) ? 'You already hold 4 companies (this run caps you at 4). Sell one to make room.' : port.cash < 1 ? 'Out of cash — sell something to buy this.' : `You have ${fmt(port.cash)} cash. A Position here ≈ ${sizeLife(tiers[1].amt)}.`}</p>
                      </div>
                    </div>
                  )}
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
