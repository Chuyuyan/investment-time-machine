import React, { useState, useRef, useEffect } from 'react';

/*
 * AllocLoop — the v2 capital-allocation prototype  (?proto=v2)
 * -----------------------------------------------------------
 * Rebuilt for playability + information (per user feedback):
 *   - You INVESTIGATE each company (real trend, plain-language valuation,
 *     real news, real sentiment) before deciding — attention is scarce, not
 *     information (Design Vision).
 *   - You INVEST under scarce cash — every buy forces a sell or spends cash.
 *   - You MOVE TIME FORWARD with a button that says exactly where it takes you,
 *     and the market answers loudly so the consequence is obvious.
 * One real era: Jan 2019 -> Dec 2021 (COVID crash is the storm). Everything
 * here is real and checkable. Plain language, no finance jargon assumed.
 */

const START = 10000;

const COMPANIES = [
  { id: 'AAPL', name: 'Apple', who: 'Makes the iPhone. The biggest, most profitable company in the world.' },
  { id: 'MSFT', name: 'Microsoft', who: 'Windows, Office, and cloud computing. A steady, boring giant.' },
  { id: 'TSLA', name: 'Tesla', who: 'Electric cars, led by Elon Musk. Adored and doubted in equal measure.' },
  { id: 'ZM', name: 'Zoom', who: 'Video-calling software. Small and new — went public in 2019.' },
  { id: 'DAL', name: 'Delta', who: 'One of the largest airlines in the world.' },
];

const COLORS = { AAPL: '#5b8cff', MSFT: '#2ecc71', TSLA: '#f5a623', ZM: '#c77dff', DAL: '#ff5c5c', CASH: '#5b657a' };

// Real, split-adjusted, checkable monthly closes (approximate). Zoom is not
// public at the first moment.
const MOMENTS = [
  { date: 'January 2019', tag: 'The calm', mood: 'calm',
    context: 'The market is climbing out of a rough end to last year. Nothing feels urgent yet.',
    prices: { AAPL: 42, MSFT: 104, TSLA: 62, ZM: null, DAL: 50 } },
  { date: 'January 2020', tag: 'All-time highs', mood: 'calm',
    context: 'The market has never been higher. A strange new virus is in the news in China. Almost no one is worried.',
    prices: { AAPL: 78, MSFT: 170, TSLA: 130, ZM: 76, DAL: 59 } },
  { date: 'March 2020', tag: 'The crash', mood: 'storm', storm: true,
    context: 'The virus is everywhere. Countries are locking down. In weeks the market has fallen faster than at any time in history.',
    prices: { AAPL: 57, MSFT: 135, TSLA: 100, ZM: 155, DAL: 23 } },
  { date: 'September 2020', tag: 'The everything rally', mood: 'boom',
    context: 'Instead of collapsing, the market roared back. Stuck at home, millions of new traders piled in. Anything touching technology is flying.',
    prices: { AAPL: 116, MSFT: 210, TSLA: 430, ZM: 470, DAL: 31 } },
  { date: 'February 2021', tag: 'Peak euphoria', mood: 'boom',
    context: 'Everyone seems to be getting rich. Meme stocks are in the headlines. Anything that grows fast is priced as if it cannot fail.',
    prices: { AAPL: 121, MSFT: 233, TSLA: 700, ZM: 400, DAL: 46 } },
  { date: 'December 2021', tag: 'The tide turns', mood: 'calm',
    context: 'Prices are rising across the economy and the Federal Reserve signals it will raise interest rates. The fastest-growing, least-profitable companies start to slide.',
    prices: { AAPL: 178, MSFT: 336, TSLA: 1060, ZM: 185, DAL: 39 } },
];

const LAST = MOMENTS.length - 1; // 5 = final reveal

