import { useState } from 'react';
import { campaign, whys, contextsByName, motivationsById } from './content.js';
import Intro from './components/Intro.jsx';
import DayScreen from './components/DayScreen.jsx';
import Autopsy from './components/Autopsy.jsx';
import { runCampaign } from './engine/money.js';
import { dqAverage, riskBucket, verdict } from './engine/scoring.js';
import { emptyVector, accumulate, nearestArchetype } from './engine/dna.js';

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

    setResults({
      ...camp,
      dqScore: dq,
      riskBucket: bucket,
      verdict: v,
      archetype: arch.archetype,
      dnaAveraged: arch.averaged,
      run: nextRun,
    });
    setScreen('autopsy');
  }

  if (screen === 'intro') return <Intro meta={campaign.meta} onStart={startGame} />;
  if (screen === 'autopsy') {
    return <Autopsy results={results} campaign={campaign} onRestart={startGame} />;
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
