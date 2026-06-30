import { useState } from 'react';
import { whys, motivationsById, familiesById } from '../content.js';
import { num, money, pct, fill } from '../format.js';

// Placeholder for PostHog (Build Plan day 5). Marks the events we will capture.
function track(event, props) {
  // eslint-disable-next-line no-console
  console.log('[track]', event, props || {});
}

// The Decision Autopsy — the product's signature moment. Five sequential,
// full-screen acts, then reaction capture + share. Consumes the computed
// `results` from App (engine output); all copy comes from campaign.json.
export default function Autopsy({ results, campaign, onRestart }) {
  const [act, setAct] = useState(0);
  const A = campaign.autopsy;

  const { finalValue, returnPct, dqScore, riskBucket, verdict, archetype, history, run, dnaAveraged } =
    results;
  const v = campaign.verdicts[verdict];
  const dqRounded = Math.round(dqScore);

  // All-ETF benchmark (compounded) — used only to decide the Act 1 boast.
  const benchmark = campaign.engine.phaseReturns.reduce((acc, p) => acc * (1 + (p.etf || 0)), 1) - 1;
  const beatMarket = returnPct > benchmark;

  function go(next) {
    track('autopsy_act_view', { act: next });
    setAct(next);
  }

  const acts = [
    () => <ActVictoryLap A={A} finalValue={finalValue} returnPct={returnPct} beatMarket={beatMarket} />,
    () => <ActPivot A={A} />,
    () => <ActMirror A={A} run={run} campaign={campaign} />,
    () => <ActMultiverse A={A} campaign={campaign} riskBucket={riskBucket} returnPct={returnPct} />,
    () => <ActReframe A={A} v={v} dqRounded={dqRounded} archetype={archetype} />,
    () => (
      <ActShare
        A={A}
        v={v}
        dqRounded={dqRounded}
        results={{ history, run, dnaAveraged, finalValue, returnPct, dqScore, riskBucket }}
        onRestart={onRestart}
      />
    ),
  ];

  const isLast = act === acts.length - 1;

  return (
    <div className="screen autopsy">
      <div className="act-progress">
        {acts.map((_, i) => (
          <span key={i} className={`dot ${i <= act ? 'on' : ''}`} />
        ))}
      </div>

      {acts[act]()}

      {!isLast && (
        <button className="primary-btn" onClick={() => go(act + 1)}>
          {act === acts.length - 2 ? 'One more thing' : 'Continue'}
        </button>
      )}
    </div>
  );
}

/* ----------------------------- Act 1: Victory Lap ----------------------------- */
function ActVictoryLap({ A, finalValue, returnPct, beatMarket }) {
  let copy = fill(A.act1_victory_lap.copy, { finalValue: num(finalValue), returnPct: pct(returnPct) });
  if (!beatMarket) {
    copy = copy.replace(
      'You beat the market.',
      returnPct >= 0 ? 'You came out ahead.' : "You're down on the round - but stay with me.",
    );
  }
  return (
    <div className="act act-victory">
      <p className="act-kicker">{A.act1_victory_lap.title}</p>
      <p className={`big-number ${returnPct >= 0 ? 'pos' : 'neg'}`}>{pct(returnPct)}</p>
      <p className="act-copy">{copy}</p>
    </div>
  );
}

/* ------------------------------- Act 2: The Pivot ------------------------------ */
function ActPivot({ A }) {
  return (
    <div className="act act-pivot">
      <p className="act-copy big">{A.act2_pivot.copy}</p>
    </div>
  );
}

