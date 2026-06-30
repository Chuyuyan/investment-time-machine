import { useState } from 'react';
import Signals from './Signals.jsx';
import WhyCapture from './WhyCapture.jsx';

// One decision node = one emotional beat. Sub-steps:
//   decide   -> story + fog-of-war signals + 4 choices
//   why      -> capture the why (one tap)
//   feedback -> process-only feedback + cliffhanger -> next day
export default function DayScreen({
  day,
  dayNumber,
  totalDays,
  context,
  motivationsById,
  onComplete,
}) {
  const [step, setStep] = useState('decide');
  const [choice, setChoice] = useState(null);
  const [motivation, setMotivation] = useState(null);

  const isLastDay = dayNumber === totalDays;

  function pickChoice(c) {
    setChoice(c);
    setStep('why');
  }

  function pickWhy(motivationId) {
    setMotivation(motivationsById[motivationId]);
    setStep('feedback');
  }

  return (
    <div className="screen day-screen">
      <header className="day-header">
        <span className="day-pill">
          Day {dayNumber} / {totalDays}
        </span>
        <span className="day-date">{day.date}</span>
      </header>
      <h1 className="day-title">{day.title}</h1>

      {step === 'decide' && (
        <>
          <p className="story">{day.story}</p>
          <Signals signals={day.signals} />
          <p className="prompt">{day.prompt}</p>
          <div className="choices">
            {day.choices.map((c) => (
              <button key={c.id} className="choice-btn" onClick={() => pickChoice(c)}>
                {c.label}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 'why' && (
        <WhyCapture context={context} chosenLabel={choice.label} onPick={pickWhy} />
      )}

      {step === 'feedback' && (
        <div className="feedback-block">
          <div className="chosen-recap">
            You chose: <strong>{choice.label}</strong>
          </div>
          <blockquote className="why-recap">“{motivation.text}”</blockquote>
          <p className="feedback">{choice.feedback}</p>
          <p className="cliffhanger">{day.cliffhanger}</p>
          <button className="primary-btn" onClick={() => onComplete(choice, motivation)}>
            {isLastDay ? 'See your results' : 'Continue'}
          </button>
        </div>
      )}
    </div>
  );
}
