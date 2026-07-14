import React, { useState, useRef, useEffect } from 'react';

/*
 * DeskGame — the "Living Financial Desk" MVP  (?proto=game)
 * --------------------------------------------------------
 * Built 100% from the Design Vision. The screen is YOUR investing desk. It
 * fills with real objects that each serve the investment experience:
 *   - a newspaper (the era + real headlines)
 *   - manila dossiers you open to investigate a company (chart, cheap/pricey,
 *     news, sentiment) — attention is scarce, not information
 *   - a ledger (your money) — capital allocation under scarce cash
 *   - a pinned photo of your dream (life: goals stay quietly visible)
 *   - the occasional bill (life: an event that changes your finances and
 *     forces a real allocation choice)
 * One real era: Jan 2019 -> Dec 2021 (COVID crash is the storm). Everything
 * real, plain language. Warm, tactile, chunky — a workspace, not a terminal.
 */

const START = 10000;
const RENT = 1500; // used to size money in real-life terms
const DREAM = { label: 'A place of your own', sub: 'a $40,000 down payment', emoji: '🏠', goal: 40000 };
const LIFE_EVENT = { at: 3, title: 'Your car just died.', body: "You need $6,000 for a replacement or you can't get to work. This one isn't optional.", amount: 6000 };

const COMPANIES = [
  { id: 'AAPL', name: 'Apple', who: 'Makes the iPhone. The biggest, most profitable company in the world.' },
  { id: 'MSFT', name: 'Microsoft', who: 'Windows, Office, and cloud computing. A steady, boring giant.' },
  { id: 'TSLA', name: 'Tesla', who: 'Electric cars, led by Elon Musk. Adored and doubted in equal measure.' },
  { id: 'ZM', name: 'Zoom', who: 'Video-calling software. Small and new — went public in 2019.' },
  { id: 'DAL', name: 'Delta', who: 'One of the largest airlines in the world.' },
];

const COLORS = { AAPL: '#3f6fb0', MSFT: '#3f8f5a', TSLA: '#c9962f', ZM: '#8a5cc0', DAL: '#b23a34', CASH: '#8a7a5c' };

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
    context: 'Everyone seems to be getting rich. Meme stocks fill the headlines. Anything that grows fast is priced as if it cannot fail.',
    prices: { AAPL: 121, MSFT: 233, TSLA: 700, ZM: 400, DAL: 46 } },
  { date: 'December 2021', tag: 'The tide turns', mood: 'calm',
    context: 'Prices are rising across the economy and the Federal Reserve signals it will raise interest rates. The fastest-growing, least-profitable companies start to slide.',
    prices: { AAPL: 178, MSFT: 336, TSLA: 1060, ZM: 185, DAL: 39 } },
];

const LAST = MOMENTS.length - 1;

