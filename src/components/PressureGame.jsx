import React, { useState } from 'react';

/*
 * PressureGame — "Rent's Due"  (?proto=pressure)
 * ----------------------------------------------
 * Survival pressure + a real 2020–2022 market (crash, mania, bust, real losers)
 * + Cousin Sal, an animated character with a memory (karma).
 * Research gives you REAL, look-up-able facts (money / price / news) that update
 * every period — but it never tells you WHY a stock moved or what to do. You
 * connect the dots and size the bet yourself; the market still rolls the dice.
 */

const START = 4000;
const RENT = 700;
const ACTIONS = 3;
const GIG = 300;
const FREEDOM = 15000;

const DATES = ['Feb 2020', 'Mar 2020', 'Sep 2020', 'Feb 2021', 'Nov 2021', 'Jun 2022'];
const HEADLINE = [
  'Markets near record highs. A strange new virus is spreading in China — almost no one is worried.',
  'THE CRASH. Lockdowns hit and the market falls faster than at any time in history.',
  'A stunning rebound. Stuck at home, millions of new traders pile into anything tech.',
  'Peak euphoria — meme stocks, crypto, "stocks only go up." Everyone feels like a genius.',
  'The party is deafening, but interest rates and inflation are creeping into the headlines.',
  'The reckoning. Rates jump, the bubble bursts, and the high-flyers of 2021 collapse.',
];

const COMPANIES = [
  { id: 'AAPL', name: 'Apple', biz: 'Makes the iPhone, Mac, and services like the App Store. One of the most profitable companies on Earth.', prices: [68, 63, 116, 121, 165, 137] },
  { id: 'TSLA', name: 'Tesla', biz: 'Builds electric cars, led by Elon Musk. Also batteries and self-driving software.', prices: [133, 102, 430, 700, 1140, 700] },
  { id: 'ZM', name: 'Zoom', biz: 'Sells easy video-calling software, mostly to businesses. Small and fairly new.', prices: [105, 146, 470, 400, 250, 110] },
  { id: 'DAL', name: 'Delta', biz: 'A major airline. Airlines carry huge fixed costs and lots of debt.', prices: [47, 23, 31, 46, 38, 31] },
  { id: 'MRNA', name: 'Moderna', biz: "A biotech using new 'mRNA' technology to make vaccines. Very few products so far.", prices: [26, 29, 67, 150, 300, 140] },
  { id: 'PTON', name: 'Peloton', biz: 'Sells premium exercise bikes and a subscription for live workout classes.', prices: [27, 27, 100, 145, 55, 12] },
];
const COLORS = { AAPL: '#3f6fb0', TSLA: '#c9962f', ZM: '#8a5cc0', DAL: '#b23a34', MRNA: '#2b9c8f', PTON: '#d0678f', CASH: '#8a7a5c' };

