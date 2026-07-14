import React, { useState } from 'react';

/*
 * PressureGame — "Rent's Due"  (?proto=pressure)
 * ----------------------------------------------
 * Steals Do Not Feed the Monkeys' real engine: economic survival pressure.
 * You're a broke new investor. RENT is due every month; miss it and you're
 * out. Each month you have limited TIME (a few actions) — dig a clue, or grind
 * a side gig for survival cash. LEADS point you at opportunities with a
 * window. You research (plain clues + "what it means"), allocate, then time
 * advances: the market moves and rent hits. Goal isn't a score — it's ESCAPE:
 * grow your money faster than your bills until you're free. NOT a life-sim: no
 * eating/sleeping chores — only money + time pressure. Real 2020 market.
 */

const START = 4000;
const RENT = 700;       // due every month
const ACTIONS = 3;      // time per month
const GIG = 300;        // side-gig cash per action
const FREEDOM = 15000;  // net worth to escape

const MONTHS = ['February 2020', 'March 2020', 'April 2020', 'June 2020', 'September 2020', 'December 2020'];
const HEADLINE = [
  'Markets near record highs. A new virus is spreading in China — almost no one is worried.',
  'THE CRASH. Lockdowns hit and the market falls faster than at any time in history.',
  'Panic eases as governments flood the world with money. A few stocks are bouncing hard.',
  'Stuck-at-home stocks are on fire. Millions of new traders flood the market.',
  'The rally is everywhere — anything tech-related keeps ripping higher.',
  'Vaccines arrive. The winners and losers of 2020 are finally clear.',
];

const COMPANIES = [
  { id: 'AAPL', name: 'Apple', prices: [68, 63, 73, 91, 112, 132] },
  { id: 'TSLA', name: 'Tesla', prices: [133, 102, 156, 215, 430, 705] },
  { id: 'ZM', name: 'Zoom', prices: [105, 146, 149, 253, 465, 337] },
  { id: 'DAL', name: 'Delta', prices: [47, 23, 24, 28, 31, 40] },
  { id: 'MRNA', name: 'Moderna', prices: [26, 29, 46, 58, 66, 104] },
];
const COLORS = { AAPL: '#3f6fb0', TSLA: '#c9962f', ZM: '#8a5cc0', DAL: '#b23a34', MRNA: '#2b9c8f', CASH: '#8a7a5c' };

// Plain clues, each with a dead-simple "what this means for you". Some are noise.
const CLUES = {
  AAPL: [
    { t: 'Apple makes huge profits and sits on a mountain of cash.', m: 'A sturdy business — very unlikely to go bust.' },
    { t: 'Its stores are shut worldwide by lockdowns.', m: 'Short-term pain, but people still want iPhones later.' },
    { t: "The price isn't cheap, but it isn't crazy either.", m: "You'd pay a fair price for a strong company." },
  ],
  TSLA: [
    { t: 'Tesla barely makes money and carries heavy debt.', m: 'Risky — a bad year could hurt it badly.' },
    { t: 'Factories are shut, but demand for its cars stays strong.', m: 'If it survives the cash crunch, the growth is real.' },
    { t: 'Priced like a tech giant while building very few cars.', m: 'Enormous expectations are baked in — it must deliver.' },
  ],
  ZM: [
    { t: 'Everyone is suddenly working and studying over Zoom.', m: 'Explosive, real growth happening right now.' },
    { t: 'It trades at about 50× its yearly sales.', m: 'Very expensive — only worth it if the boom lasts for years.' },
    { t: '#Zoom is trending; celebrities keep posting about it.', m: 'That’s hype, not business. Easy to get swept up in.', noise: true },
  ],
  DAL: [
    { t: 'Air travel has collapsed ~95%. Delta burns cash every day.', m: 'In real danger while its planes sit empty.' },
    { t: 'The stock is down ~60% — it looks cheap.', m: 'Cheap is not safe: a low price can keep falling.' },
    { t: 'Warren Buffett just sold every airline he owned.', m: 'A famous, careful investor sees real danger here.' },
  ],
  MRNA: [
    { t: 'A tiny company racing to make a COVID vaccine.', m: 'Huge upside if it works — near-worthless if it fails.' },
    { t: 'It has no approved product and makes no money yet.', m: 'This is a bet on the future, not the present.' },
    { t: 'Governments are lining up to fund vaccine makers.', m: 'Real money could arrive fast if its trials succeed.' },
  ],
};

const LEADS = [
  [{ id: 'ZM', why: 'Downloads are exploding as offices close.' }],
  [{ id: 'DAL', why: 'Airlines are in free-fall — bargain, or trap?' }, { id: 'MRNA', why: 'A vaccine race is starting; one tiny company is in it.' }],
  [{ id: 'TSLA', why: 'It bounced hard off the bottom — momentum is building.' }],
  [{ id: 'ZM', why: 'Zoom is everywhere now — but how long can it last?' }],
  [{ id: 'AAPL', why: 'Even steady Apple is ripping as retail traders pile in.' }],
  [],
];

