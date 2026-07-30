import { useEffect, useState } from 'react';
import { campaign, whys, contextsByName, motivationsById } from './content.js';
import Intro from './components/Intro.jsx';
import DayScreen from './components/DayScreen.jsx';
import Autopsy from './components/Autopsy.jsx';
import AccountBar from './components/AccountBar.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import { runCampaign } from './engine/money.js';
import { dqAverage, riskBucket, verdict } from './engine/scoring.js';
import { emptyVector, accumulate, nearestArchetype } from './engine/dna.js';
import { playkit, accountsEnabled, DQ_BOARD } from './playkitClient.js';

const initialRun = {
  chosenIds: [],
  chosenChoices: [],
  whyIds: [],
  dnaVector: emptyVector(),
};

export default function App() {
  const [screen, setScreen] = useState('intro'); // 'intro' | 'day' | 'autopsy'
  const [dayIndex, setDayIndex] = useState(0);
  const [run, setRun] = useState(initialRun);
  const [results, setResults] = useState(null);
  const [user, setUser] = useState(null);
  const [savedRuns, setSavedRuns] = useState(0);

  // Resume a session from a previous visit. Failure is fine — the player just
  // stays anonymous.
  useEffect(() => {
    if (!accountsEnabled) return;
    playkit.restore().then(setUser).catch(() => {});
  }, []);

  /**
   * Records a finished run for signed-in players: the full decision history
   * goes to their cloud save, and the Decision Quality score to the board.
   * Anonymous players simply skip this — nothing in the game depends on it.
   */
  async function recordRun(finished) {
    if (!accountsEnabled || !user) return;
    try {
      const existing = await playkit.loadProgress();
      const history = existing?.data?.history ?? [];
      const entry = {
        completedAt: new Date().toISOString(),
        campaignId: campaign.meta?.id ?? 'ai-boom',
        dqScore: finished.dqScore,
        returnPct: finished.returnPct,
        archetype: finished.archetype?.name ?? null,
        choices: finished.run.chosenIds,
        whys: finished.run.whyIds,
        dna: finished.run.dnaVector,
      };
      await playkit.saveProgress(
        { history: [...history, entry].slice(-50), dna: finished.run.dnaVector },
        existing?.version,
      );
      await playkit.submitScore(finished.dqScore, {
        board: DQ_BOARD,
        meta: { archetype: entry.archetype, returnPct: finished.returnPct },
      });
      setSavedRuns((n) => n + 1);
    } catch {
      // Losing a cloud save must never interrupt the Autopsy.
    }
  }

  function startGame() {
    setRun(initialRun);
    setDayIndex(0);
    setResults(null);
    setScreen('day');
  }

  // Called when a day's choice + why are locked in.
  function handleDayComplete(choice, motivation) {
    const nextRun = {
      chosenIds: [...run.chosenIds, choice.id],
      chosenChoices: [...run.chosenChoices, choice],
      whyIds: [...run.whyIds, motivation.id],
      dnaVector: accumulate(run.dnaVector, motivation.traits),
    };
    setRun(nextRun);

    if (dayIndex < campaign.days.length - 1) {
      setDayIndex(dayIndex + 1);
      return;
    }

    // Last day: compute everything (this is the data the Autopsy will render next).
    const camp = runCampaign(nextRun.chosenChoices, campaign.engine, campaign.meta.startCash);
    const dq = dqAverage(nextRun.chosenChoices);
    const bucket = riskBucket(dq);
    const v = verdict(camp.returnPct, dq, campaign.engine.thresholds);
    const arch = nearestArchetype(nextRun.dnaVector, nextRun.whyIds.length, whys.archetypes);

    const finished = {
      ...camp,
      dqScore: dq,
      riskBucket: bucket,
      verdict: v,
      archetype: arch.archetype,
      dnaAveraged: arch.averaged,
      run: nextRun,
    };
    setResults(finished);
    setScreen('autopsy');
    recordRun(finished);
  }

  if (screen === 'intro') {
    return (
      <>
        <AccountBar user={user} onUser={setUser} />
        <Intro meta={campaign.meta} onStart={startGame} />
      </>
    );
  }

  if (screen === 'autopsy') {
    return (
      <>
        <AccountBar user={user} onUser={setUser} />
        <Autopsy results={results} campaign={campaign} onRestart={startGame} />
        <Leaderboard user={user} refreshKey={savedRuns} />
      </>
    );
  }

  const day = campaign.days[dayIndex];
  return (
    <DayScreen
      key={day.id}
      day={day}
      dayNumber={dayIndex + 1}
      totalDays={campaign.days.length}
      context={contextsByName[day.whyContext]}
      motivationsById={motivationsById}
      onComplete={handleDayComplete}
    />
  );
}