// Per period: three real, plain, look-up-able facts — money / price / news.
// No interpretation: never says why it moved or what to do. You decide.
const INFO = {
  AAPL: [
    { m: 'Earns tens of billions in profit a year; huge cash reserves.', v: 'Priced roughly in line with its profits.', n: 'Warned the China virus could disrupt its factories.' },
    { m: 'Still deeply profitable; online sales continue with stores shut.', v: 'Fell with the market; a bit cheaper than usual.', n: 'Global lockdowns close its retail stores.' },
    { m: 'Selling record Macs and iPads to people stuck at home.', v: 'Recovered; now priced above its usual level.', n: 'Split its stock 4-for-1; retail traders pile in.' },
    { m: 'Record profits; services keep growing.', v: 'Expensive versus its own history, but earnings rise.', n: 'Treated as the safe giant amid the mania.' },
    { m: 'Profits at all-time highs.', v: 'Priced high, like most of the market now.', n: 'Rate-hike worries start hitting the headlines.' },
    { m: 'Still very profitable; sales holding up.', v: 'Came down toward a normal price.', n: 'Falls as rising rates hit nearly every stock.' },
  ],
  TSLA: [
    { m: 'Just turned its first small profits; heavy debt; low on cash.', v: 'Priced far above older carmakers that earn much more.', n: 'The most bet-against stock in America; Musk everywhere.' },
    { m: 'Barely profitable; shut factories could strain its cash.', v: 'Still priced like a tech giant despite the risks.', n: 'Crushed in the crash with other risky names.' },
    { m: 'Now posting steady profits; deliveries climbing fast.', v: 'Priced higher than any carmaker in history.', n: 'Reopens in defiance; about to join the S&P 500.' },
    { m: 'Growing and profitable, but small next to its price.', v: 'Among the most expensive big stocks in the world.', n: 'Retail mania at a fever pitch.' },
    { m: 'Record deliveries and real profits now.', v: 'Worth more than the next several carmakers combined.', n: 'Peak euphoria across the whole market.' },
    { m: 'Makes real money now, and a lot of it.', v: 'Still pricey, but far less extreme after the drop.', n: 'Falls hard as rising rates hit high-priced stocks.' },
  ],
  ZM: [
    { m: 'Small; sales nearly doubled last year; barely profitable.', v: 'Priced very high versus how little it earns.', n: 'Almost nobody used it — until the virus appeared.' },
    { m: 'Usage exploding as offices and schools close.', v: 'Even pricier after rising during the crash.', n: 'One of the only stocks going UP in the crash.' },
    { m: 'Revenue up 350%+; now clearly profitable.', v: 'About 50× its yearly sales — far above most companies.', n: "'To Zoom' becomes an everyday word." },
    { m: 'Still growing, but no longer exploding.', v: 'Still priced for very high growth far ahead.', n: 'Vaccines are being announced.' },
    { m: 'Growth slowing noticeably as reopening nears.', v: 'Very expensive relative to slowing growth.', n: 'Offices begin planning to reopen.' },
    { m: 'Sales growth has largely stalled.', v: 'Back to a modest price after a huge fall.', n: 'Near where it started before the pandemic.' },
  ],
  DAL: [
    { m: 'Solidly profitable in good times; lots of debt.', v: 'Priced cheaply versus its profits.', n: 'Record travel demand, for now.' },
    { m: 'Travel down ~95%; losing roughly $60M a day.', v: 'Cheap on paper — but now losing money fast.', n: 'Warren Buffett sells every airline he owns.' },
    { m: 'Still losing money; kept alive by bailouts.', v: 'Cheap, but few profits to value against.', n: 'Planes remain mostly empty.' },
    { m: 'Losses narrowing on reopening hopes.', v: 'Cheap, but still unprofitable.', n: 'Vaccine hopes briefly lift travel stocks.' },
    { m: 'Recovering slowly; still below pre-COVID.', v: 'Cheap, profits far below normal.', n: 'A slow grind back.' },
    { m: 'Small profits again, far below pre-pandemic.', v: 'Still statistically cheap.', n: "Two years on, below where it started." },
  ],
  MRNA: [
    { m: 'No approved products; loses money on research.', v: 'Priced on hope — almost no revenue.', n: 'A tiny firm now racing to make a COVID vaccine.' },
    { m: 'Still no products or profits.', v: 'Valued entirely on the chance its vaccine works.', n: 'Interest surges as the pandemic explodes.' },
    { m: 'Signs first big government supply contracts.', v: 'Priced far ahead of any actual profits.', n: 'Its vaccine enters human trials.' },
    { m: 'Vaccine authorized — billions in real revenue arriving.', v: 'Now has real sales to value against.', n: 'Among the first COVID vaccines approved.' },
    { m: 'Highly profitable now — almost all from COVID.', v: 'Priced richly on profits that may not last.', n: 'Booster demand is strong.' },
    { m: 'Still profitable, but sales set to shrink as COVID fades.', v: 'Came down as future profits look smaller.', n: 'The pandemic is winding down.' },
  ],
  PTON: [
    { m: 'Sales growing fast; loses money; recently went public.', v: 'Priced high for a company that loses money.', n: 'A pricey bike most people have never tried.' },
    { m: 'Demand jumping as gyms close.', v: 'Expensive, but growth is accelerating.', n: 'Gyms shut nationwide.' },
    { m: 'Bikes sold out for months; briefly profitable.', v: 'Priced for the boom to last for years.', n: 'Everyone stuck at home wants one.' },
    { m: 'Still growing; can\'t build bikes fast enough.', v: 'Priced as if home fitness replaces gyms forever.', n: 'Home-fitness mania at its peak.' },
    { m: 'Growth stalling; unsold inventory piling up.', v: 'Still priced high as sales slow.', n: 'Gyms are reopening.' },
    { m: 'Sales collapsing; back to heavy losses.', v: 'Crashed to a fraction of its former price.', n: 'Down about 90% from its peak.' },
  ],
};