/* ------------------------------- Act 3: The Mirror ----------------------------- */
function ActMirror({ A, run, campaign }) {
  const items = run.chosenChoices.map((choice, i) => {
    const motivation = motivationsById[run.whyIds[i]];
    const family = familiesById[motivation.family];
    const day = campaign.days[i];
    return {
      key: choice.id,
      dayLabel: `${day.title} · ${day.date}`,
      choiceLabel: choice.label,
      whyText: motivation.text,
      biasLine: family.biasLine,
      valence: family.valence,
    };
  });

  return (
    <div className="act act-mirror">
      <p className="act-kicker">The Mirror</p>
      <p className="act-intro">{A.act3_mirror.intro}</p>
      <div className="mirror-list">
        {items.map((it) => (
          <div key={it.key} className={`mirror-card ${it.valence}`}>
            <div className="mirror-day">{it.dayLabel}</div>
            <div className="mirror-choice">You chose: {it.choiceLabel}</div>
            <blockquote className="mirror-why">“{it.whyText}”</blockquote>
            <div className="mirror-bias">{it.biasLine}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Act 4: The Multiverse --------------------------- */
function ActMultiverse({ A, campaign, riskBucket, returnPct }) {
  const cf = campaign.counterfactuals[riskBucket];
  const alex = campaign.alex;
  // Swap the "real" scenario's placeholder return for the player's actual result.
  const scenarios = cf.scenarios.map((s) => (s.id === 'real' ? { ...s, return: pct(returnPct) } : s));
  const toneClass = (t) => (t === 'good' ? 'good' : t === 'mild' ? 'mild' : 'bad');

  return (
    <div className="act act-multiverse">
      <p className="act-kicker">The Multiverse</p>
      <p className="act-intro">{A.act4_multiverse.intro}</p>

      <div className="mv-grid">
        {scenarios.map((s) => (
          <div key={s.id} className={`mv-card ${toneClass(s.tone)}`}>
            <div className="mv-label">{s.label}</div>
            <div className="mv-return">{s.return}</div>
            <div className="mv-note">{s.note}</div>
          </div>
        ))}
      </div>

      <p className="mv-punchline">{cf.punchline}</p>

      <div className="twin-box">
        <p className="twin-intro">{A.act4_multiverse.twinIntro}</p>
        <div className="twin-stats">
          <span>
            <strong>{alex.name}</strong> — {alex.tagline}
          </span>
          <span>Real: {alex.realReturn}</span>
          <span>Avg across worlds: {alex.avgReturn}</span>
          <span>Worst case: {alex.worstCase}</span>
        </div>
        <p className="twin-copy">{alex.comparisonCopy}</p>
      </div>
    </div>
  );
}

/* ------------------------------ Act 5: The Reframe ----------------------------- */
function ActReframe({ A, v, dqRounded, archetype }) {
  return (
    <div className="act act-reframe">
      <div className="verdict-box verdict-inline">
        <div className="verdict-headline">{v.headline}</div>
        <p>{v.body}</p>
      </div>
      <p className="act-copy">{fill(A.act5_reframe.copy, { dqScore: dqRounded })}</p>
      <p className="archetype-line">
        Right now you play like: <strong>{archetype.name}</strong>
      </p>
      <p className="hook">{A.act5_reframe.hook}</p>
    </div>
  );
}

/* --------------------- Final: Reaction capture + Share + dev -------------------- */
function ActShare({ A, v, dqRounded, results, onRestart }) {
  const rc = A.reaction_capture;
  const sc = A.share_card;
  const [surprised, setSurprised] = useState(null);
  const [rating, setRating] = useState(0);
  const [email, setEmail] = useState('');
  const [shareStatus, setShareStatus] = useState('');

  const shareText = `${fill(sc.line1, { dqScore: dqRounded })}\n${v.headline}\n${sc.cta}`;

  function submitReaction(value) {
    setSurprised(value);
    track('reaction_surprise', { surprised: value });
  }
  function submitRating(stars) {
    setRating(stars);
    track('reaction_rating', { stars });
  }
  function submitEmail() {
    if (email.trim()) track('email_capture', { email: email.trim() });
  }
  async function doShare() {
    track('share_click', {});
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText, title: 'Investment Time Machine' });
        setShareStatus('Shared.');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setShareStatus('Copied to clipboard.');
      } else {
        setShareStatus('Copy: ' + shareText);
      }
    } catch {
      setShareStatus('');
    }
  }

  return (
    <div className="act act-share">
      <p className="act-kicker">Before you go</p>

      <div className="reaction-block">
        <p className="reaction-q">{rc.surprise}</p>
        <div className="yesno">
          <button className={surprised === true ? 'sel' : ''} onClick={() => submitReaction(true)}>
            Yes
          </button>
          <button className={surprised === false ? 'sel' : ''} onClick={() => submitReaction(false)}>
            No
          </button>
        </div>

        <p className="reaction-q">{rc.rating}</p>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              className={`star ${s <= rating ? 'on' : ''}`}
              onClick={() => submitRating(s)}
              aria-label={`${s} star${s > 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="share-card">
        <div className="share-line1">{fill(sc.line1, { dqScore: dqRounded })}</div>
        <div className="share-line2">{v.headline}</div>
        <div className="share-cta">{sc.cta}</div>
      </div>
      <button className="primary-btn" onClick={doShare}>
        Share my result
      </button>
      {shareStatus && <p className="share-status">{shareStatus}</p>}

      <div className="email-block">
        <p className="reaction-q">{rc.emailHook}</p>
        <div className="email-row">
          <input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={submitEmail}>Notify me</button>
        </div>
      </div>

      <button className="secondary-btn" onClick={onRestart}>
        Play again
      </button>

      <DevTrace results={results} />
    </div>
  );
}

function DevTrace({ results }) {
  const { history, run, dnaAveraged } = results;
  return (
    <details className="dev-panel">
      <summary>Engine trace (dev)</summary>
      <p className="trace-line">Choices: {run.chosenIds.join('  ·  ')}</p>
      <p className="trace-line">Whys: {run.whyIds.join('  ·  ')}</p>
      <table className="trace-table">
        <thead>
          <tr>
            <th>Stage</th>
            <th>NVDA</th>
            <th>ETF</th>
            <th>Cash</th>
            <th>Loan</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h, i) => (
            <tr key={i}>
              <td>{h.stage}</td>
              <td>{money(h.portfolio.nvda)}</td>
              <td>{money(h.portfolio.etf)}</td>
              <td>{money(h.portfolio.cash)}</td>
              <td>{money(h.portfolio.loan)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="trace-line dna-trace">
        DNA (avg):{' '}
        {Object.entries(dnaAveraged)
          .map(([k, val]) => `${k} ${val.toFixed(1)}`)
          .join('  ·  ')}
      </p>
    </details>
  );
}
