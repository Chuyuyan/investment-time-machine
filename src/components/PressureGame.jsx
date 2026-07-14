import React, { useState } from 'react';

/*
 * PressureGame — "Rent's Due"  (?proto=pressure)
 * ----------------------------------------------
 * Dark comic reskin. Cousin Sal is now a big-head, giant-glasses IP character
 * whose lenses ARE his expression screen, and who breaks the 4th wall: when you
 * try to sell one of his darlings he pops up and shoves the trade back ("WAIT!!
 * it's about to bounce!"). Research gives real, look-up-able facts (money/price/
 * news) that update each period — never the "why". A line chart shows P&L.
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
const COLORS = { AAPL: '#5b8cff', TSLA: '#f5b13c', ZM: '#b072ff', DAL: '#ff5f6a', MRNA: '#2fd1a8', PTON: '#ff6fa5', CASH: '#8a93a8' };

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
    { m: 'Small profits again, far below pre-pandemic.', v: 'Still statistically cheap.', n: 'Two years on, below where it started.' },
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
    { m: "Still growing; can't build bikes fast enough.", v: 'Priced as if home fitness replaces gyms forever.', n: 'Home-fitness mania at its peak.' },
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

const SAL_BASE = {
  0: { mood: 'hype', line: "Cuz! I dumped my whole bonus into Peloton — everyone's gonna work out at home, we're gonna be RICH. You should get in too!", choices: [{ label: "Thanks, Sal — I'll look into it" }] },
  1: { mood: 'worried', line: "It's bad, cuz — Mom's back in the hospital and I'm wiped out. I need $500 for her meds. Can you spot me?", choices: [{ label: 'Give him $500', need: 500, help: true, eff: { cash: -500 }, note: 'Family. The rent still comes anyway.' }, { label: "I can't right now", refuse: true }] },
  2: { mood: 'worried', line: "My tank's bone dry and payday's not 'til Friday, cuz. Float me $150? I'm good for it, I swear.", choices: [{ label: 'Lend him $150', need: 150, help: true, eff: { cash: -150 } }, { label: 'Not this time', refuse: true }] },
  3: { mood: 'greedy', line: "Everyone's getting rich! My guy runs a newsletter — $200 and he hands you the next 10×. He swears Peloton and Zoom go to the moon. In or out?", choices: [{ label: 'Buy the tip ($200)', need: 200, eff: { cash: -200, reveal: ['PTON', 'ZM'] }, note: 'You pay — then research them yourself.' }, { label: 'Pass' }] },
};

// Cousin Sal: huge head, tiny body, GIANT glasses whose lenses are his expression screen.
function SalGuy({ mood }) {
  const lens = (cx) => {
    if (mood === 'hype') return <text x={cx} y={151} fontSize="34" fontWeight="900" textAnchor="middle" fill="#f5c84b">★</text>;
    if (mood === 'greedy') return <text x={cx} y={152} fontSize="32" fontWeight="900" textAnchor="middle" fill="#2fae6a">$</text>;
    if (mood === 'broke') return <text x={cx} y={152} fontSize="30" fontWeight="900" textAnchor="middle" fill="#c23a3a">✕</text>;
    if (mood === 'manic') return <React.Fragment><circle cx={cx} cy={140} r="13" fill="#fff" /><circle cx={cx} cy={140} r="3" fill="#161616" /></React.Fragment>;
    return <React.Fragment><circle cx={cx} cy={140} r="11" fill="#fff" /><circle cx={cx} cy={135} r="4.5" fill="#161616" /></React.Fragment>;
  };
  let mouth;
  if (mood === 'hype') mouth = <path d="M94 200 Q120 236 146 200 Q120 216 94 200 Z" fill="#7a2f2f" />;
  else if (mood === 'greedy') mouth = <React.Fragment><path d="M98 200 Q120 230 142 200 Q120 214 98 200 Z" fill="#7a2f2f" /><path d="M112 213 Q120 223 128 213 Z" fill="#d1706a" /></React.Fragment>;
  else if (mood === 'manic') mouth = <React.Fragment><ellipse cx="120" cy="208" rx="23" ry="16" fill="#6e2626" /><ellipse cx="120" cy="201" rx="16" ry="4" fill="#fff" /></React.Fragment>;
  else if (mood === 'broke') mouth = <path d="M100 216 Q120 202 140 216" stroke="#6e2626" strokeWidth="5" fill="none" strokeLinecap="round" />;
  else mouth = <ellipse cx="120" cy="207" rx="12" ry="10" fill="#7a2f2f" />;
  return (
    <svg viewBox="0 0 240 300" className="pg-dave-svg" xmlns="http://www.w3.org/2000/svg">
      <path d="M90 300 Q90 256 120 248 Q150 256 150 300 Z" fill="#ece5d3" />
      <path d="M90 300 Q88 260 104 252 L120 300 Z" fill="#333a4d" />
      <path d="M150 300 Q152 260 136 252 L120 300 Z" fill="#333a4d" />
      <path d="M120 252 l-7 22 l7 8 l7 -8 Z" fill="#3a9a5a" />
      <path d="M150 266 Q198 248 192 210 L172 216 Q180 244 142 254 Z" fill="#333a4d" />
      <circle cx="188" cy="200" r="17" fill="#e8b98f" />
      <rect x="106" y="234" width="28" height="24" rx="8" fill="#dfa877" />
      <circle cx="120" cy="140" r="90" fill="#e8b98f" />
      <circle cx="34" cy="148" r="13" fill="#e8b98f" /><circle cx="206" cy="148" r="13" fill="#e8b98f" />
      <path d="M42 160 Q58 228 120 232 Q182 228 198 160 Q178 192 120 196 Q62 192 42 160 Z" fill="#a07040" opacity="0.75" />
      <path d="M46 92 q-12 -12 0 -24 q3 13 15 15 Z" fill="#5f4230" />
      <path d="M194 92 q12 -12 0 -24 q-3 13 -15 15 Z" fill="#5f4230" />
      <path d="M40 92 Q52 32 120 30 Q188 32 200 92 Q160 72 120 72 Q80 72 40 92 Z" fill="#d83a2f" />
      <path d="M150 84 Q212 78 228 102 Q212 111 150 104 Z" fill="#b52e26" />
      <text x="118" y="64" fontSize="21" fontWeight="900" textAnchor="middle" fill="#fff">SAL</text>
      <line x1="112" y1="140" x2="128" y2="140" stroke="#22406e" strokeWidth="6" />
      <line x1="58" y1="136" x2="34" y2="148" stroke="#22406e" strokeWidth="5" strokeLinecap="round" />
      <line x1="182" y1="136" x2="206" y2="148" stroke="#22406e" strokeWidth="5" strokeLinecap="round" />
      <circle cx="84" cy="140" r="35" fill="#eaf2ff" stroke="#22406e" strokeWidth="7" />
      <circle cx="156" cy="140" r="35" fill="#eaf2ff" stroke="#22406e" strokeWidth="7" />
      {lens(84)}{lens(156)}
      <path d="M120 152 q-11 26 -2 34 q11 6 22 0 q9 -8 -2 -34 Z" fill="#e0ac7e" />
      {mouth}
      {mood === 'worried' && <path d="M198 152 q8 16 0 24 q-10 -5 0 -24 Z" fill="#7fc9e8" />}
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

// His "绝活": he invades the UI to stop you selling one of his darlings.
function SalInterject({ name, onHold, onSell }) {
  return (
    <div className="pg-dave-overlay">
      <div className="pg-dave-bubble pg-interject-bubble">
        <p className="pg-dave-name">Cousin Sal · barging in</p>
        <p className="pg-dave-line">"WAIT!! Don't sell {name}!! It's about to bounce, cuz, I can FEEL it — just hold a little longer!!"</p>
        <div className="pg-dave-choices">
          <button className="pg-dave-btn" onClick={onHold}>…Fine, I'll keep holding<em>Do it Sal's way.</em></button>
          <button className="pg-dave-btn pg-defy" onClick={onSell}>No — I'm selling anyway<em>Trust your own read.</em></button>
        </div>
      </div>
      <div className="pg-dave-guy pg-dave-burst"><SalGuy mood="manic" /></div>
    </div>
  );
}

const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
const sPct = (x) => { const v = x * 100; return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(Math.abs(v) < 10 ? 1 : 0) + '%'; };
const cls = (x) => (x > 0.005 ? 'up' : x < -0.005 ? 'down' : 'flat');

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
  const [interject, setInterject] = useState(null);
  const [blocked, setBlocked] = useState({});
  const [indep, setIndep] = useState(0);
  const [roll] = useState(Math.random());
  const [flash, setFlash] = useState('');
  const [free, setFree] = useState(false);

  const price = (id) => COMPANIES.find((c) => c.id === id).prices[t];
  const holdings = COMPANIES.reduce((s, c) => s + (shares[c.id] || 0) * price(c.id), 0);
  const net = cash + holdings;
  const leadIds = new Set((LEADS[t] || []).map((l) => l.id));

  function salFor(turn) {
    if (turn === 4) {
      if (refused >= 2) return { mood: 'greedy', line: "Funny thing, cuz — you kept slamming the door on me. So I let myself in and 'borrowed' $700 from your drawer. Guess we're even now.", choices: [{ label: '…Sal.', eff: { steal: 700 } }] };
      if (helped >= 1 && roll < 0.8) return { mood: 'worried', line: "Cuz, you always spot me when I'm down — so straight up: I'm in deep on Peloton and Zoom, but something feels wrong. Get out while you can. And here, take this back.", choices: [{ label: 'Thanks, Sal — you too', eff: { cash: 600, reveal: ['PTON', 'ZM'] }, note: 'He pays you back — and hands you a real warning.' }] };
      return { mood: 'manic', line: "I re-mortgaged the house and put it ALL into Peloton and Zoom. We're gonna be legends, cuz!!", choices: [{ label: 'Sal… please be careful' }, { label: 'Nice, me too' }] };
    }
    if (turn === 5) {
      if (refused >= 2) return { mood: 'broke', line: "Lost everything, cuz — Peloton, Zoom, all of it. …Yeah, I know we're not square after I took your cash. Don't look at me like that.", choices: [{ label: 'Say nothing' }] };
      if (helped >= 1) return { mood: 'broke', line: "I lost it all, cuz — but you kept me afloat when it mattered. That's worth more than the money. Crashing at Mom's for a while.", choices: [{ label: "Tell him it'll be okay" }] };
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
  function applyTrade(id) {
    const a = pend[id] || 0;
    // Sal's 4th-wall block: he won't let you dump his darlings while he's still bullish.
    if (a < 0 && (id === 'PTON' || id === 'ZM') && t <= 3 && !blocked[t + id] && (shares[id] || 0) * price(id) > 0.5) {
      setInterject({ id, amt: -a }); return;
    }
    if (a > 0) buy(id, a); else if (a < 0) sell(id, -a);
    setPend({ ...pend, [id]: 0 });
  }
  function interjectHold() { setPend({ ...pend, [interject.id]: 0 }); setBlocked({ ...blocked, [t + interject.id]: true }); setInterject(null); }
  function interjectSell() { sell(interject.id, interject.amt); setPend({ ...pend, [interject.id]: 0 }); setBlocked({ ...blocked, [t + interject.id]: true }); setIndep(indep + 1); setInterject(null); }

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

  function restart() { setT(0); setCash(START); setShares({}); setAvg({}); setActs(ACTIONS); setDug({}); setPend({}); setSalDone({}); setHelped(0); setRefused(0); setInterject(null); setBlocked({}); setIndep(0); setFlash(''); setFree(false); setPhase('intro'); }

  if (phase === 'intro') {
    return (
      <div className="pg"><div className="pg-col pg-mid">
        <p className="pg-kick">Investment Time Machine · rent's due</p>
        <h1 className="pg-title">You're broke. Rent is due. Don't get evicted — get free.</h1>
        <ul className="pg-rules">
          <li><b>$4,000 to your name.</b> Rent is <b>$700 every period</b>. Miss it and you're out.</li>
          <li><b>Time is tight.</b> Each period you get <b>3 moves</b> — investigate a company, or grind a side gig for $300.</li>
          <li><b>Investigate for facts, not answers.</b> You get the real numbers, price and news — you decide what they mean.</li>
          <li><b>Cousin Sal will not shut up.</b> He's family, he's confident, and he's usually wrong. Learn when to ignore him.</li>
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
        {indep > 0 && <p className="pg-lead pg-dim">You overruled Sal {indep} time{indep === 1 ? '' : 's'} and trusted your own read. That's the whole point.</p>}
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
        {interject && <SalInterject name={COMPANIES.find((c) => c.id === interject.id).name} onHold={interjectHold} onSell={interjectSell} />}

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