// Per-company, per-moment REAL information the player investigates (indices 0..4).
const INFO = {
  AAPL: [
    { val: 'fair', why: 'Priced around 13–15x its yearly profit — cheap for a company this strong, because investors fear iPhone sales in China are slowing.', news: ['Apple cut its sales forecast — its first warning in years — blaming weak demand in China.'], buzz: 'Wall Street is nervous. A few call it a rare bargain.' },
    { val: 'fair', why: 'The stock nearly doubled in a year. No longer a bargain, but still enormously profitable.', news: ['AirPods and the services business are booming. iPhone sales have stabilized.'], buzz: 'Optimism is back.' },
    { val: 'fair', why: 'Fell with everything else. A cash-rich, profitable company on sale — but no one knows how long lockdowns last.', news: ['Stores closed worldwide. Its supply chain in China is disrupted.'], buzz: 'Fear everywhere. Long-term believers see a discount.' },
    { val: 'expensive', why: 'Recovered and then some. Now priced well above its own historical average.', news: ['Split its stock 4-for-1. Record demand for laptops and iPads from people stuck at home.'], buzz: 'New retail traders are piling in.' },
    { val: 'expensive', why: 'Still pricey, but profits are strong and growing.', news: ['Blowout holiday quarter — record iPhone and services sales.'], buzz: 'Seen as a safe giant amid the frenzy.' },
  ],
  MSFT: [
    { val: 'fair', why: 'Reasonably priced for a steady, growing software and cloud business.', news: ['Its Azure cloud service is growing fast. Steady, boring, reliably profitable.'], buzz: 'Few doubters. Quietly compounding.' },
    { val: 'fair', why: 'Up strongly on cloud growth. Not cheap, but very reliable.', news: ['Its cloud business keeps taking customers from Amazon.'], buzz: 'Considered one of the safest big-tech names.' },
    { val: 'fair', why: 'Dropped in the crash. A profitable cloud giant at a discount.', news: ['Suddenly the whole world needs Teams, Office and Azure to work from home.'], buzz: 'Seen as one of the more crash-resistant businesses.' },
    { val: 'expensive', why: 'Priced richly after a strong run — but the cloud demand behind it is real.', news: ['Cloud and Xbox gaming surge as the world stays indoors.'], buzz: "A crowd favorite for 'safe growth'." },
    { val: 'expensive', why: 'Still expensive; growth stays strong.', news: ['Cloud revenue climbs sharply again.'], buzz: 'The boring winner everyone agrees on.' },
  ],
  TSLA: [
    { val: 'expensive', why: 'Barely makes money, yet priced for enormous future growth. You would be paying for a future that may not arrive.', news: ['Model 3 production is a struggle. Heavy debt. Elon Musk is in constant, chaotic headlines.'], buzz: 'Wall Street mostly hates it — the most bet-against stock in America.' },
    { val: 'expensive', why: 'Doubled in months. Just barely profitable — the price assumes years of domination ahead.', news: ['Posted its first back-to-back profitable quarters. A new factory in China is opening.'], buzz: 'Doubters are starting to sweat. Believers are euphoric.' },
    { val: 'expensive', why: 'Fell hard in the crash, but still expensive for a carmaker that barely earns a profit.', news: ['Factories shut by lockdowns. Whether it has enough cash is a real question.'], buzz: 'Polarizing as ever — a cult following versus loud skeptics.' },
    { val: 'expensive', why: 'Exploded higher after a stock split. Priced like no carmaker in history.', news: ['About to be added to the S&P 500 index. Retail traders are obsessed.'], buzz: "Mania building. 'To the moon.'" },
    { val: 'expensive', why: 'Now worth more than most other carmakers combined. Expectations are gigantic.', news: ['Record cars delivered — but the price assumes it dominates for a decade.'], buzz: 'Peak hype. Some are calling it a bubble.' },
  ],
  ZM: [
    null,
    { val: 'expensive', why: 'Just went public. Sales nearly doubled, but it is small and barely profitable — priced for perfection.', news: ['A hot IPO. A niche business-video app that few ordinary people use yet.'], buzz: 'Loved by growth investors. Unknown to most of the public.' },
    { val: 'expensive', why: 'Rose during the crash as the world locked down — now priced as if the pandemic lasts forever.', news: ["'Zoom' becomes a verb overnight. Downloads explode."], buzz: 'Suddenly a household name.' },
    { val: 'expensive', why: 'Sales up more than 350% — but the price assumes this boom never fades.', news: ['Blowout results. Work, school and family calls all run on Zoom.'], buzz: 'The definitive pandemic stock.' },
    { val: 'expensive', why: 'Growth is slowing from insane to merely fast, yet it is still priced as a forever-winner.', news: ['Vaccines are arriving — will people still Zoom once offices reopen?'], buzz: 'Doubts are creeping in about life after lockdown.' },
  ],
  DAL: [
    { val: 'cheap', why: 'Priced cheaply, like most airlines — a tough, cyclical business that earns thin profits in good years.', news: ['Record travel demand. Airlines are finally profitable after decades of pain.'], buzz: 'Even Warren Buffett owns airlines now.' },
    { val: 'cheap', why: 'Cheap on paper and earning solid profits — but airlines always look cheap, for a reason.', news: ['Strong travel bookings heading into 2020.'], buzz: 'Seen as a steady, unexciting value stock.' },
    { val: 'cheap', why: 'Down about 60%. It looks incredibly cheap — but it is now losing huge amounts of cash with its planes grounded.', news: ['Air travel has collapsed ~95%. Delta is burning roughly $60 million a day. Buffett sells all his airlines.'], buzz: "'Too cheap to ignore' versus 'might not survive'." },
    { val: 'cheap', why: 'Still cheap, still bleeding cash. Its recovery depends entirely on people flying again.', news: ['Planes remain mostly empty. It took on massive debt just to survive.'], buzz: "A bet on 'when', not 'if', travel returns." },
    { val: 'fair', why: 'Bounced on vaccine hope, but its profits are still far below normal.', news: ['Vaccines raise hopes of a travel comeback — someday.'], buzz: 'A favorite of the reopening bet.' },
  ],
};

