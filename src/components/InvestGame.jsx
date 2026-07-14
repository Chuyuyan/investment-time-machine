import React, { useState } from 'react';

/*
 * InvestGame — "The Investigation"  (?proto=research)
 * ---------------------------------------------------
 * A focused test of ONE feel: research as active detective work, not reading a
 * briefing. You have limited ATTENTION, so you dig only a few of many sources,
 * collect real clues, and tell SIGNAL from NOISE yourself — then decide how
 * hard to bet, before you can ever be sure. Borrows the *mechanic* of clue
 * games (Her Story / Obra Dinn / Do Not Feed the Monkeys) but NOT their win
 * condition: investing has no lookup-able right answer, only conviction under
 * uncertainty. The reveal grades your READ of signal vs noise (process), and
 * is honest that even a perfect read is not a guarantee.
 */

const ATTENTION = 4;

const CASES = [
  {
    name: 'Zoom', when: 'January 2020', price: '$76',
    frame: 'A little-known video-call company just went public and the whole market is buzzing. Get in — and how hard?',
    sources: [
      { ic: '📊', label: 'Financials', clue: 'Revenue jumped 88% last year, and daily users are exploding as a strange new virus spreads.', signal: true, lean: 'bull' },
      { ic: '📈', label: 'Valuation', clue: 'It trades at ~50× its yearly sales — priced as if it dominates for a decade.', signal: true, lean: 'bear' },
      { ic: '🕵️', label: 'Insider trades', clue: 'Company executives have been quietly selling their own shares into the rally.', signal: true, lean: 'bear' },
      { ic: '⚔️', label: 'Competition', clue: 'Microsoft and Google can bundle video calls for free into software companies already pay for.', signal: true, lean: 'bear' },
      { ic: '📰', label: 'Headlines', clue: '"Zoombombing" security scares are all over the news; a few schools are banning it.', signal: false, lean: 'bear' },
      { ic: '🔥', label: 'Social buzz', clue: '#Zoom is the #1 trend — everyone is posting their funny video-call fails.', signal: false, lean: 'bull' },
      { ic: '🎯', label: 'Analysts', clue: 'Wall Street keeps raising price targets just to keep up with the climbing stock.', signal: false, lean: 'bull' },
    ],
    outcome: 'Zoom kept soaring for most of 2020 — then fell about 60% as the world reopened.',
    note: 'The clues that mattered were the boring ones: nosebleed valuation, insiders selling, free competition. The exciting ones — trending, analyst targets — were noise. And even a correct read was brutal on timing: it soared first and fell much later.',
  },
  {
    name: 'Tesla', when: 'January 2019', price: '$62',
    frame: 'The most hated, most bet-against stock in America. Genius or bankruptcy? You decide how much to risk.',
    sources: [
      { ic: '📊', label: 'Financials', clue: 'It loses money most quarters, carries heavy debt, and cash is tight.', signal: true, lean: 'bear' },
      { ic: '🚗', label: 'The product', clue: 'The Model 3 is finally shipping in real volume, and the reviews are strong.', signal: true, lean: 'bull' },
      { ic: '📈', label: 'Valuation', clue: 'Valued like a tech giant while building a fraction of the cars of Ford or GM.', signal: true, lean: 'bear' },
      { ic: '🕵️', label: 'Insider trades', clue: 'Elon Musk keeps buying more shares of his own company.', signal: true, lean: 'bull' },
      { ic: '📉', label: 'Short interest', clue: 'It is the single most bet-against stock on the entire market.', signal: true, lean: 'neutral' },
      { ic: '📰', label: 'Headlines', clue: "Musk's erratic tweets keep triggering lawsuits and drama.", signal: false, lean: 'bear' },
      { ic: '🔥', label: 'Social buzz', clue: 'Fans and short-sellers wage war on Twitter every single day.', signal: false, lean: 'neutral' },
    ],
    outcome: 'Over the next three years, Tesla rose more than 10×.',
    note: 'This was a real coin-flip in 2019: genuine bankruptcy risk against genuine product traction and an insider buying. Strong evidence on BOTH sides — no answer to look up, only how much to risk. Size was everything.',
  },
  {
    name: 'Peloton', when: 'September 2020', price: '$100',
    frame: 'The lockdown darling — everyone stuck at home is buying its bikes. Ride the wave, or too late?',
    sources: [
      { ic: '📊', label: 'Financials', clue: 'Sales are exploding; the bikes are sold out for months.', signal: true, lean: 'bull' },
      { ic: '📈', label: 'Valuation', clue: 'Priced as if people keep working out at home forever.', signal: true, lean: 'bear' },
      { ic: '⚙️', label: 'The business', clue: 'It sells expensive hardware people mostly buy once — then what?', signal: true, lean: 'bear' },
      { ic: '⚔️', label: 'Competition', clue: 'Cheaper copycats are launching, and real gyms are waiting to reopen.', signal: true, lean: 'bear' },
      { ic: '📰', label: 'Headlines', clue: 'Celebrities keep showing off their Pelotons on TV.', signal: false, lean: 'bull' },
      { ic: '🔥', label: 'Social buzz', clue: '#PelotonFamily is all over Instagram.', signal: false, lean: 'bull' },
    ],
    outcome: 'Peloton fell roughly 75% over the following year as gyms reopened.',
    note: 'The durable question was simple — what happens when gyms reopen? — and that bearish signal was buried under feel-good hype. Here, reading the signal would have saved you. It still took a year to play out.',
  },
];

