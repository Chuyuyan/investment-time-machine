import React, { useState } from 'react';

/*
 * PressureGame — "Rent's Due"  (?proto=pressure)
 * ----------------------------------------------
 * Economic survival pressure (from Do Not Feed the Monkeys) + a real market
 * arc with REAL losers + a recurring character for variety & events.
 *   - RENT every period; miss it and you're evicted.
 *   - Limited TIME (moves): dig a clue, or grind a side gig for survival cash.
 *   - Clues UPDATE every period and explain WHY a stock moved.
 *   - Trade with a free-choice SLIDER (drag left to sell, right to buy).
 *   - Cousin SAL drops in with life shocks, hot tips, and comic relief.
 * Feb 2020 -> Jun 2022: the COVID crash, the mania, and the 2022 bust — so
 * chasing hype and holding into the collapse actually hurts. Real (approx)
 * prices. Goal = ESCAPE ($15k), not a score.
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
  { id: 'AAPL', name: 'Apple', prices: [68, 63, 116, 121, 165, 137] },
  { id: 'TSLA', name: 'Tesla', prices: [133, 102, 430, 700, 1140, 700] },
  { id: 'ZM', name: 'Zoom', prices: [105, 146, 470, 400, 250, 110] },
  { id: 'DAL', name: 'Delta', prices: [47, 23, 31, 46, 38, 31] },
  { id: 'MRNA', name: 'Moderna', prices: [26, 29, 67, 150, 300, 140] },
  { id: 'PTON', name: 'Peloton', prices: [27, 27, 100, 145, 55, 12] },
];
const COLORS = { AAPL: '#3f6fb0', TSLA: '#c9962f', ZM: '#8a5cc0', DAL: '#b23a34', MRNA: '#2b9c8f', PTON: '#d0678f', CASH: '#8a7a5c' };

// One clue PER PERIOD, per company — each explains what happened / why it moved.
const CLUES = {
  AAPL: [
    { t: 'Steady and hugely profitable — but the China virus threatens its factories.', m: 'Strong company; short-term supply risk.' },
    { t: 'Crashing with everything; stores closing worldwide.', m: 'It fell with the market, not because it broke.' },
    { t: 'Stuck-at-home demand for Macs and iPads is booming; it split its stock.', m: 'The lockdown is helping its sales.' },
    { t: 'Record profits; investors treat it as the safe giant amid the mania.', m: 'Boring and reliable while others gamble.' },
    { t: 'Still growing, but now pricey and everything is frothy.', m: 'Great business, rich price.' },
    { t: 'Falls with the market as rates rise — but its profits hold up.', m: 'A real business survives the bust, with a dip.' },
  ],
  TSLA: [
    { t: 'Just turned its first tiny profits, but heavy debt; the most-hated stock in America.', m: 'Improving, but fragile.' },
    { t: 'Crushed in the panic; its factories are shutting.', m: 'Risky names fall the hardest.' },
    { t: 'Reopens in defiance; deliveries beat; the doubters capitulate.', m: 'The story flips to "unstoppable".' },
    { t: 'Joins the S&P 500; retail mania at fever pitch.', m: 'Hype and index-buying, not fundamentals.' },
    { t: 'Now worth more than the next several carmakers combined.', m: 'Enormous expectations are priced in.' },
    { t: 'Falls hard as rates bite — but it actually makes real money now.', m: 'Even winners drop in a bust; this one earns.' },
  ],
  ZM: [
    { t: 'A tiny video-call app almost nobody used — until lockdowns loomed.', m: 'Small and pricey, but in the right place.' },
    { t: 'The rare stock RISING in the crash as offices close.', m: 'Its growth explodes while all else falls.' },
    { t: 'Revenue up 350%+; "to Zoom" is a verb; priced at ~50× sales.', m: 'Real boom — but perfection is priced in.' },
    { t: 'Growth cooling from insane to merely fast; the price is still sky-high.', m: 'The easy money is already made.' },
    { t: 'Vaccines mean offices reopen; its growth is stalling.', m: 'The reason it soared is now reversing.' },
    { t: 'Back near where it started — the whole pandemic bump is gone.', m: 'Chasing it at the top was a trap.' },
  ],
  DAL: [
    { t: 'An airline — fine now, but the virus threatens travel.', m: 'Cheap, but very exposed.' },
    { t: 'Travel down ~95%; burning cash; Buffett dumps every airline.', m: 'Cheap and getting cheaper — real ruin risk.' },
    { t: 'Bailed out by governments; survives, but planes stay half-empty.', m: "Survival isn't recovery." },
    { t: 'Reopening hope lifts it, but it is still losing money.', m: 'A bet on travel returning someday.' },
    { t: 'Travel recovers slowly; still below pre-COVID.', m: 'A grind, not a rocket.' },
    { t: 'Still below where it started two years ago.', m: '"Cheap" stayed cheap the whole time.' },
  ],
  MRNA: [
    { t: 'A tiny biotech with no products — now racing on a COVID vaccine.', m: 'A pure bet on unproven science.' },
    { t: 'The pandemic explodes; interest in vaccine makers surges.', m: 'Fear itself is fuel for this one.' },
    { t: 'Vaccine in trials; first government contracts signed.', m: 'Real progress; it could still fail.' },
    { t: 'Vaccine authorized — billions in real revenue arrive.', m: 'The gamble paid off.' },
    { t: 'Minting money from boosters — but what comes after COVID?', m: 'Huge profits, uncertain future.' },
    { t: 'Fades as the pandemic winds down; profits will shrink.', m: 'A moonshot that round-tripped for latecomers.' },
  ],
  PTON: [
    { t: 'Sells premium exercise bikes; newly public, not yet profitable.', m: 'Cool product, unproven business.' },
    { t: 'Gyms closing — suddenly everyone wants a home bike.', m: 'Lockdown could be its big break.' },
    { t: 'Bikes sold out for months; sales exploding.', m: 'The boom is real — for now.' },
    { t: 'Priced as if everyone works out at home forever.', m: 'Danger: it assumes the boom never ends.' },
    { t: 'Gyms reopen; growth stalls; unsold inventory piles up.', m: 'The story is breaking.' },
    { t: 'Collapsed ~90% from its peak as demand vanished.', m: 'The classic "this trend lasts forever" trap.' },
  ],
};

const LEADS = [
  [{ id: 'ZM', why: 'Downloads exploding as offices close.' }],
  [{ id: 'DAL', why: 'Airlines in free-fall — bargain, or trap?' }, { id: 'MRNA', why: 'A vaccine race is starting; one tiny firm is in it.' }],
  [{ id: 'TSLA', why: 'It bounced hard off the bottom — momentum building.' }],
  [{ id: 'PTON', why: 'Home-fitness mania — is it real or a fad?' }],
  [{ id: 'TSLA', why: 'Everything is euphoric. Is this the top?' }],
  [],
];

// Cousin Sal — a recurring Crazy-Dave-style character who pops in from the side.
const SAL = [
  { mood: 'hype', line: "Cuz! I dumped my whole bonus into Peloton — everyone's gonna work out at home, we're gonna be RICH. You should get in too!", choices: [{ label: "Thanks, Sal — I'll look into it" }] },
  { mood: 'worried', line: "It's bad, cuz — Mom's back in the hospital and I'm wiped out. I need $500 for her meds. Can you spot me?", choices: [{ label: 'Give him $500', need: 500, eff: { cash: -500 }, note: 'Family. The rent still comes anyway.' }, { label: "I can't right now", eff: {} }] },
  null,
  { mood: 'greedy', line: "Everyone's getting rich! My guy runs a newsletter — $200 and he hands you the next 10×. He swears Peloton and Zoom are going to the moon. In or out?", choices: [{ label: 'Buy the tip ($200)', need: 200, eff: { cash: -200, reveal: ['PTON', 'ZM'] }, note: 'You pay — then actually research them yourself.' }, { label: 'Pass', eff: {} }] },
  { mood: 'manic', line: "I re-mortgaged the house and put it ALL into Peloton and Zoom. We're gonna be legends, cuz!!", choices: [{ label: 'Sal… please be careful' }, { label: 'Nice, me too' }] },
  { mood: 'broke', line: "I lost it all, cuz. Peloton, Zoom, everything — moving back in with Mom. That newsletter guy? Total fraud.", choices: [{ label: 'Say something kind' }] },
];

// An original, animated SVG character in the spirit of Crazy Dave: pops in from
// the side, bobs, and pulls a different face for each mood.
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
  else face = (<> {/* broke */}
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
  const [flash, setFlash] = useState('');
  const [free, setFree] = useState(false);

  const price = (id) => COMPANIES.find((c) => c.id === id).prices[t];
  const holdings = COMPANIES.reduce((s, c) => s + (shares[c.id] || 0) * price(c.id), 0);
  const net = cash + holdings;
  const leadIds = new Set((LEADS[t] || []).map((l) => l.id));
  const sal = SAL[t] && !salDone[t] ? SAL[t] : null;

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
    if (e.cash) setCash(cash + e.cash);
    if (e.reveal) { const nd = { ...dug }; e.reveal.forEach((id) => { nd[id] = true; }); setDug(nd); }
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

  function restart() { setT(0); setCash(START); setShares({}); setAvg({}); setActs(ACTIONS); setDug({}); setPend({}); setSalDone({}); setFlash(''); setFree(false); setPhase('intro'); }

  if (phase === 'intro') {
    return (
      <div className="pg"><div className="pg-col pg-mid">
        <p className="pg-kick">Investment Time Machine · rent's due</p>
        <h1 className="pg-title">You're broke. Rent is due. Don't get evicted — get free.</h1>
        <ul className="pg-rules">
          <li><b>$4,000 to your name.</b> Rent is <b>$700 every period</b>. Miss it and you're out.</li>
          <li><b>Time is tight.</b> Each period you get <b>3 moves</b> — dig up a clue, or grind a side gig for $300.</li>
          <li><b>Invest to escape.</b> Grinding keeps you alive; only investing well gets you <b>free</b> ({fmt(FREEDOM)}).</li>
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

        {sal && <SalOverlay sal={sal} cash={cash} onPick={salPick} />}

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
          const researched = dug[c.id]; const clue = CLUES[c.id][t];
          const pd = pend[c.id] || 0; const canTrade = pos >= 1 || cash >= 1;
          return (
            <div className={'pg-card' + (leadIds.has(c.id) ? ' lead' : '')} key={c.id}>
              <div className="pg-card-top">
                <span className="pg-co"><span className="pg-dot" style={{ background: COLORS[c.id] }} />{c.name}{leadIds.has(c.id) && <span className="pg-tag">lead</span>}</span>
                <span className="pg-pb"><b>${p}</b>{mv != null && <span className={'pg-mv ' + cls(mv)}>{sPct(mv)}</span>}</span>
              </div>
              {pos > 0.5 && <div className="pg-own">you hold {fmt(pos)} <em className={cls(g)}>{sPct(g)}</em></div>}

              {researched
                ? <div className="pg-clues"><div className="pg-clue"><p className="pg-clue-t">{clue.t}</p><p className="pg-clue-m">→ {clue.m}</p></div></div>
                : <button className="pg-dig" disabled={acts <= 0} onClick={() => dig(c.id)}>{acts <= 0 ? 'no moves left this period' : mv != null ? `Investigate — why did it move ${sPct(mv)}? (1 move)` : 'Investigate (1 move)'}</button>}

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