const VAL_META = {
  cheap: { label: 'Cheap', cls: 'v2-val-cheap' },
  fair: { label: 'Fair price', cls: 'v2-val-fair' },
  expensive: { label: 'Expensive', cls: 'v2-val-exp' },
};

const LESSONS = {
  AAPL: { head: 'Apple — the boring giant', body: 'Dipped in the crash, then compounded from about $42 to $178. Rarely thrilling, rarely a disaster. Owning it was mostly a test of patience.' },
  MSFT: { head: 'Microsoft — the quiet compounder', body: "From about $104 to $336 with almost no drama. The kind of holding that does the work while you're not watching." },
  TSLA: { head: 'Tesla — the moonshot', body: 'From about $62 to over $1,000: roughly 17x. Size it big and you got rich; size it too big and one bad month could have wiped you out. Same stock, opposite outcomes — the difference was position size, not prediction.' },
  ZM: { head: 'Zoom — the darling that reverted', body: 'Looked unstoppable in 2020. It was also the most dangerous thing to buy at the top: from about $470 back to $185. The obvious winner was already priced for a future that never arrived.' },
  DAL: { head: 'Delta — the cheap trap', body: 'Down about 60% in the crash, it looked like free money. But a low price is not a safe price. It recovered slowly and then stalled. "It fell a lot" was never a reason to buy.' },
  CASH: { head: "Cash — boring, until it isn't", body: 'Holding cash meant missing the rally. It was also the only thing that let you buy anything while everyone else was panicking.' },
};

/* ---------- helpers ---------- */
const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
function sPct(x) {
  const v = x * 100;
  return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(Math.abs(v) < 10 ? 1 : 0) + '%';
}
const moveClass = (x) => (x > 0.0005 ? 'up' : x < -0.0005 ? 'down' : 'flat');