const LEADS = [
  [{ id: 'ZM', why: 'Downloads exploding as offices close.' }],
  [{ id: 'DAL', why: 'Airlines in free-fall — bargain, or trap?' }, { id: 'MRNA', why: 'A vaccine race is starting; one tiny firm is in it.' }],
  [{ id: 'TSLA', why: 'It bounced hard off the bottom — momentum building.' }],
  [{ id: 'PTON', why: 'Home-fitness mania — real, or a fad?' }],
  [{ id: 'TSLA', why: 'Everything is euphoric. Is this the top?' }],
  [],
];

// Sal base events for periods 0–3. Periods 4 & 5 are chosen by karma at runtime.
const SAL_BASE = {
  0: { mood: 'hype', line: "Cuz! I dumped my whole bonus into Peloton — everyone's gonna work out at home, we're gonna be RICH. You should get in too!", choices: [{ label: "Thanks, Sal — I'll look into it" }] },
  1: { mood: 'worried', line: "It's bad, cuz — Mom's back in the hospital and I'm wiped out. I need $500 for her meds. Can you spot me?", choices: [{ label: 'Give him $500', need: 500, help: true, eff: { cash: -500 }, note: 'Family. The rent still comes anyway.' }, { label: "I can't right now", refuse: true }] },
  2: { mood: 'worried', line: "My tank's bone dry and payday's not 'til Friday, cuz. Float me $150? I'm good for it, I swear.", choices: [{ label: 'Lend him $150', need: 150, help: true, eff: { cash: -150 } }, { label: 'Not this time', refuse: true }] },
  3: { mood: 'greedy', line: "Everyone's getting rich! My guy runs a newsletter — $200 and he hands you the next 10×. He swears Peloton and Zoom go to the moon. In or out?", choices: [{ label: 'Buy the tip ($200)', need: 200, eff: { cash: -200, reveal: ['PTON', 'ZM'] }, note: 'You pay — then research them yourself.' }, { label: 'Pass' }] },
};