const INFO = {
  AAPL: [
    { val: 'fair', why: 'Around 13–15x its yearly profit — cheap for a company this strong, because investors fear iPhone sales in China are slowing.', news: 'Apple cut its sales forecast — its first warning in years — blaming weak demand in China.', buzz: 'Wall Street is nervous. A few call it a rare bargain.' },
    { val: 'fair', why: 'The stock nearly doubled in a year. No longer a bargain, but still enormously profitable.', news: 'AirPods and the services business are booming. iPhone sales have stabilized.', buzz: 'Optimism is back.' },
    { val: 'fair', why: 'Fell with everything else. A cash-rich, profitable company on sale — but no one knows how long lockdowns last.', news: 'Stores closed worldwide. Its supply chain in China is disrupted.', buzz: 'Fear everywhere. Long-term believers see a discount.' },
    { val: 'expensive', why: 'Recovered and then some. Now priced well above its own historical average.', news: 'Split its stock 4-for-1. Record demand for laptops and iPads from people stuck at home.', buzz: 'New retail traders are piling in.' },
    { val: 'expensive', why: 'Still pricey, but profits are strong and growing.', news: 'Blowout holiday quarter — record iPhone and services sales.', buzz: 'Seen as a safe giant amid the frenzy.' },
  ],
  MSFT: [
    { val: 'fair', why: 'Reasonably priced for a steady, growing software and cloud business.', news: 'Its Azure cloud service is growing fast. Boring, reliably profitable.', buzz: 'Few doubters. Quietly compounding.' },
    { val: 'fair', why: 'Up strongly on cloud growth. Not cheap, but very reliable.', news: 'Its cloud business keeps taking customers from Amazon.', buzz: 'One of the safest big-tech names.' },
    { val: 'fair', why: 'Dropped in the crash. A profitable cloud giant at a discount.', news: 'Suddenly the whole world needs Teams, Office and Azure to work from home.', buzz: 'Seen as one of the more crash-resistant businesses.' },
    { val: 'expensive', why: 'Priced richly after a strong run — but the cloud demand behind it is real.', news: 'Cloud and Xbox gaming surge as the world stays indoors.', buzz: "A crowd favorite for 'safe growth'." },
    { val: 'expensive', why: 'Still expensive; growth stays strong.', news: 'Cloud revenue climbs sharply again.', buzz: 'The boring winner everyone agrees on.' },
  ],
  TSLA: [
    { val: 'expensive', why: 'Barely makes money, yet priced for enormous future growth. You would be paying for a future that may not arrive.', news: 'Model 3 production is a struggle. Heavy debt. Elon Musk is in constant, chaotic headlines.', buzz: 'Wall Street mostly hates it — the most bet-against stock in America.' },
    { val: 'expensive', why: 'Doubled in months. Just barely profitable — the price assumes years of domination ahead.', news: 'Posted its first back-to-back profitable quarters. A new factory in China is opening.', buzz: 'Doubters are starting to sweat. Believers are euphoric.' },
    { val: 'expensive', why: 'Fell hard in the crash, but still expensive for a carmaker that barely earns a profit.', news: 'Factories shut by lockdowns. Whether it has enough cash is a real question.', buzz: 'Polarizing as ever — a cult following versus loud skeptics.' },
    { val: 'expensive', why: 'Exploded higher after a stock split. Priced like no carmaker in history.', news: 'About to be added to the S&P 500 index. Retail traders are obsessed.', buzz: "Mania building. 'To the moon.'" },
    { val: 'expensive', why: 'Now worth more than most other carmakers combined. Expectations are gigantic.', news: 'Record cars delivered — but the price assumes it dominates for a decade.', buzz: 'Peak hype. Some are calling it a bubble.' },
  ],
  ZM: [
    null,
    { val: 'expensive', why: 'Just went public. Sales nearly doubled, but it is small and barely profitable — priced for perfection.', news: 'A hot IPO. A niche business-video app few ordinary people use yet.', buzz: 'Loved by growth investors. Unknown to most of the public.' },
    { val: 'expensive', why: 'Rose during the crash as the world locked down — now priced as if the pandemic lasts forever.', news: "'Zoom' becomes a verb overnight. Downloads explode.", buzz: 'Suddenly a household name.' },
    { val: 'expensive', why: 'Sales up more than 350% — but the price assumes this boom never fades.', news: 'Blowout results. Work, school and family calls all run on Zoom.', buzz: 'The definitive pandemic stock.' },
    { val: 'expensive', why: 'Growth is slowing from insane to merely fast, yet still priced as a forever-winner.', news: 'Vaccines are arriving — will people still Zoom once offices reopen?', buzz: 'Doubts are creeping in about life after lockdown.' },
  ],
  DAL: [
    { val: 'cheap', why: 'Priced cheaply, like most airlines — a tough business that earns thin profits even in good years.', news: 'Record travel demand. Airlines are finally profitable after decades of pain.', buzz: 'Even Warren Buffett owns airlines now.' },
    { val: 'cheap', why: 'Cheap on paper and earning solid profits — but airlines always look cheap, for a reason.', news: 'Strong travel bookings heading into 2020.', buzz: 'A steady, unexciting value stock.' },
    { val: 'cheap', why: 'Down about 60%. It looks incredibly cheap — but it is now losing huge amounts of cash with its planes grounded.', news: 'Air travel has collapsed ~95%. Delta is burning ~$60 million a day. Buffett sells all his airlines.', buzz: "'Too cheap to ignore' versus 'might not survive'." },
    { val: 'cheap', why: 'Still cheap, still bleeding cash. Its recovery depends entirely on people flying again.', news: 'Planes remain mostly empty. It took on massive debt just to survive.', buzz: "A bet on 'when', not 'if', travel returns." },
    { val: 'fair', why: 'Bounced on vaccine hope, but its profits are still far below normal.', news: 'Vaccines raise hopes of a travel comeback — someday.', buzz: 'A favorite of the reopening bet.' },
  ],
};

