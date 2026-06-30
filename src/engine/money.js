// Money engine — pure functions, no imports (data in, data out).
// Portfolio holds dollar amounts: { nvda, etf, cash, loan }.
// `loan` is a liability created by leverage; it is repaid once at the very end.
//
// Engine semantics (from campaign.json._readme):
//  - alloc      : rebalance to target FRACTIONS of the CURRENT gross total.
//  - hold:true  : no change.
//  - sellHalf   : move 50% of holdings (nvda + etf) into cash.
//  - leverage:N : borrow cash equal to (N-1)x the NVDA holding and buy more NVDA.
//  - After each day's choice, apply that phase's returns.

export function makePortfolio(startCash) {
  return { nvda: 0, etf: 0, cash: startCash, loan: 0 };
}

// Gross market value of the holdings (ignores the loan liability).
export function grossValue(p) {
  return p.nvda + p.etf + p.cash;
}

// What the investor actually owns after repaying the loan.
export function netValue(p) {
  return grossValue(p) - p.loan;
}

// Apply a single choice. Returns a NEW portfolio (never mutates the input).
export function applyChoice(p, choice) {
  const next = { ...p };

  if (choice.hold) {
    // no change to holdings
  } else if (choice.sellHalf) {
    const movedNvda = next.nvda * 0.5;
    const movedEtf = next.etf * 0.5;
    next.nvda -= movedNvda;
    next.etf -= movedEtf;
    next.cash += movedNvda + movedEtf;
  } else if (choice.alloc) {
    const total = grossValue(next);
    const a = choice.alloc;
    next.nvda = total * (a.nvda || 0);
    next.etf = total * (a.etf || 0);
    next.cash = total * (a.cash || 0);
  }

  // Leverage: borrow cash equal to (N-1)x current NVDA and pour it into NVDA.
  if (choice.leverage && choice.leverage > 1) {
    const borrowed = next.nvda * (choice.leverage - 1);
    next.nvda += borrowed;
    next.loan += borrowed;
  }

  return next;
}

// Apply one phase's returns to the holdings. The loan is fixed (no interest in MVP).
export function applyReturns(p, phase) {
  return {
    nvda: p.nvda * (1 + (phase.nvda || 0)),
    etf: p.etf * (1 + (phase.etf || 0)),
    cash: p.cash * (1 + (phase.cash || 0)),
    loan: p.loan,
  };
}

// Run a full campaign: for each day, apply the choice then that day's phase return.
//   choices  : array of choice objects (one per day, in order)
//   engine   : campaign.engine (uses engine.phaseReturns)
//   startCash: campaign.meta.startCash
// Returns { portfolio, finalValue, returnPct, history }.
export function runCampaign(choices, engine, startCash) {
  let p = makePortfolio(startCash);
  const history = [{ stage: 'start', portfolio: p }];

  for (let i = 0; i < choices.length; i++) {
    p = applyChoice(p, choices[i]);
    history.push({ stage: `Day ${i + 1} choice (${choices[i].id})`, portfolio: p });

    const phase = engine.phaseReturns[i];
    if (phase) {
      p = applyReturns(p, phase);
      history.push({ stage: phase.label, portfolio: p });
    }
  }

  const finalValue = netValue(p);
  const returnPct = (finalValue - startCash) / startCash;
  return { portfolio: p, finalValue, returnPct, history };
}