function SalGuy({ mood }) {
  const ink = '#2a2018';
  let face;
  if (mood === 'hype') face = (<>
    <circle cx="113" cy="133" r="6" fill={ink} /><circle cx="153" cy="133" r="6" fill={ink} />
    <path d="M96 116 Q110 106 124 113" stroke="#7a5636" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M138 113 Q152 106 166 116" stroke="#7a5636" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M104 160 Q131 194 160 160 Q131 176 104 160 Z" fill="#8a3030" /><path d="M116 166 Q131 176 148 166 Z" fill="#fff" />
    <path d="M92 118 l-7 -6 M96 110 l-3 -8" stroke="#f5c84b" strokeWidth="3" strokeLinecap="round" />
  </>);
  else if (mood === 'worried') face = (<>
    <circle cx="112" cy="130" r="5" fill={ink} /><circle cx="150" cy="130" r="5" fill={ink} />
    <path d="M98 114 Q112 121 124 115" stroke="#7a5636" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M138 115 Q150 121 164 114" stroke="#7a5636" strokeWidth="4" fill="none" strokeLinecap="round" />
    <ellipse cx="131" cy="171" rx="13" ry="10" fill="#8a3030" />
    <path d="M182 116 q7 15 0 22 q-9 -5 0 -22 Z" fill="#7fc9e8" />
  </>);
  else if (mood === 'greedy') face = (<>
    <text x="111" y="142" fontSize="22" fontWeight="800" fill="#2e8b57" textAnchor="middle">$</text>
    <text x="151" y="142" fontSize="22" fontWeight="800" fill="#2e8b57" textAnchor="middle">$</text>
    <path d="M100 158 Q131 192 162 158 Q131 174 100 158 Z" fill="#8a3030" /><path d="M120 170 Q131 182 142 170 Z" fill="#c65" />
  </>);
  else if (mood === 'manic') face = (<>
    <circle cx="111" cy="134" r="3.5" fill={ink} /><circle cx="151" cy="134" r="3.5" fill={ink} />
    <path d="M96 112 Q110 104 124 111" stroke="#7a5636" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M138 111 Q152 104 166 112" stroke="#7a5636" strokeWidth="4" fill="none" strokeLinecap="round" />
    <ellipse cx="131" cy="173" rx="21" ry="15" fill="#7a2828" /><ellipse cx="131" cy="167" rx="15" ry="4" fill="#fff" />
    <path d="M180 118 q7 15 0 22 q-9 -5 0 -22 Z" fill="#7fc9e8" />
  </>);
  else face = (<>
    <path d="M104 127 l15 15 M119 127 l-15 15" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
    <path d="M143 127 l15 15 M158 127 l-15 15" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
    <path d="M108 178 Q131 164 154 178" stroke="#7a3030" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M150 150 q4 15 0 21 q-7 -4 0 -21 Z" fill="#7fc9e8" />
  </>);
  return (
    <svg viewBox="0 0 220 262" className="pg-dave-svg" xmlns="http://www.w3.org/2000/svg">
      <path d="M34 262 Q36 202 92 194 L130 208 L168 194 Q184 202 186 262 Z" fill="#3f7d8f" />
      <path d="M168 206 Q206 192 198 160 L184 164 Q190 186 160 196 Z" fill="#3f7d8f" />
      <circle cx="194" cy="150" r="15" fill="#e8b98f" />
      <rect x="112" y="176" width="36" height="28" rx="9" fill="#dfa877" />
      <circle cx="130" cy="136" r="60" fill="#e8b98f" />
      <circle cx="70" cy="142" r="12" fill="#e8b98f" /><circle cx="190" cy="142" r="12" fill="#e8b98f" />
      <path d="M76 150 Q88 210 130 214 Q172 210 184 150 Q168 178 130 182 Q92 178 76 150 Z" fill="#b5794a" />
      <path d="M72 106 Q82 54 130 52 Q178 54 188 106 Q150 92 130 92 Q110 92 72 106 Z" fill="#d1462f" />
      <path d="M150 100 Q200 96 212 114 Q200 121 150 114 Z" fill="#b03526" />
      <circle cx="130" cy="56" r="5" fill="#b03526" />
      <ellipse cx="111" cy="134" rx="15" ry="17" fill="#fff" /><ellipse cx="151" cy="134" rx="15" ry="17" fill="#fff" />
      {face}
    </svg>
  );
}

function SalOverlay({ sal, cash, onPick }) {
  return (
    <div className="pg-dave-overlay">
      <div className="pg-dave-bubble">
        <p className="pg-dave-name">Cousin Sal</p>
        <p className="pg-dave-line">"{sal.line}"</p>
        <div className="pg-dave-choices">
          {sal.choices.map((ch, i) => { const cant = ch.need && cash < ch.need; return (
            <button key={i} className="pg-dave-btn" disabled={cant} onClick={() => onPick(ch)}>{cant ? `${ch.label} — can't afford it` : ch.label}{ch.note && !cant && <em>{ch.note}</em>}</button>
          ); })}
        </div>
      </div>
      <div className="pg-dave-guy"><SalGuy mood={sal.mood} /></div>
    </div>
  );
}