const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
const sPct = (x) => { const v = x * 100; return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(Math.abs(v) < 10 ? 1 : 0) + '%'; };
const cls = (x) => (x > 0.005 ? 'up' : x < -0.005 ? 'down' : 'flat');

export default function PressureGame() {
  const [phase, setPhase] = useState('intro'); // intro | play | dead | end
  const [t, setT] = useState(0);
  const [cash, setCash] = useState(START);
  const [shares, setShares] = useState({});
  const [avg, setAvg] = useState({});
  const [acts, setActs] = useState(ACTIONS);
  const [dug, setDug] = useState({});      // id -> count revealed
  const [flash, setFlash] = useState('');  // transient message on advance
  const [free, setFree] = useState(false);

  const price = (id) => COMPANIES.find((c) => c.id === id).prices[t];
  const holdings = COMPANIES.reduce((s, c) => s + (shares[c.id] || 0) * price(c.id), 0);
  const net = cash + holdings;
  const leadIds = new Set((LEADS[t] || []).map((l) => l.id));

  function dig(id) {
    const n = dug[id] || 0; if (acts <= 0 || n >= CLUES[id].length) return;
    setDug({ ...dug, [id]: n + 1 }); setActs(acts - 1);
  }
  function gig() { if (acts <= 0) return; setCash(cash + GIG); setActs(acts - 1); }
  function buy(id, amt) {
    const p = price(id); const a = Math.min(amt, cash); if (a < 1) return;
    const ns = (shares[id] || 0) + a / p; const na = ns > 0 ? (((shares[id] || 0) * (avg[id] || 0)) + a) / ns : 0;
    setShares({ ...shares, [id]: ns }); setAvg({ ...avg, [id]: na }); setCash(cash - a);
  }
  function sell(id) {
    const p = price(id); const pos = (shares[id] || 0) * p; if (pos <= 0) return;
    setShares({ ...shares, [id]: 0 }); setAvg({ ...avg, [id]: 0 }); setCash(cash + pos);
  }

  function endMonth() {
    if (cash < RENT) { setFlash(`You're ${fmt(RENT - cash)} short on rent. Sell a holding to cover it — or you're out.`); return; }
    const afterRent = cash - RENT;
    const nt = t + 1;
    if (nt > MONTHS.length - 1) { setCash(afterRent); setPhase('end'); return; }
    // net worth on the NEXT month's prices
    const nextNet = afterRent + COMPANIES.reduce((s, c) => s + (shares[c.id] || 0) * c.prices[nt], 0);
    setCash(afterRent); setT(nt); setActs(ACTIONS); setFlash('');
    if (nextNet >= FREEDOM) { setFree(true); setPhase('end'); return; }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function restart() { setT(0); setCash(START); setShares({}); setAvg({}); setActs(ACTIONS); setDug({}); setFlash(''); setFree(false); setPhase('intro'); }

  /* ---------- intro ---------- */
  if (phase === 'intro') {
    return (
      <div className="pg"><div className="pg-col pg-mid">
        <p className="pg-kick">Investment Time Machine · rent's due</p>
        <h1 className="pg-title">You're broke. Rent is due. Don't get evicted — get free.</h1>
        <ul className="pg-rules">
          <li><b>$4,000 to your name.</b> Rent is <b>$700 every month</b>. Miss it and you're out.</li>
          <li><b>Time is tight.</b> Each month you get <b>3 moves</b> — dig up a clue, or grind a side gig for $300.</li>
          <li><b>Invest to escape.</b> Grinding keeps you alive; only investing well gets you <b>free</b> ({fmt(FREEDOM)}).</li>
          <li>It's <b>early 2020</b>. A crash is coming. Rent won't wait for it.</li>
        </ul>
        <button className="pg-btn pg-primary" onClick={() => setPhase('play')}>Start — February 2020 →</button>
      </div></div>
    );
  }

  /* ---------- end ---------- */
  if (phase === 'end' || phase === 'dead') {
    const won = free || net >= FREEDOM;
    return (
      <div className="pg"><div className="pg-col pg-mid">
        <p className="pg-kick">{phase === 'dead' ? 'Evicted' : won ? 'You made it out' : 'December 2020'}</p>
        <h1 className="pg-title">{phase === 'dead' ? "You couldn't make rent." : won ? "You're free." : 'You survived the year.'}</h1>
        <div className="pg-final"><span>Net worth</span><b className={cls(net / START - 1)}>{fmt(net)}</b></div>
        <p className="pg-lead">{phase === 'dead'
          ? 'The market turned before your money did, and the rent didn\'t care. That\'s the pressure real investors feel — you can\'t only be right, you have to survive long enough to be right.'
          : won
            ? `You grew $4,000 into ${fmt(net)} while the bills never stopped — enough that your money now works harder than your rent. That's escape velocity.`
            : `You kept the lights on through the worst crash in history. You didn't get rich, but you didn't get evicted — and you learned what pressure does to a decision.`}</p>
        <button className="pg-btn pg-primary" onClick={restart}>Run it again →</button>
      </div></div>
    );
  }

  /* ---------- play ---------- */
  const rentDanger = cash < RENT;
  return (
    <div className={'pg' + (t === 1 ? ' pg-storm' : '')}>
      <div className="pg-col">
        {/* pressure bar */}
        <div className="pg-bar">
          <div className="pg-bar-l"><span className="pg-month">{MONTHS[t]}</span><span className="pg-sub">Month {t + 1} of {MONTHS.length}</span></div>
          <div className="pg-bar-r">
            <div className={'pg-rent' + (rentDanger ? ' danger' : '')}><span>Rent due</span><b>{fmt(RENT)}</b></div>
          </div>
        </div>
        <div className="pg-stats">
          <div className="pg-stat"><span>Cash</span><b className={rentDanger ? 'down' : ''}>{fmt(cash)}</b></div>
          <div className="pg-stat"><span>Invested</span><b>{fmt(holdings)}</b></div>
          <div className="pg-stat"><span>Net worth</span><b>{fmt(net)}</b></div>
          <div className="pg-stat pg-freedom"><span>Freedom</span><b>{Math.round(net / FREEDOM * 100)}%</b></div>
        </div>

        <p className="pg-headline">{HEADLINE[t]}</p>
        {flash && <p className="pg-flash">{flash}</p>}

        {/* time */}
        <div className="pg-time">
          <span className="pg-time-lbl">Time this month</span>
          <span className="pg-pips">{Array.from({ length: ACTIONS }).map((_, i) => <span key={i} className={'pg-pip' + (i < acts ? ' on' : '')} />)}</span>
          <button className="pg-gig" disabled={acts <= 0} onClick={gig}>Side gig +{fmt(GIG)}</button>
        </div>

        {(LEADS[t] || []).length > 0 && (
          <div className="pg-leads">
            <span className="pg-leads-h">📣 Leads worth a look</span>
            {LEADS[t].map((l, i) => <p key={i} className="pg-lead-row"><b>{COMPANIES.find((c) => c.id === l.id).name}</b> — {l.why}</p>)}
          </div>
        )}

        {/* market */}
        {COMPANIES.map((c) => {
          const p = price(c.id); const prev = t > 0 ? c.prices[t - 1] : null; const mv = prev ? p / prev - 1 : null;
          const pos = (shares[c.id] || 0) * p; const g = (shares[c.id] || 0) > 0 && (avg[c.id] || 0) > 0 ? p / avg[c.id] - 1 : 0;
          const revealed = dug[c.id] || 0; const more = revealed < CLUES[c.id].length;
          const small = Math.max(500, Math.round(cash * 0.15 / 100) * 100), big = Math.max(500, Math.round(cash * 0.4 / 100) * 100);
          return (
            <div className={'pg-card' + (leadIds.has(c.id) ? ' lead' : '')} key={c.id}>
              <div className="pg-card-top">
                <span className="pg-co"><span className="pg-dot" style={{ background: COLORS[c.id] }} />{c.name}{leadIds.has(c.id) && <span className="pg-tag">lead</span>}</span>
                <span className="pg-pb"><b>${p}</b>{mv != null && <span className={'pg-mv ' + cls(mv)}>{sPct(mv)}</span>}</span>
              </div>
              {pos > 0.5 && <div className="pg-own">you hold {fmt(pos)} <em className={cls(g)}>{sPct(g)}</em></div>}

              {revealed > 0 && (
                <div className="pg-clues">
                  {CLUES[c.id].slice(0, revealed).map((cl, i) => (
                    <div className={'pg-clue' + (cl.noise ? ' noise' : '')} key={i}><p className="pg-clue-t">{cl.t}</p><p className="pg-clue-m">→ {cl.m}</p></div>
                  ))}
                </div>
              )}

              <div className="pg-actions">
                <button className="pg-dig" disabled={acts <= 0 || !more} onClick={() => dig(c.id)}>{!more ? 'fully researched' : revealed === 0 ? 'Investigate (1 move)' : 'Dig deeper (1 move)'}</button>
              </div>
              <div className="pg-trade">
                <button className="pg-t" disabled={cash < 1} onClick={() => buy(c.id, small)}>Buy {fmt(small)}</button>
                <button className="pg-t" disabled={cash < 1} onClick={() => buy(c.id, big)}>Buy big {fmt(big)}</button>
                <button className="pg-t sell" disabled={pos <= 0.5} onClick={() => sell(c.id)}>Sell all</button>
              </div>
            </div>
          );
        })}

        <button className={'pg-btn pg-primary pg-end' + (rentDanger ? ' danger' : '')} onClick={endMonth}>
          {rentDanger ? `Pay rent ${fmt(RENT)} — you're short` : `End month · pay ${fmt(RENT)} rent →`}
        </button>
        <p className="pg-endsub">{t === MONTHS.length - 1 ? 'Last month — then we settle up.' : `Then it's ${MONTHS[t + 1]}. The market moves. Rent comes again.`}</p>
      </div>
    </div>
  );
}
