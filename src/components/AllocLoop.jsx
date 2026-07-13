import React, { useState, useRef, useEffect } from 'react';

/*
 * AllocLoop — the v2 "naked capital-allocation" prototype  (?proto=v2)
 * -------------------------------------------------------------------
 * The one question this exists to answer: does a RELATIVE allocation
 * decision — "given everything I hold and my scarce cash, what do I give
 * up to take this?" — feel TENSE or CLERICAL, repeated many times?
 *
 * So it is deliberately naked: no phone, no characters, no chapters, no
 * life-sim. One real era (Jan 2019 -> Dec 2021, the COVID crash is the
 * storm), five real companies with real split-adjusted prices whose paths
 * diverge violently, $10,000 to start, and the only verb is: reshape your
 * capital under scarce cash. Then a process-mirror reflection + a reality
 * bridge. Everything here is real and checkable — no fake clues.
 */

const START = 10000;

const COMPANIES = [
  { id: 'AAPL', name: 'Apple', who: 'iPhone maker. The biggest company in the world.' },
  { id: 'MSFT', name: 'Microsoft', who: 'Windows, Office, and cloud. A steady giant.' },
  { id: 'TSLA', name: 'Tesla', who: 'Electric cars. Loved and doubted in equal measure.' },
  { id: 'ZM', name: 'Zoom', who: 'Video calls. Small, new, went public in 2019.' },
  { id: 'DAL', name: 'Delta', who: 'One of the largest airlines in the world.' },
];

const COLORS = { AAPL: '#5b8cff', MSFT: '#2ecc71', TSLA: '#f5a623', ZM: '#c77dff', DAL: '#ff5c5c', CASH: '#3a4152' };

// Real, split-adjusted, checkable monthly closes (approximate). Zoom is not
// public at the first moment. Every number and event below actually happened.
const MOMENTS = [
  {
    date: 'January 2019', tag: 'The calm',
    context: 'The market is climbing out of a rough end to last year. Nothing feels urgent.',
    news: [
      'Apple just warned that iPhone sales in China are slowing.',
      "Zoom isn't public yet — you can't buy it. It lists in a few months.",
    ],
    prices: { AAPL: 42, MSFT: 104, TSLA: 62, ZM: null, DAL: 50 },
  },
  {
    date: 'January 2020', tag: 'All-time highs',
    context: 'The market has never been higher. A new virus is in the news in China. Almost no one is worried.',
    news: [
      'Zoom is public now. Sales nearly doubled last year, but it barely makes a profit.',
      'A pneumonia-like illness is spreading in Wuhan, China.',
    ],
    prices: { AAPL: 78, MSFT: 170, TSLA: 130, ZM: 76, DAL: 59 },
  },
  {
    date: 'March 2020', tag: 'The crash', storm: true,
    context: 'The virus is everywhere. Countries are locking down. In a few weeks the market has fallen faster than at any time in history.',
    news: [
      'Airlines are grounded worldwide. Delta is burning through cash every day.',
      'Offices are closing. Downloads of Zoom are exploding.',
      'Everything is cheap — but no one knows how bad this gets.',
    ],
    prices: { AAPL: 57, MSFT: 135, TSLA: 100, ZM: 155, DAL: 23 },
  },
  {
    date: 'September 2020', tag: 'The everything rally',
    context: 'Instead of collapsing, the market roared back. Stuck at home, millions of new traders piled in. Anything touching technology is flying.',
    news: [
      "Zoom's sales are up more than 350% from a year ago.",
      'Tesla split its stock and keeps climbing. Retail trading is at record highs.',
      'Airlines are still half-empty.',
    ],
    prices: { AAPL: 116, MSFT: 210, TSLA: 430, ZM: 470, DAL: 31 },
  },
  {
    date: 'February 2021', tag: 'Peak euphoria',
    context: 'Everyone seems to be getting rich. Meme stocks are in the headlines. Anything that grows fast is priced as if it cannot fail.',
    news: [
      'A crowd of small traders sent GameStop to the moon and back.',
      'Tesla is now worth more than the next several carmakers combined.',
      'Vaccines are rolling out — travel might come back.',
    ],
    prices: { AAPL: 121, MSFT: 233, TSLA: 700, ZM: 400, DAL: 46 },
  },
  {
    date: 'December 2021', tag: 'The tide turns',
    context: 'Prices are rising across the real economy, and the Federal Reserve signals it will finally raise interest rates. The fastest-growing, least-profitable companies start to slide.',
    news: [
      'Inflation is at a 40-year high.',
      'The work-from-home darlings are falling as offices reopen.',
    ],
    prices: { AAPL: 178, MSFT: 336, TSLA: 1060, ZM: 185, DAL: 39 },
  },
];