const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
const sPct = (x) => { const v = x * 100; return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(Math.abs(v) < 10 ? 1 : 0) + '%'; };
const cls = (x) => (x > 0.005 ? 'up' : x < -0.005 ? 'down' : 'flat');

// Line chart of everyone's story so far — each starts at $100 (only history up to
// the current period; no peeking at the future). The most intuitive profit/loss view.
function MarketChart({ upto }) {
  const n = upto + 1;
  if (n < 2) return null;
  const series = COMPANIES.map((c) => ({ id: c.id, name: c.name, vals: c.prices.slice(0, n).map((p) => (p / c.prices[0]) * 100) }));
  const all = series.flatMap((s) => s.vals).concat([100]);
  const min = Math.min(...all), max = Math.max(...all);
  const W = 360, H = 148, pL = 6, pR = 6, pT = 8, pB = 16;
  const X = (i) => pL + (i / (n - 1)) * (W - pL - pR);
  const Y = (v) => pT + (1 - (v - min) / ((max - min) || 1)) * (H - pT - pB);
  const sorted = series.slice().sort((a, b) => b.vals[n - 1] - a.vals[n - 1]);
  return (
    <div className="pg-chart-card">
      <p className="pg-chart-h">Every company since Feb 2020 — as if you'd put $100 in each</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="pg-chart">
        <line className="pg-chart-base" x1={pL} x2={W - pR} y1={Y(100)} y2={Y(100)} />
        <text className="pg-chart-lbl" x={pL} y={Y(100) - 3}>$100</text>
        {series.map((s) => <polyline key={s.id} points={s.vals.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')} fill="none" stroke={COLORS[s.id]} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />)}
        {series.map((s) => <circle key={s.id} cx={X(n - 1)} cy={Y(s.vals[n - 1])} r="3" fill={COLORS[s.id]} />)}
        <text className="pg-chart-x" x={pL} y={H - 3}>{DATES[0]}</text>
        <text className="pg-chart-x" x={W - pR} y={H - 3} textAnchor="end">{DATES[upto]}</text>
      </svg>
      <div className="pg-chart-legend">
        {sorted.map((s) => { const chg = s.vals[n - 1] / 100 - 1; return <span key={s.id} className="pg-leg"><span className="pg-dot" style={{ background: COLORS[s.id] }} />{s.name} <em className={cls(chg)}>{sPct(chg)}</em></span>; })}
      </div>
    </div>
  );
}

export default function PressureGame() {
  const [phase, setPhase] = useState('intro');
  const [t, setT] = useState(0);
  const [cash, setCash] = useState(START);
  const [shares, setShares] = useState({});
  const [avg, setAvg] = useState({});
  const [acts, setActs] = useState(ACTIONS);
  const [dug, setDug] = useState({});
  const [pend, setPend] = useState({});
  const [salDone, setSalDone] = useState({});
  const [helped, setHelped] = useState(0);
  const [refused, setRefused] = useState(0);
  const [roll] = useState(Math.random());
  const [flash, setFlash] = useState('');
  const [free, setFree] = useState(false);

  const price = (id) => COMPANIES.find((c) => c.id === id).prices[t];
  const holdings = COMPANIES.reduce((s, c) => s + (shares[c.id] || 0) * price(c.id), 0);
  const net = cash + holdings;
  const leadIds = new Set((LEADS[t] || []).map((l) => l.id));

  // Sal's appearance this period — periods 4 & 5 branch on how you've treated him.
  function salFor(turn) {
    if (turn === 4) {
      if (refused >= 2) return { mood: 'greedy', line: "Funny thing, cuz — you kept slamming the door on me. So I let myself in and 'borrowed' $700 from your drawer. Guess we're even now.", choices: [{ label: '…Sal.', eff: { steal: 700 } }] };
      if (helped >= 1 && roll < 0.8) return { mood: 'worried', line: "Cuz, you always spot me when I'm down — so straight up: I'm in deep on Peloton and Zoom, but something feels wrong. Get out while you can. And here, take this back.", choices: [{ label: 'Thanks, Sal — you too', eff: { cash: 600, reveal: ['PTON', 'ZM'] }, note: 'He pays you back — and hands you a real warning.' }] };
      return { mood: 'manic', line: "I re-mortgaged the house and put it ALL into Peloton and Zoom. We're gonna be legends, cuz!!", choices: [{ label: 'Sal… please be careful' }, { label: 'Nice, me too' }] };
    }
    if (turn === 5) {
      if (refused >= 2) return { mood: 'broke', line: "Lost everything, cuz — Peloton, Zoom, all of it. …Yeah, I know we're not square after I took your cash. Don't look at me like that.", choices: [{ label: 'Say nothing' }] };
      if (helped >= 1) return { mood: 'broke', line: "I lost it all, cuz — but you kept me afloat when it mattered. That's worth more than the money. Crashing at Mom's for a while.", choices: [{ label: 'Tell him it\'ll be okay' }] };
      return { mood: 'broke', line: "I lost it all, cuz. Peloton, Zoom, everything — moving back in with Mom. That newsletter guy? Total fraud.", choices: [{ label: 'Say something kind' }] };
    }
    return SAL_BASE[turn] || null;
  }
  const salEvt = !salDone[t] ? salFor(t) : null;

  function dig(id) { if (acts <= 0 || dug[id]) return; setDug({ ...dug, [id]: true }); setActs(acts - 1); }
  function gig() { if (acts <= 0) return; setCash(cash + GIG); setActs(acts - 1); }
  function buy(id, amt) {
    const p = price(id); const a = Math.min(amt, cash); if (a < 1) return;
    const ns = (shares[id] || 0) + a / p; const na = ns > 0 ? (((shares[id] || 0) * (avg[id] || 0)) + a) / ns : 0;
    setShares({ ...shares, [id]: ns }); setAvg({ ...avg, [id]: na }); setCash(cash - a);
  }
  function sell(id, amt) {
    const p = price(id); const pos = (shares[id] || 0) * p; if (pos <= 0) return;
    const a = Math.min(amt == null ? pos : amt, pos); let ns = (shares[id] || 0) - a / p; if (ns < 1e-6) ns = 0;
    setShares({ ...shares, [id]: ns }); if (ns === 0) setAvg({ ...avg, [id]: 0 }); setCash(cash + a);
  }
  function applyTrade(id) { const a = pend[id] || 0; if (a > 0) buy(id, a); else if (a < 0) sell(id, -a); setPend({ ...pend, [id]: 0 }); }
  function salPick(ch) {
    const e = ch.eff || {};
    let nc = cash;
    if (e.cash) nc += e.cash;
    if (e.steal) nc -= Math.min(e.steal, cash);
    if (nc !== cash) setCash(nc);
    if (e.reveal) { const nd = { ...dug }; e.reveal.forEach((id) => { nd[id] = true; }); setDug(nd); }
    if (ch.help) setHelped(helped + 1);
    if (ch.refuse) setRefused(refused + 1);
    setSalDone({ ...salDone, [t]: true });
  }

  function endMonth() {
    if (cash < RENT) { setFlash(`You're ${fmt(RENT - cash)} short on rent. Sell a holding to cover it — or you're out.`); return; }
    const afterRent = cash - RENT;
    const nt = t + 1;
    if (nt > DATES.length - 1) { setCash(afterRent); setPhase('end'); return; }
    const nextNet = afterRent + COMPANIES.reduce((s, c) => s + (shares[c.id] || 0) * c.prices[nt], 0);
    setCash(afterRent); setT(nt); setActs(ACTIONS); setDug({}); setPend({}); setFlash('');
    if (nextNet >= FREEDOM) { setFree(true); setPhase('end'); return; }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function restart() { setT(0); setCash(START); setShares({}); setAvg({}); setActs(ACTIONS); setDug({}); setPend({}); setSalDone({}); setHelped(0); setRefused(0); setFlash(''); setFree(false); setPhase('intro'); }

  if (phase === 'intro') {
    return (
      <div className="pg"><div className="pg-col pg-mid">
        <p className="pg-kick">Investment Time Machine · rent's due</p>
        <h1 className="pg-title">You're broke. Rent is due. Don't get evicted — get free.</h1>
        <ul className="pg-rules">
          <li><b>$4,000 to your name.</b> Rent is <b>$700 every period</b>. Miss it and you're out.</li>
          <li><b>Time is tight.</b> Each period you get <b>3 moves</b> — investigate a company, or grind a side gig for $300.</li>
          <li><b>Investigate for facts, not answers.</b> You get the real numbers, price and news — you decide what they mean.</li>
          <li>It's <b>2020–2022</b>: a crash, a mania, and a bust. Not everything survives — and rent won't wait.</li>
        </ul>
        <button className="pg-btn pg-primary" onClick={() => setPhase('play')}>Start — February 2020 →</button>
      </div></div>
    );
  }

  if (phase === 'end') {
    const won = free || net >= FREEDOM;
    return (
      <div className="pg"><div className="pg-col pg-mid">
        <p className="pg-kick">{won ? 'You made it out' : 'June 2022'}</p>
        <h1 className="pg-title">{won ? "You're free." : 'You survived to the other side.'}</h1>
        <div className="pg-final"><span>Net worth</span><b className={cls(net / START - 1)}>{fmt(net)}</b></div>
        <p className="pg-lead">{won
          ? `You turned $4,000 into ${fmt(net)} while the bills never stopped — through the crash, the mania, and the bust. Your money now works harder than your rent. That's escape velocity.`
          : `You kept the lights on through a crash, a bubble, and its collapse. You didn't get rich — but you didn't get evicted, and you didn't end up like Sal.`}</p>
        <button className="pg-btn pg-primary" onClick={restart}>Run it again →</button>
      </div></div>
    );
  }

  const rentDanger = cash < RENT;
  return (
    <div className={'pg' + (t === 1 ? ' pg-storm' : '')}>
      <div className="pg-col">
        <div className="pg-bar">
          <div className="pg-bar-l"><span className="pg-month">{DATES[t]}</span><span className="pg-sub">Period {t + 1} of {DATES.length}</span></div>
          <div className={'pg-rent' + (rentDanger ? ' danger' : '')}><span>Rent due</span><b>{fmt(RENT)}</b></div>
        </div>
        <div className="pg-stats">
          <div className="pg-stat"><span>Cash</span><b className={rentDanger ? 'down' : ''}>{fmt(cash)}</b></div>
          <div className="pg-stat"><span>Invested</span><b>{fmt(holdings)}</b></div>
          <div className="pg-stat"><span>Net worth</span><b>{fmt(net)}</b></div>
          <div className="pg-stat pg-freedom"><span>Freedom</span><b>{Math.round(net / FREEDOM * 100)}%</b></div>
        </div>

        <p className="pg-headline">{HEADLINE[t]}</p>
        {flash && <p className="pg-flash">{flash}</p>}

        <MarketChart upto={t} />

        {salEvt && <SalOverlay sal={salEvt} cash={cash} onPick={salPick} />}

        <div className="pg-time">
          <span className="pg-time-lbl">Time this period</span>
          <span className="pg-pips">{Array.from({ length: ACTIONS }).map((_, i) => <span key={i} className={'pg-pip' + (i < acts ? ' on' : '')} />)}</span>
          <button className="pg-gig" disabled={acts <= 0} onClick={gig}>Side gig +{fmt(GIG)}</button>
        </div>

        {(LEADS[t] || []).length > 0 && (
          <div className="pg-leads">
            <span className="pg-leads-h">📣 Leads worth a look</span>
            {LEADS[t].map((l, i) => <p key={i} className="pg-lead-row"><b>{COMPANIES.find((c) => c.id === l.id).name}</b> — {l.why}</p>)}
          </div>
        )}

        {COMPANIES.map((c) => {
          const p = price(c.id); const prev = t > 0 ? c.prices[t - 1] : null; const mv = prev ? p / prev - 1 : null;
          const pos = (shares[c.id] || 0) * p; const g = (shares[c.id] || 0) > 0 && (avg[c.id] || 0) > 0 ? p / avg[c.id] - 1 : 0;
          const researched = dug[c.id]; const info = INFO[c.id][t];
          const pd = pend[c.id] || 0; const canTrade = pos >= 1 || cash >= 1;
          return (
            <div className={'pg-card' + (leadIds.has(c.id) ? ' lead' : '')} key={c.id}>
              <div className="pg-card-top">
                <span className="pg-co"><span className="pg-dot" style={{ background: COLORS[c.id] }} />{c.name}{leadIds.has(c.id) && <span className="pg-tag">lead</span>}</span>
                <span className="pg-pb"><b>${p}</b>{mv != null && <span className={'pg-mv ' + cls(mv)}>{sPct(mv)}</span>}</span>
              </div>
              {pos > 0.5 && <div className="pg-own">you hold {fmt(pos)} <em className={cls(g)}>{sPct(g)}</em></div>}

              {researched
                ? <div className="pg-dossier">
                    <p className="pg-biz">{c.biz}</p>
                    <div className="pg-fact"><span className="pg-fk">Money</span><span className="pg-fv">{info.m}</span></div>
                    <div className="pg-fact"><span className="pg-fk">Price</span><span className="pg-fv">{info.v}</span></div>
                    <div className="pg-fact"><span className="pg-fk">News</span><span className="pg-fv">{info.n}</span></div>
                  </div>
                : <button className="pg-dig" disabled={acts <= 0} onClick={() => dig(c.id)}>{acts <= 0 ? 'no moves left this period' : 'Investigate (1 move)'}</button>}

              <div className="pg-tradebox">
                <input type="range" className="pg-slider" min={-Math.round(pos)} max={Math.round(cash)} step="50" value={pd} disabled={!canTrade}
                  onChange={(e) => setPend({ ...pend, [c.id]: +e.target.value })} />
                <div className="pg-slider-ends"><span>{pos >= 1 ? `◀ sell ${fmt(pos)}` : ''}</span><span>{cash >= 1 ? `buy ${fmt(cash)} ▶` : ''}</span></div>
                <button className={'pg-trade-btn' + (pd > 0 ? ' buy' : pd < 0 ? ' sell' : '')} disabled={!pd} onClick={() => applyTrade(c.id)}>
                  {pd > 0 ? `Buy ${fmt(pd)}` : pd < 0 ? `Sell ${fmt(-pd)}` : 'Drag the slider to buy or sell'}
                </button>
              </div>
            </div>
          );
        })}

        <button className={'pg-btn pg-primary pg-end' + (rentDanger ? ' danger' : '')} onClick={endMonth}>
          {rentDanger ? `Pay rent ${fmt(RENT)} — you're short` : `End period · pay ${fmt(RENT)} rent →`}
        </button>
        <p className="pg-endsub">{t === DATES.length - 1 ? 'Last period — then we settle up.' : `Then it's ${DATES[t + 1]}. The market moves. Rent comes again.`}</p>
      </div>
    </div>
  );
}