const VAL = { cheap: { label: 'Cheap', cls: 'cheap' }, fair: { label: 'Fair price', cls: 'fair' }, expensive: { label: 'Expensive', cls: 'exp' } };

const LESSONS = {
  AAPL: 'Apple dipped in the crash, then compounded from about $42 to $178. Rarely thrilling, rarely a disaster — mostly a test of patience.',
  MSFT: "Microsoft went from about $104 to $336 with almost no drama. The kind of holding that does the work while you're not watching.",
  TSLA: 'Tesla went from about $62 to over $1,000 — roughly 17x. Size it big and you got rich; size it too big and one bad month could have wiped you out. The difference was position size, not prediction.',
  ZM: 'Zoom looked unstoppable in 2020 and was the most dangerous thing to buy at the top: from about $470 back to $185. The obvious winner was already priced for a future that never arrived.',
  DAL: 'Delta was down about 60% and looked like free money. But a low price is not a safe price — it recovered slowly and stalled. "It fell a lot" was never a reason to buy.',
  CASH: 'Cash meant missing the rally — but it was also the only thing that let you buy anything while everyone else was panicking.',
};

/* ---------- helpers ---------- */
const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
function sPct(x) { const v = x * 100; return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(Math.abs(v) < 10 ? 1 : 0) + '%'; }
const moveClass = (x) => (x > 0.0005 ? 'up' : x < -0.0005 ? 'down' : 'flat');
function sizeLife(amt) {
  const r = amt / RENT;
  if (r >= 1) return `${r >= 10 ? Math.round(r) : r.toFixed(1)} months of rent`;
  return `${Math.max(1, Math.round(amt / (RENT / 4)))} weeks of rent`;
}