const LAST = MOMENTS.length - 1; // 5 = Dec 2021 = final reveal (not a trade moment)

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
  const sign = v >= 0 ? '+' : '−';
  return sign + Math.abs(v).toFixed(Math.abs(v) < 10 ? 1 : 0) + '%';
}
const moveClass = (x) => (x > 0.0005 ? 'up' : x < -0.0005 ? 'down' : 'flat');

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

  // Trades are applied through functional updaters so several taps in one tick
  // compose atomically (no clobbering, no swallowed fast clicks). flow tracking
  // stays outside the updater to avoid StrictMode's double-invoke double-counting.
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
  }

  function restart() {
    setPort({
      shares: { AAPL: 0, MSFT: 0, TSLA: 0, ZM: 0, DAL: 0 },
      avg: { AAPL: 0, MSFT: 0, TSLA: 0, ZM: 0, DAL: 0 },
      cash: START,
    });
    setHistory([]);
    flow.current = { buys: 0, sells: 0 };
    setMi(0);
    setPhase('intro');
  }

  /* ---------- intro ---------- */
  if (phase === 'intro') {
    return (
      <div className="screen v2">
        <div className="v2-intro">
          <p className="v2-kicker">Investment Time Machine · v2</p>
          <h1 className="v2-title">Could you have survived market history?</h1>
          <p className="v2-lead">
            You start with <b>$10,000</b> and three years of real market history — January
            2019 to the end of 2021. Real companies. Real prices. Real events.
          </p>
          <ul className="v2-rules">
            <li><b>You never just "buy a stock."</b> Money is scarce, so every move is a trade-off: to buy more of one thing, you sell something else or spend your only cash.</li>
            <li><b>Then time moves and the market answers.</b> What you built either holds up or it doesn't.</li>
            <li><b>You will live through the 2020 crash.</b> How you're holding when it hits is the whole game.</li>
          </ul>
          <button className="v2-go" onClick={() => setPhase('trade')}>Begin — January 2019</button>
          <p className="v2-foot">The earlier prototype still lives at <code>?proto=core</code>.</p>
        </div>
      </div>
    );
  }

  /* ---------- reflect ---------- */
  if (phase === 'reflect') {
    const finalV = V; // mi === LAST here
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
      <div className="screen v2">
        <p className="v2-kicker">December 2021 — the era ends</p>
        <div className="v2-final">
          <span className="v2-final-label">Your $10,000 became</span>
          <span className="v2-final-num">{fmt(finalV)}</span>
          <span className={'v2-final-ret ' + moveClass(ret)}>{sPct(ret)} over three years</span>
        </div>

        <h2 className="v2-h2">How you played</h2>
        <p className="v2-mirror">You reshaped your capital <b>{moves}</b> times across three years.</p>
        {bigName && (
          <p className="v2-mirror">
            {big.w >= 0.4
              ? <>Your biggest bet was <b>{bigName}</b> — at one point it was <b>{Math.round(big.w * 100)}%</b> of everything you owned ({big.date}). Concentration cuts both ways.</>
              : <>You stayed fairly spread out — your largest single position, <b>{bigName}</b>, never went past <b>{Math.round(big.w * 100)}%</b> of your capital.</>}
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
  const prev = mi > 0 ? MOMENTS[mi - 1].prices : null;
  const prevV = history.length ? history[history.length - 1].V : null;
  const portMove = prevV ? V / prevV - 1 : null;
  const btnLabel = M.storm ? 'Make your move →' : mi === LAST - 1 ? 'See how the story ends →' : 'Advance time →';

  const segs = COMPANIES.map((c) => ({ id: c.id, w: V > 0 ? shares[c.id] * (prices[c.id] || 0) / V : 0 }))
    .concat([{ id: 'CASH', w: V > 0 ? cash / V : 0 }])
    .filter((s) => s.w > 0.001);

  return (
    <div className="screen v2">
      <div className="v2-topbar">
        <span className="v2-step">Moment {mi + 1} of {LAST}</span>
        <span className="v2-date">{M.date} · {M.tag}</span>
      </div>

      <p className="v2-context">{M.context}</p>
      <ul className="v2-news">
        {M.news.map((n, i) => <li key={i}>{n}</li>)}
      </ul>

      {M.storm && (
        <div className="v2-storm">
          <p className="v2-storm-title">The market is crashing.</p>
          <p className="v2-storm-body">
            Your capital has fallen to <b>{fmt(V)}</b>{portMove != null && <> — <b className="down">{sPct(portMove)}</b> since {MOMENTS[mi - 1].date}</>}.
            Everything is cheap. No one knows how much worse it gets. What do you do?
          </p>
        </div>
      )}

      <div className="v2-cap">
        <div className="v2-cap-row">
          <div>
            <span className="v2-cap-label">Your capital</span>
            <span className="v2-cap-num">{fmt(shownV)}</span>
          </div>
          <div className="v2-cap-right">
            <span className="v2-cap-label">Cash to deploy</span>
            <span className={'v2-cap-cash ' + (cash > 1 ? 'has' : 'none')}>{fmt(cash)}</span>
          </div>
        </div>
        <div className="v2-shape">
          {segs.map((s) => <div key={s.id} className="v2-shape-seg" style={{ width: (s.w * 100) + '%', background: COLORS[s.id] }} title={s.id} />)}
        </div>
        {portMove != null && !M.storm && (
          <p className="v2-since">Since {MOMENTS[mi - 1].date}, your capital moved <b className={moveClass(portMove)}>{sPct(portMove)}</b>.</p>
        )}
        <p className="v2-hint">To buy more of anything, you must free up cash — sell something you own. Each tap moves about {fmt(chunk)}.</p>
      </div>

      {COMPANIES.map((c) => {
        const p = prices[c.id];
        const pp = prev ? prev[c.id] : null;
        const mv = p && pp ? p / pp - 1 : null;
        const justListed = p && !pp && mi > 0;
        const pos = shares[c.id] * (p || 0);
        const w = V > 0 ? pos / V : 0;
        const gain = shares[c.id] > 0 && avg[c.id] > 0 ? p / avg[c.id] - 1 : 0;
        const newlyAvail = mi === 0 || justListed;
        return (
          <div className="v2-row" key={c.id}>
            <div className="v2-row-top">
              <div className="v2-co">
                <span className="v2-dot" style={{ background: COLORS[c.id] }} />
                <span className="v2-name">{c.name}</span>
              </div>
              <div className="v2-priceblock">
                {p ? (
                  <>
                    <span className="v2-price">${p.toLocaleString('en-US')}</span>
                    {mv != null && <span className={'v2-move ' + moveClass(mv)}>{sPct(mv)}</span>}
                    {justListed && <span className="v2-move flat">new</span>}
                  </>
                ) : <span className="v2-na">not public yet</span>}
              </div>
            </div>
            {newlyAvail && <p className="v2-who">{c.who}</p>}
            <div className="v2-row-bottom">
              <div className="v2-pos">
                {pos > 0.5
                  ? <><b>{fmt(pos)}</b><span className="v2-pos-sub">{Math.round(w * 100)}% of capital · <em className={moveClass(gain)}>{sPct(gain)}</em></span></>
                  : <span className="v2-pos-none">not held</span>}
              </div>
              <div className="v2-btns">
                <button className="v2-btn" disabled={pos <= 0.5} onClick={() => sell(c.id, true)}>All out</button>
                <button className="v2-btn" disabled={pos <= 0.5} onClick={() => sell(c.id, false)}>Sell</button>
                <button className="v2-btn buy" disabled={!p || cash < 1} onClick={() => buy(c.id)}>Buy</button>
              </div>
            </div>
          </div>
        );
      })}

      <button className="v2-go" onClick={advance}>{btnLabel}</button>
    </div>
  );
}