function Spark({ series, color, w = 72, h = 26 }) {
  const pts = series.filter((v) => v != null);
  if (pts.length < 2) return <svg className="v2-spark" width={w} height={h} />;
  const min = Math.min(...pts), max = Math.max(...pts), rng = max - min || 1;
  const step = w / (pts.length - 1);
  const d = pts.map((v, i) => `${(i * step).toFixed(1)},${(h - 3 - ((v - min) / rng) * (h - 6)).toFixed(1)}`).join(' ');
  return (
    <svg className="v2-spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={d} fill="none" stroke={color} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function useCountUp(target, dur = 650) {
  const [val, setVal] = useState(target);
  const from = useRef(target);
  const raf = useRef();
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    cancelAnimationFrame(raf.current);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      setVal(a + (target - a) * e);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return val;
}

/* ---------- component ---------- */
export default function AllocLoop() {
  const [phase, setPhase] = useState('intro'); // intro | trade | reflect
  const [mi, setMi] = useState(0);
  const [expanded, setExpanded] = useState(null); // which company card is open
  const [showCoach, setShowCoach] = useState(true);
  const [port, setPort] = useState({
    shares: { AAPL: 0, MSFT: 0, TSLA: 0, ZM: 0, DAL: 0 },
    avg: { AAPL: 0, MSFT: 0, TSLA: 0, ZM: 0, DAL: 0 },
    cash: START,
  });
  const { shares, avg, cash } = port;
  const [history, setHistory] = useState([]);
  const flow = useRef({ buys: 0, sells: 0 });

  const prices = MOMENTS[mi].prices;
  const holdingsValue = COMPANIES.reduce((s, c) => s + shares[c.id] * (prices[c.id] || 0), 0);
  const V = holdingsValue + cash;
  const chunk = Math.max(500, Math.round((V * 0.1) / 100) * 100);
  const shownV = useCountUp(V);

  function buy(id) {
    const p = prices[id];
    if (!p || cash < 1) return;
    flow.current.buys += Math.min(chunk, cash);
    setPort((pr) => {
      if (pr.cash < 1) return pr;
      const a = Math.min(chunk, pr.cash);
      const ns = pr.shares[id] + a / p;
      const na = ns > 0 ? (pr.shares[id] * pr.avg[id] + a) / ns : 0;
      return { shares: { ...pr.shares, [id]: ns }, avg: { ...pr.avg, [id]: na }, cash: pr.cash - a };
    });
  }
  function sell(id, all) {
    const p = prices[id];
    const pos = shares[id] * (p || 0);
    if (pos <= 0) return;
    flow.current.sells += all ? pos : Math.min(chunk, pos);
    setPort((pr) => {
      const pp = pr.shares[id] * (p || 0);
      if (pp <= 0) return pr;
      const a = all ? pp : Math.min(chunk, pp);
      let ns = pr.shares[id] - a / p;
      if (ns < 1e-6) ns = 0;
      return { shares: { ...pr.shares, [id]: ns }, avg: ns === 0 ? { ...pr.avg, [id]: 0 } : pr.avg, cash: pr.cash + a };
    });
  }

  function advance() {
    const alloc = {};
    COMPANIES.forEach((c) => { alloc[c.id] = V > 0 ? (shares[c.id] * (prices[c.id] || 0)) / V : 0; });
    const snap = { mi, date: MOMENTS[mi].date, tag: MOMENTS[mi].tag, storm: !!MOMENTS[mi].storm, V, alloc, net: flow.current.buys - flow.current.sells };
    const next = [...history, snap];
    setExpanded(null);
    if (mi >= LAST - 1) {
      const fp = MOMENTS[LAST].prices;
      const fV = COMPANIES.reduce((s, c) => s + shares[c.id] * (fp[c.id] || 0), 0) + cash;
      const fAlloc = {};
      COMPANIES.forEach((c) => { fAlloc[c.id] = fV > 0 ? (shares[c.id] * (fp[c.id] || 0)) / fV : 0; });
      next.push({ mi: LAST, date: MOMENTS[LAST].date, tag: MOMENTS[LAST].tag, storm: false, V: fV, alloc: fAlloc, net: 0, final: true });
      setHistory(next);
      setMi(LAST);
      setPhase('reflect');
    } else {
      setHistory(next);
      flow.current = { buys: 0, sells: 0 };
      setMi(mi + 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function restart() {
    setPort({ shares: { AAPL: 0, MSFT: 0, TSLA: 0, ZM: 0, DAL: 0 }, avg: { AAPL: 0, MSFT: 0, TSLA: 0, ZM: 0, DAL: 0 }, cash: START });
    setHistory([]);
    flow.current = { buys: 0, sells: 0 };
    setExpanded(null);
    setShowCoach(true);
    setMi(0);
    setPhase('intro');
  }

  /* ---------- intro ---------- */
  if (phase === 'intro') {
    return (
      <div className="screen v2 v2-calm">
        <div className="v2-intro">
          <p className="v2-kicker">Investment Time Machine</p>
          <h1 className="v2-title">Could you have survived market history?</h1>
          <p className="v2-lead">
            You get <b>$10,000</b> and three years of real market history — from January
            2019 through the end of 2021. Real companies. Real prices. Real news.
          </p>
          <div className="v2-steps">
            <div className="v2-stepcard"><span className="v2-stepno">1</span><div><b>Look.</b> Tap any company to read its real story — how its price has moved, whether it's cheap or expensive, what the news says.</div></div>
            <div className="v2-stepcard"><span className="v2-stepno">2</span><div><b>Invest.</b> Your money is limited. To buy more of one thing, you sell something else or spend your cash. Doing nothing is allowed too.</div></div>
            <div className="v2-stepcard"><span className="v2-stepno">3</span><div><b>Move time forward.</b> Jump ahead and watch what the market does to your money. Then decide again.</div></div>
          </div>
          <p className="v2-lead2">You'll live through the 2020 crash. How you're holding when it hits is the whole game.</p>
          <button className="v2-go" onClick={() => setPhase('trade')}>Begin — January 2019</button>
          <p className="v2-foot">Earlier prototype: <code>?proto=core</code></p>
        </div>
      </div>
    );
  }

  /* ---------- reflect ---------- */
  if (phase === 'reflect') {
    const finalV = V;
    const ret = finalV / START - 1;
    const moves = history.filter((h) => !h.final).length;
    let big = { id: null, w: 0, date: '' };
    history.forEach((h) => Object.entries(h.alloc).forEach(([id, w]) => { if (w > big.w) big = { id, w, date: h.date }; }));
    const bigName = big.id ? COMPANIES.find((c) => c.id === big.id).name : null;
    const storm = history.find((h) => h.storm);
    let stormLine = '';
    if (storm) {
      if (storm.net > 300) stormLine = 'When the market crashed in March 2020, you put more money in — you bought while others panicked.';
      else if (storm.net < -300) stormLine = 'When the market crashed in March 2020, you raised cash — you sold into the fear.';
      else stormLine = 'When the market crashed in March 2020, you barely moved — you held your ground and waited it out.';
    }
    const end = COMPANIES
      .map((c) => ({ id: c.id, name: c.name, value: shares[c.id] * prices[c.id], weight: shares[c.id] * prices[c.id] / finalV, gain: avg[c.id] > 0 ? prices[c.id] / avg[c.id] - 1 : 0 }))
      .filter((h) => h.value > 0.5)
      .sort((a, b) => b.value - a.value);

    return (
      <div className="screen v2 v2-calm">
        <p className="v2-kicker">December 2021 — the era ends</p>
        <div className="v2-final">
          <span className="v2-final-label">Your $10,000 became</span>
          <span className="v2-final-num">{fmt(finalV)}</span>
          <span className={'v2-final-ret ' + moveClass(ret)}>{sPct(ret)} over three years</span>
        </div>

        <h2 className="v2-h2">How you played</h2>
        <p className="v2-mirror">You reshaped your money <b>{moves}</b> times across three years.</p>
        {bigName && (
          <p className="v2-mirror">
            {big.w >= 0.4
              ? <>Your biggest bet was <b>{bigName}</b> — at one point it was <b>{Math.round(big.w * 100)}%</b> of everything you owned ({big.date}). Concentration cuts both ways.</>
              : <>You stayed fairly spread out — your largest single holding, <b>{bigName}</b>, never went past <b>{Math.round(big.w * 100)}%</b> of your money.</>}
          </p>
        )}
        {stormLine && <p className="v2-mirror">{stormLine}</p>}

        <h2 className="v2-h2">Where you ended up</h2>
        {end.map((h) => (
          <div className="v2-endrow" key={h.id}>
            <span className="v2-dot" style={{ background: COLORS[h.id] }} />
            <span className="v2-endname">{h.name}</span>
            <span className="v2-endval">{fmt(h.value)} · {Math.round(h.weight * 100)}%</span>
            <span className={'v2-endgain ' + moveClass(h.gain)}>{sPct(h.gain)}</span>
          </div>
        ))}
        <div className="v2-endrow">
          <span className="v2-dot" style={{ background: COLORS.CASH }} />
          <span className="v2-endname">Cash</span>
          <span className="v2-endval">{fmt(cash)} · {Math.round((cash / finalV) * 100)}%</span>
          <span className="v2-endgain flat">—</span>
        </div>

        <h2 className="v2-h2">What actually happened</h2>
        {[...COMPANIES.map((c) => c.id), 'CASH'].map((id) => (
          <div className="v2-lesson" key={id}>
            <p className="v2-lesson-head" style={{ color: COLORS[id] }}>{LESSONS[id].head}</p>
            <p className="v2-lesson-body">{LESSONS[id].body}</p>
          </div>
        ))}

        <div className="v2-bridge">
          <p><b>Every company, price, and event here is real.</b> The winners weren't found by predicting the future — they came from how much you risked and what you did when everyone panicked. You can look all of this up yourself:</p>
          <ul>
            <li><b>SEC EDGAR</b> — company filings and insider trades</li>
            <li><b>Yahoo Finance</b> — prices, news, earnings</li>
            <li><b>Company investor-relations pages</b> — the source</li>
            <li><b>Macrotrends</b> — decades of history</li>
            <li><b>TradingView</b> — charts</li>
          </ul>
          <p className="v2-bridge-close">Nothing you just practiced only works inside this game.</p>
        </div>

        <button className="v2-go" onClick={restart}>Play the era again</button>
      </div>
    );
  }

  /* ---------- trade ---------- */
  const M = MOMENTS[mi];
  const prevV = history.length ? history[history.length - 1].V : null;
  const portMove = prevV ? V / prevV - 1 : null;
  const nextDate = MOMENTS[mi + 1].date;
  const btn = M.storm
    ? { label: 'Ride out the crash →', sub: `Jump to ${nextDate} and see what survived.` }
    : mi === LAST - 1
      ? { label: 'See how it all ends →', sub: 'Jump to December 2021 — the final result.' }
      : { label: 'Move time forward →', sub: `Jump to ${nextDate} and see what happens to your money.` };

  const segs = COMPANIES.map((c) => ({ id: c.id, w: V > 0 ? shares[c.id] * (prices[c.id] || 0) / V : 0 }))
    .concat([{ id: 'CASH', w: V > 0 ? cash / V : 0 }])
    .filter((s) => s.w > 0.001);

  return (
    <div className={'screen v2 v2-' + M.mood}>
      {/* timeline */}
      <div className="v2-timeline">
        {MOMENTS.map((m, i) => (
          <div key={i} className={'v2-tl-node ' + (i === mi ? 'now' : i < mi ? 'past' : 'future') + (m.storm ? ' storm' : '')} title={m.date} />
        ))}
      </div>

      <div className="v2-scene">
        <span className="v2-step">Step {mi + 1} of {LAST}</span>
        <h1 className="v2-date">{M.date}</h1>
        <span className="v2-tag">{M.tag}</span>
        <p className="v2-context">{M.context}</p>
      </div>

      {/* what advancing did — the loud consequence */}
      {portMove != null && (
        <div className={'v2-result ' + (M.storm ? 'storm' : moveClass(portMove))}>
          <span className="v2-result-time">{MOMENTS[mi - 1].date} → {M.date}</span>
          <span className="v2-result-money">{fmt(prevV)} → <b>{fmt(V)}</b></span>
          <span className={'v2-result-pct ' + moveClass(portMove)}>{sPct(portMove)}</span>
          {M.storm && <span className="v2-result-note">The crash hit. Everything is cheap — and terrifying. What do you do?</span>}
        </div>
      )}

      {/* your money */}
      <div className="v2-money">
        <div className="v2-money-row">
          <div><span className="v2-money-label">Your money</span><span className="v2-money-num">{fmt(shownV)}</span></div>
          <div className="v2-money-right"><span className="v2-money-label">Cash to spend</span><span className={'v2-money-cash ' + (cash > 1 ? 'has' : 'none')}>{fmt(cash)}</span></div>
        </div>
        <div className="v2-shape">
          {segs.map((s) => <div key={s.id} className="v2-shape-seg" style={{ width: (s.w * 100) + '%', background: COLORS[s.id] }} title={s.id} />)}
        </div>
      </div>

      {/* coach — first moment only */}
      {mi === 0 && showCoach && (
        <div className="v2-coach">
          <p className="v2-coach-title">New to this? Here's the whole game:</p>
          <p><b>1.</b> Tap a company below to read its real story.</p>
          <p><b>2.</b> Buy what you believe in — but your cash is limited, so every buy is a trade-off.</p>
          <p><b>3.</b> Press <b>Move time forward</b> to jump ahead and see how you did.</p>
          <p className="v2-coach-tip">A low price isn't the same as a good deal — a company can be cheap because it's in trouble. Look at whether it's growing and how much hope is already baked into the price.</p>
          <button className="v2-coach-x" onClick={() => setShowCoach(false)}>Got it</button>
        </div>
      )}

      <p className="v2-market-head">The market — tap a company to investigate</p>

      {COMPANIES.map((c) => {
        const p = prices[c.id];
        const pp = mi > 0 ? MOMENTS[mi - 1].prices[c.id] : null;
        const mv = p && pp ? p / pp - 1 : null;
        const justListed = p && !pp && mi > 0;
        const pos = shares[c.id] * (p || 0);
        const w = V > 0 ? pos / V : 0;
        const gain = shares[c.id] > 0 && avg[c.id] > 0 ? p / avg[c.id] - 1 : 0;
        const info = INFO[c.id][mi];
        const series = MOMENTS.slice(0, mi + 1).map((m) => m.prices[c.id]);
        const open = expanded === c.id;
        const notPublic = !p;

        return (
          <div className={'v2-card' + (open ? ' open' : '') + (notPublic ? ' locked' : '')} key={c.id}>
            <button className="v2-card-head" onClick={() => !notPublic && setExpanded(open ? null : c.id)} disabled={notPublic}>
              <div className="v2-card-top">
                <div className="v2-co"><span className="v2-dot" style={{ background: COLORS[c.id] }} /><span className="v2-name">{c.name}</span></div>
                <div className="v2-priceblock">
                  {p ? <>
                    <span className="v2-price">${p.toLocaleString('en-US')}</span>
                    {mv != null && <span className={'v2-move ' + moveClass(mv)}>{sPct(mv)}</span>}
                    {justListed && <span className="v2-move flat">new</span>}
                  </> : <span className="v2-na">not public yet</span>}
                </div>
              </div>
              {!notPublic && (
                <div className="v2-card-bottom">
                  <Spark series={series} color={COLORS[c.id]} />
                  {info && <span className={'v2-val ' + VAL_META[info.val].cls}>{VAL_META[info.val].label}</span>}
                  {pos > 0.5
                    ? <span className="v2-owned">You own {fmt(pos)} · {Math.round(w * 100)}% <em className={moveClass(gain)}>{sPct(gain)}</em></span>
                    : <span className="v2-tapcue">{open ? 'Close' : 'Tap to investigate'}</span>}
                </div>
              )}
            </button>

            {open && info && (
              <div className="v2-detail">
                <p className="v2-who">{c.who}</p>
                <div className="v2-fact"><span className="v2-fact-k">Price so far</span><span className="v2-fact-v">{mv != null ? <>{sPct(mv)} since {MOMENTS[mi - 1].date}. </> : ''}See the line above.</span></div>
                <div className="v2-fact"><span className="v2-fact-k">Value</span><span className="v2-fact-v"><b className={VAL_META[info.val].cls}>{VAL_META[info.val].label}.</b> {info.why}</span></div>
                <div className="v2-fact"><span className="v2-fact-k">News</span><span className="v2-fact-v">{info.news.join(' ')}</span></div>
                <div className="v2-fact"><span className="v2-fact-k">What people say</span><span className="v2-fact-v">{info.buzz}</span></div>

                <div className="v2-trade">
                  <div className="v2-trade-btns">
                    <button className="v2-btn" disabled={pos <= 0.5} onClick={() => sell(c.id, true)}>Sell all</button>
                    <button className="v2-btn" disabled={pos <= 0.5} onClick={() => sell(c.id, false)}>Sell {fmt(Math.min(chunk, pos || chunk))}</button>
                    <button className="v2-btn buy" disabled={cash < 1} onClick={() => buy(c.id)}>Buy {fmt(Math.min(chunk, cash))}</button>
                  </div>
                  <p className="v2-trade-note">
                    {cash < 1
                      ? "You're out of cash. To buy this, sell something you own first."
                      : `Buying spends your cash (${fmt(cash)} left). Every dollar here is a dollar not somewhere else.`}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="v2-action">
        <button className="v2-go" onClick={advance}>{btn.label}</button>
        <p className="v2-action-sub">{btn.sub}</p>
      </div>
    </div>
  );
}