function Spark({ series, color, w = 74, h = 26 }) {
  const pts = series.filter((v) => v != null);
  if (pts.length < 2) return <svg className="dk-spark" width={w} height={h} />;
  const min = Math.min(...pts), max = Math.max(...pts), rng = max - min || 1;
  const step = w / (pts.length - 1);
  const d = pts.map((v, i) => `${(i * step).toFixed(1)},${(h - 3 - ((v - min) / rng) * (h - 6)).toFixed(1)}`).join(' ');
  return (
    <svg className="dk-spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function useCountUp(target, dur = 700) {
  const [val, setVal] = useState(target);
  const from = useRef(target); const raf = useRef();
  useEffect(() => {
    const start = performance.now(); const a = from.current;
    cancelAnimationFrame(raf.current);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur); const e = 1 - Math.pow(1 - t, 3);
      setVal(a + (target - a) * e);
      if (t < 1) raf.current = requestAnimationFrame(tick); else from.current = target;
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return val;
}

/* ---------- component ---------- */
export default function DeskGame() {
  const [phase, setPhase] = useState('intro'); // intro | desk | reflect
  const [mi, setMi] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [showCoach, setShowCoach] = useState(true);
  const [owed, setOwed] = useState(0);
  const [eventDone, setEventDone] = useState(false);
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
    const p = prices[id]; if (!p || cash < 1) return;
    flow.current.buys += Math.min(chunk, cash);
    setPort((pr) => {
      if (pr.cash < 1) return pr;
      const a = Math.min(chunk, pr.cash); const ns = pr.shares[id] + a / p;
      const na = ns > 0 ? (pr.shares[id] * pr.avg[id] + a) / ns : 0;
      return { shares: { ...pr.shares, [id]: ns }, avg: { ...pr.avg, [id]: na }, cash: pr.cash - a };
    });
  }
  function sell(id, all) {
    const p = prices[id]; const pos = shares[id] * (p || 0); if (pos <= 0) return;
    flow.current.sells += all ? pos : Math.min(chunk, pos);
    setPort((pr) => {
      const pp = pr.shares[id] * (p || 0); if (pp <= 0) return pr;
      const a = all ? pp : Math.min(chunk, pp); let ns = pr.shares[id] - a / p; if (ns < 1e-6) ns = 0;
      return { shares: { ...pr.shares, [id]: ns }, avg: ns === 0 ? { ...pr.avg, [id]: 0 } : pr.avg, cash: pr.cash + a };
    });
  }
  function payBill() {
    if (cash < owed) return;
    setPort((pr) => ({ ...pr, cash: pr.cash - owed }));
    setOwed(0);
  }

  function advance() {
    if (owed > 0) return;
    const alloc = {};
    COMPANIES.forEach((c) => { alloc[c.id] = V > 0 ? (shares[c.id] * (prices[c.id] || 0)) / V : 0; });
    const snap = { mi, date: MOMENTS[mi].date, V, alloc, net: flow.current.buys - flow.current.sells, storm: !!MOMENTS[mi].storm };
    const next = [...history, snap];
    setExpanded(null);
    if (mi >= LAST - 1) {
      const fp = MOMENTS[LAST].prices;
      const fV = COMPANIES.reduce((s, c) => s + shares[c.id] * (fp[c.id] || 0), 0) + cash;
      const fAlloc = {};
      COMPANIES.forEach((c) => { fAlloc[c.id] = fV > 0 ? (shares[c.id] * (fp[c.id] || 0)) / fV : 0; });
      next.push({ mi: LAST, date: MOMENTS[LAST].date, V: fV, alloc: fAlloc, net: 0, final: true });
      setHistory(next); setMi(LAST); setPhase('reflect');
    } else {
      setHistory(next); flow.current = { buys: 0, sells: 0 };
      const nm = mi + 1;
      setMi(nm);
      if (nm === LIFE_EVENT.at && !eventDone) { setOwed(LIFE_EVENT.amount); setEventDone(true); }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function restart() {
    setPort({ shares: { AAPL: 0, MSFT: 0, TSLA: 0, ZM: 0, DAL: 0 }, avg: { AAPL: 0, MSFT: 0, TSLA: 0, ZM: 0, DAL: 0 }, cash: START });
    setHistory([]); flow.current = { buys: 0, sells: 0 };
    setExpanded(null); setShowCoach(true); setOwed(0); setEventDone(false); setMi(0); setPhase('intro');
  }

  /* ---------- intro ---------- */
  if (phase === 'intro') {
    return (
      <div className="dk-page dk-calm">
        <div className="dk-col dk-introcol">
          <div className="dk-note dk-note-intro">
            <p className="dk-kicker">Investment Time Machine</p>
            <h1 className="dk-title">Welcome to your desk.</h1>
            <p className="dk-introp">It's <b>January 2019</b>. In front of you: <b>$10,000</b>, three years of real market history, and one question — could you turn it into a life?</p>
            <div className="dk-polaroid dk-polaroid-intro">
              <div className="dk-photo">{DREAM.emoji}</div>
              <p className="dk-caption">{DREAM.label}<span>{DREAM.sub}</span></p>
            </div>
            <p className="dk-introp dk-introp-2">That's what you're really investing for. Read the news, open a dossier, decide where your money goes — then move time forward and see what history does to it.</p>
            <button className="dk-btn dk-btn-primary" onClick={() => setPhase('desk')}>Sit down at the desk →</button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- reflect ---------- */
  if (phase === 'reflect') {
    const finalV = V; const ret = finalV / START - 1;
    const dreamPct = Math.min(1, finalV / DREAM.goal);
    const moves = history.filter((h) => !h.final).length;
    let big = { id: null, w: 0, date: '' };
    history.forEach((h) => Object.entries(h.alloc).forEach(([id, w]) => { if (w > big.w) big = { id, w, date: h.date }; }));
    const bigName = big.id ? COMPANIES.find((c) => c.id === big.id).name : null;
    const storm = history.find((h) => h.storm);
    let stormLine = '';
    if (storm) {
      if (storm.net > 300) stormLine = 'When the crash came in March 2020, you put more money in — you bought while others panicked.';
      else if (storm.net < -300) stormLine = 'When the crash came in March 2020, you raised cash — you sold into the fear.';
      else stormLine = 'When the crash came in March 2020, you barely moved — you held your ground and waited it out.';
    }
    const end = COMPANIES
      .map((c) => ({ id: c.id, name: c.name, value: shares[c.id] * prices[c.id], weight: shares[c.id] * prices[c.id] / finalV, gain: avg[c.id] > 0 ? prices[c.id] / avg[c.id] - 1 : 0 }))
      .filter((h) => h.value > 0.5).sort((a, b) => b.value - a.value);

    return (
      <div className="dk-page dk-calm">
        <div className="dk-col">
          <div className="dk-paper dk-reflect">
            <p className="dk-kicker">December 2021 — three years later</p>
            <div className="dk-final">
              <span className="dk-final-label">Your $10,000 became</span>
              <span className={'dk-final-num ' + moveClass(ret)}>{fmt(finalV)}</span>
              <span className={'dk-final-ret ' + moveClass(ret)}>{sPct(ret)}</span>
            </div>

            <div className="dk-dream-result">
              <div className="dk-photo dk-photo-sm">{DREAM.emoji}</div>
              <div className="dk-dream-result-txt">
                <b>{DREAM.label}</b>
                <div className="dk-progress"><div className="dk-progress-fill" style={{ width: (dreamPct * 100) + '%' }} /></div>
                <span>{dreamPct >= 1 ? "You made it — the down payment is yours." : `${Math.round(dreamPct * 100)}% of the way to ${DREAM.sub}.`}</span>
              </div>
            </div>

            <h2 className="dk-h2">How you played</h2>
            <p className="dk-mirror">You reshaped your money <b>{moves}</b> times across three years.</p>
            {bigName && (
              <p className="dk-mirror">{big.w >= 0.4
                ? <>Your biggest bet was <b>{bigName}</b> — at one point <b>{Math.round(big.w * 100)}%</b> of everything you owned. Concentration cuts both ways.</>
                : <>You stayed fairly spread out — your largest holding, <b>{bigName}</b>, never passed <b>{Math.round(big.w * 100)}%</b>.</>}</p>
            )}
            {stormLine && <p className="dk-mirror">{stormLine}</p>}
            {eventDone && <p className="dk-mirror">And you paid $6,000 for a car along the way — life doesn't wait for the market.</p>}

            <h2 className="dk-h2">Where you ended up</h2>
            {end.map((h) => (
              <div className="dk-endrow" key={h.id}>
                <span className="dk-dot" style={{ background: COLORS[h.id] }} />
                <span className="dk-endname">{h.name}</span>
                <span className="dk-endval">{fmt(h.value)} · {Math.round(h.weight * 100)}%</span>
                <span className={'dk-endgain ' + moveClass(h.gain)}>{sPct(h.gain)}</span>
              </div>
            ))}
            <div className="dk-endrow">
              <span className="dk-dot" style={{ background: COLORS.CASH }} />
              <span className="dk-endname">Cash</span>
              <span className="dk-endval">{fmt(cash)} · {Math.round((cash / finalV) * 100)}%</span>
              <span className="dk-endgain flat">—</span>
            </div>

            <h2 className="dk-h2">What actually happened</h2>
            {[...COMPANIES.map((c) => c.id), 'CASH'].map((id) => (
              <p className="dk-lesson" key={id}><b style={{ color: COLORS[id] }}>{id === 'CASH' ? 'Cash' : COMPANIES.find((c) => c.id === id).name}.</b> {LESSONS[id]}</p>
            ))}

            <div className="dk-bridge">
              <p><b>Every company, price and event here is real.</b> The winners weren't found by predicting the future — they came from how much you risked and what you did when everyone panicked. You can look all of this up yourself: SEC EDGAR (filings), Yahoo Finance (prices &amp; news), company investor-relations pages, Macrotrends, TradingView.</p>
              <p className="dk-bridge-close">Nothing you just practiced only works inside this game.</p>
            </div>
            <button className="dk-btn dk-btn-primary" onClick={restart}>Live it again</button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- desk ---------- */
  const M = MOMENTS[mi];
  const prevV = history.length ? history[history.length - 1].V : null;
  const portMove = prevV ? V / prevV - 1 : null;
  const nextDate = MOMENTS[mi + 1].date;
  const dreamPct = Math.min(1, V / DREAM.goal);
  const held = COMPANIES.filter((c) => shares[c.id] * (prices[c.id] || 0) > 0.5);
  const segs = COMPANIES.map((c) => ({ id: c.id, w: V > 0 ? shares[c.id] * (prices[c.id] || 0) / V : 0 }))
    .concat([{ id: 'CASH', w: V > 0 ? cash / V : 0 }]).filter((s) => s.w > 0.001);
  const btnLabel = M.storm ? 'Ride out the crash →' : mi === LAST - 1 ? 'See how it all ends →' : 'Move time forward →';

  return (
    <div className={'dk-page dk-' + M.mood}>
      <div className="dk-col">
        {/* desk calendar / masthead */}
        <div className="dk-cal">
          <div className="dk-cal-plate">
            <span className="dk-cal-step">Chapter {mi + 1} / {LAST}</span>
            <span className="dk-cal-date">{M.date}</span>
          </div>
          <div className="dk-timeline">
            {MOMENTS.map((m, i) => <span key={i} className={'dk-tl ' + (i === mi ? 'now' : i < mi ? 'past' : 'future') + (m.storm ? ' storm' : '')} />)}
          </div>
        </div>

        {/* what moving time did */}
        {portMove != null && (
          <div className={'dk-result ' + (M.storm ? 'storm' : moveClass(portMove))}>
            <span className="dk-result-time">{MOMENTS[mi - 1].date} → {M.date}</span>
            <span className="dk-result-money">{fmt(prevV)} → <b>{fmt(V)}</b></span>
            <span className={'dk-result-pct ' + moveClass(portMove)}>{sPct(portMove)}</span>
            {M.storm && <span className="dk-result-note">The crash hit. Everything is cheap — and terrifying. What do you do?</span>}
          </div>
        )}

        {/* the newspaper */}
        <div className="dk-news">
          <div className="dk-news-mast">The Market Times<span>{M.date}</span></div>
          <p className="dk-news-lead">{M.tag}. {M.context}</p>
        </div>

        {/* the ledger + dream */}
        <div className="dk-ledger">
          <div className="dk-ledger-head">
            <div>
              <span className="dk-lbl">Your money</span>
              <span className="dk-total">{fmt(shownV)}</span>
            </div>
            <div className="dk-polaroid dk-polaroid-mini">
              <div className="dk-photo dk-photo-xs">{DREAM.emoji}</div>
              <div className="dk-progress dk-progress-sm"><div className="dk-progress-fill" style={{ width: (dreamPct * 100) + '%' }} /></div>
              <span className="dk-dream-pct">{Math.round(dreamPct * 100)}% to {DREAM.emoji}</span>
            </div>
          </div>
          <div className="dk-cashline">
            <span className="dk-lbl">Cash to spend</span>
            <span className={'dk-cash ' + (cash > 1 ? 'has' : 'none')}>{fmt(cash)}</span>
            <span className="dk-cash-life">≈ {sizeLife(cash)}</span>
          </div>
          <div className="dk-shape">{segs.map((s) => <div key={s.id} className="dk-shape-seg" style={{ width: (s.w * 100) + '%', background: COLORS[s.id] }} />)}</div>
          {held.length > 0 && (
            <div className="dk-holds">
              {held.map((c) => {
                const val = shares[c.id] * prices[c.id]; const g = avg[c.id] > 0 ? prices[c.id] / avg[c.id] - 1 : 0;
                return <span className="dk-hold" key={c.id}><span className="dk-dot" style={{ background: COLORS[c.id] }} />{c.name} {fmt(val)} <em className={moveClass(g)}>{sPct(g)}</em></span>;
              })}
            </div>
          )}
        </div>

        {/* life event — a bill on the desk */}
        {owed > 0 && (
          <div className="dk-bill">
            <p className="dk-bill-title">{LIFE_EVENT.title}</p>
            <p className="dk-bill-body">{LIFE_EVENT.body}</p>
            <div className="dk-bill-row">
              <span className="dk-bill-amt">{fmt(owed)} <em>≈ {sizeLife(owed)}</em></span>
              <button className="dk-btn dk-btn-bill" disabled={cash < owed} onClick={payBill}>{cash < owed ? 'Not enough cash' : `Pay ${fmt(owed)}`}</button>
            </div>
            {cash < owed && <p className="dk-bill-hint">Sell some holdings below to raise the cash, then pay.</p>}
          </div>
        )}

        {/* coach — first chapter only */}
        {mi === 0 && showCoach && (
          <div className="dk-sticky">
            <p><b>How your desk works</b></p>
            <p>1 · Tap a <b>dossier</b> below to research a company.</p>
            <p>2 · <b>Buy</b> what you believe in — cash is limited, so every buy means giving something else up.</p>
            <p>3 · <b>Move time forward</b> to see what history does to your money.</p>
            <p className="dk-sticky-tip">A low price isn't the same as a good deal. Look at whether it's growing and how much hope is already priced in.</p>
            <button className="dk-sticky-x" onClick={() => setShowCoach(false)}>Got it</button>
          </div>
        )}

        {/* the dossiers */}
        <p className="dk-section">Companies on your desk — tap to research</p>
        {COMPANIES.map((c) => {
          const p = prices[c.id]; const pp = mi > 0 ? MOMENTS[mi - 1].prices[c.id] : null;
          const mv = p && pp ? p / pp - 1 : null; const justListed = p && !pp && mi > 0;
          const pos = shares[c.id] * (p || 0); const w = V > 0 ? pos / V : 0;
          const gain = shares[c.id] > 0 && avg[c.id] > 0 ? p / avg[c.id] - 1 : 0;
          const info = INFO[c.id][mi]; const series = MOMENTS.slice(0, mi + 1).map((m) => m.prices[c.id]);
          const chartable = series.filter((v) => v != null).length >= 2;
          const open = expanded === c.id; const notPublic = !p;
          return (
            <div className={'dk-dossier' + (open ? ' open' : '') + (notPublic ? ' locked' : '')} key={c.id}>
              <button className="dk-tab" onClick={() => !notPublic && setExpanded(open ? null : c.id)} disabled={notPublic}>
                <div className="dk-tab-top">
                  <span className="dk-co"><span className="dk-dot" style={{ background: COLORS[c.id] }} />{c.name}</span>
                  <span className="dk-priceblock">
                    {p ? <><span className="dk-price">${p.toLocaleString('en-US')}</span>{mv != null && <span className={'dk-move ' + moveClass(mv)}>{sPct(mv)}</span>}{justListed && <span className="dk-move flat">new</span>}</>
                       : <span className="dk-na">not public yet</span>}
                  </span>
                </div>
                {!notPublic && (
                  <div className="dk-tab-bot">
                    <Spark series={series} color={COLORS[c.id]} />
                    {info && <span className={'dk-val ' + VAL[info.val].cls}>{VAL[info.val].label}</span>}
                    {pos > 0.5 ? <span className="dk-owned">you own {fmt(pos)} · {Math.round(w * 100)}% <em className={moveClass(gain)}>{sPct(gain)}</em></span>
                              : <span className="dk-tapcue">{open ? 'close' : 'research →'}</span>}
                  </div>
                )}
              </button>
              {open && info && (
                <div className="dk-sheet">
                  <p className="dk-who">{c.who}</p>
                  {chartable && <div className="dk-chart"><Spark series={series} color={COLORS[c.id]} w={288} h={62} /></div>}
                  <div className="dk-fact"><span className="dk-fk">The chart</span><span className="dk-fv">{mv != null ? `${sPct(mv)} since ${MOMENTS[mi - 1].date}.` : 'Only just arrived — no history to chart yet.'}</span></div>
                  <div className="dk-fact"><span className="dk-fk">Cheap or pricey?</span><span className="dk-fv"><b className={'val-' + VAL[info.val].cls}>{VAL[info.val].label}.</b> {info.why}</span></div>
                  <div className="dk-fact"><span className="dk-fk">In the news</span><span className="dk-fv">{info.news}</span></div>
                  <div className="dk-fact"><span className="dk-fk">Word on the street</span><span className="dk-fv">{info.buzz}</span></div>
                  <div className="dk-trade">
                    <button className="dk-btn dk-btn-sell" disabled={pos <= 0.5} onClick={() => sell(c.id, true)}>Sell all</button>
                    <button className="dk-btn dk-btn-sell" disabled={pos <= 0.5} onClick={() => sell(c.id, false)}>Sell {fmt(Math.min(chunk, pos || chunk))}</button>
                    <button className="dk-btn dk-btn-buy" disabled={cash < 1} onClick={() => buy(c.id)}>Buy {fmt(Math.min(chunk, cash))}</button>
                  </div>
                  <p className="dk-trade-note">{cash < 1 ? 'Out of cash — sell something to buy this.' : `Spends ${fmt(Math.min(chunk, cash))} of your cash · ${sizeLife(Math.min(chunk, cash))}.`}</p>
                </div>
              )}
            </div>
          );
        })}

        <div className="dk-action">
          <button className="dk-btn dk-btn-primary" disabled={owed > 0} onClick={advance}>{btnLabel}</button>
          <p className="dk-action-sub">{owed > 0 ? 'Settle the bill on your desk first.' : `Jump to ${nextDate} and see what happens to your money.`}</p>
        </div>
      </div>
    </div>
  );
}