const LEAN = { bull: { cls: 'bull', tag: 'points up' }, bear: { cls: 'bear', tag: 'points down' }, neutral: { cls: 'neu', tag: 'mixed' } };
const CONV = [
  { id: 'avoid', label: 'Avoid it', sub: 'The evidence is not worth the risk.' },
  { id: 'small', label: 'Small bet', sub: 'Some conviction, but hedge your doubt.' },
  { id: 'big', label: 'Big bet', sub: 'Only if the evidence is strong AND clean.' },
];

export default function InvestGame() {
  const [phase, setPhase] = useState('intro'); // intro | invest | decide | reveal | outro
  const [ci, setCi] = useState(0);
  const [opened, setOpened] = useState([]);   // indices opened this case
  const [pick, setPick] = useState(null);
  const [results, setResults] = useState([]);

  const C = CASES[ci];
  const looksLeft = ATTENTION - opened.length;

  function startCase() { setOpened([]); setPick(null); setPhase('invest'); }
  function open(i) { if (opened.includes(i) || looksLeft <= 0) return; setOpened([...opened, i]); }
  function decide(conv) {
    setPick(conv);
    const foundSignals = opened.filter((i) => C.sources[i].signal).length;
    const noise = opened.filter((i) => !C.sources[i].signal).length;
    setResults([...results, { name: C.name, conv, foundSignals, noise, looked: opened.length }]);
    setPhase('reveal');
  }
  function next() {
    if (ci >= CASES.length - 1) { setPhase('outro'); return; }
    setCi(ci + 1); setOpened([]); setPick(null); setPhase('invest');
  }
  function restart() { setCi(0); setOpened([]); setPick(null); setResults([]); setPhase('intro'); }

  /* ---------- intro ---------- */
  if (phase === 'intro') {
    return (
      <div className="iv-page">
        <div className="iv-col iv-mid">
          <p className="iv-kick">Investment Time Machine · the investigation</p>
          <h1 className="iv-title">Find what everyone else missed.</h1>
          <p className="iv-lead">Real investing isn't reading a summary. It's digging through <b>noise</b> for the few <b>signals</b> that matter — then deciding how hard to bet, before you can ever be sure.</p>
          <p className="iv-lead">Your <b>attention is limited</b>. In each case you may investigate only <b>{ATTENTION} of {CASES[0].sources.length}</b> sources. Choose what's worth a look. There is no "correct answer" to look up — only how well you read the evidence.</p>
          <button className="iv-btn iv-primary" onClick={() => { setCi(0); startCase(); }}>Open the first case →</button>
        </div>
      </div>
    );
  }

  /* ---------- outro ---------- */
  if (phase === 'outro') {
    const totalSignals = results.reduce((s, r) => s + r.foundSignals, 0);
    const totalNoise = results.reduce((s, r) => s + r.noise, 0);
    return (
      <div className="iv-page">
        <div className="iv-col">
          <p className="iv-kick">Case closed</p>
          <h1 className="iv-title">You read {results.length} companies.</h1>
          <div className="iv-scoreline">
            <div><span className="iv-scorenum bull">{totalSignals}</span><span className="iv-scorelbl">real signals dug up</span></div>
            <div><span className="iv-scorenum neu">{totalNoise}</span><span className="iv-scorelbl">noise clues chased</span></div>
          </div>
          <p className="iv-lead">That's the whole job: with limited attention, tell the few things that matter from the many that don't — then size your bet to how strong and clean the evidence is.</p>
          <p className="iv-lead iv-dim">Notice what never happened: the game never told you "right" or "wrong". Because in real investing, a perfect read still isn't a guarantee. Research buys <b>conviction</b>, never <b>certainty</b>.</p>
          <button className="iv-btn iv-primary" onClick={restart}>Investigate again →</button>
        </div>
      </div>
    );
  }

  /* ---------- reveal ---------- */
  if (phase === 'reveal') {
    return (
      <div className="iv-page">
        <div className="iv-col">
          <p className="iv-kick">{C.name} · {C.when} · what you dug up</p>
          <h1 className="iv-title2">Signal, or noise?</h1>
          <p className="iv-sub">Here's what the clues you chose were actually worth.</p>
          {opened.map((i) => { const s = C.sources[i]; return (
            <div className={'iv-rev ' + (s.signal ? 'sig' : 'noi')} key={i}>
              <span className="iv-rev-ic">{s.ic}</span>
              <div className="iv-rev-body">
                <div className="iv-rev-head"><span className="iv-rev-label">{s.label}</span><span className={'iv-rev-tag ' + (s.signal ? 'sig' : 'noi')}>{s.signal ? 'SIGNAL' : 'noise'}</span></div>
                <p className="iv-rev-clue">{s.clue}</p>
              </div>
            </div>
          ); })}
          {opened.length < ATTENTION && <p className="iv-missed">You had attention to spare — you looked at only {opened.length}.</p>}
          <div className="iv-outcome">
            <p className="iv-outcome-h">What actually happened</p>
            <p className="iv-outcome-b">{C.outcome}</p>
            <p className="iv-outcome-note">{C.note}</p>
          </div>
          <button className="iv-btn iv-primary" onClick={next}>{ci >= CASES.length - 1 ? 'Close the casebook →' : 'Next investigation →'}</button>
        </div>
      </div>
    );
  }

  /* ---------- decide ---------- */
  if (phase === 'decide') {
    return (
      <div className="iv-page">
        <div className="iv-col">
          <p className="iv-kick">{C.name} · {C.when} · {C.price}</p>
          <h1 className="iv-title2">How much conviction?</h1>
          <p className="iv-sub">You gathered {opened.length} clue{opened.length === 1 ? '' : 's'}. No one will ever hand you certainty. Bet to how strong — and how clean — your evidence feels.</p>
          <div className="iv-notes">
            {opened.map((i) => <div className="iv-note-row" key={i}><span>{C.sources[i].ic}</span><span>{C.sources[i].clue}</span></div>)}
          </div>
          <div className="iv-conv">
            {CONV.map((o) => <button key={o.id} className="iv-choice" onClick={() => decide(o.id)}><b>{o.label}</b><span>{o.sub}</span></button>)}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- invest ---------- */
  return (
    <div className="iv-page">
      <div className="iv-col">
        <div className="iv-case-head">
          <p className="iv-kick">{C.name} · {C.when} · trading at {C.price}</p>
          <p className="iv-frame">{C.frame}</p>
        </div>
        <div className="iv-attn">
          <span className="iv-attn-lbl">Attention</span>
          <span className="iv-attn-dots">{Array.from({ length: ATTENTION }).map((_, k) => <span key={k} className={'iv-adot ' + (k < looksLeft ? 'on' : 'off')} />)}</span>
          <span className="iv-attn-txt">{looksLeft > 0 ? `${looksLeft} look${looksLeft === 1 ? '' : 's'} left` : 'attention spent'}</span>
        </div>

        <div className="iv-grid">
          {C.sources.map((s, i) => { const isOpen = opened.includes(i); const locked = !isOpen && looksLeft <= 0; return (
            <button key={i} className={'iv-src' + (isOpen ? ' open' : '') + (locked ? ' locked' : '')} disabled={isOpen || locked} onClick={() => open(i)}>
              <span className="iv-src-ic">{s.ic}</span>
              <span className="iv-src-label">{s.label}</span>
              {isOpen ? <span className="iv-src-state">✓ read</span> : locked ? <span className="iv-src-state">—</span> : <span className="iv-src-state look">investigate</span>}
            </button>
          ); })}
        </div>

        {opened.length > 0 && (
          <div className="iv-notes">
            <p className="iv-notes-h">Your notes</p>
            {opened.map((i) => <div className="iv-note-row fresh" key={i}><span className="iv-note-ic">{C.sources[i].ic}</span><span>{C.sources[i].clue}</span></div>)}
          </div>
        )}

        <button className={'iv-btn iv-primary iv-decide' + (looksLeft === 0 ? ' urge' : '')} disabled={opened.length === 0} onClick={() => setPhase('decide')}>
          {opened.length === 0 ? 'Investigate at least one source' : 'Enough — decide →'}
        </button>
        {opened.length > 0 && looksLeft > 0 && <p className="iv-decide-sub">Or keep digging — you have {looksLeft} look{looksLeft === 1 ? '' : 's'} left. Every look is one you can't spend elsewhere.</p>}
      </div>
    </div>
  );
}
