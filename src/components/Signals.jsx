// Fog of war: 3 competing signals per node (bull / caution / noise / bear).
// We label by tone but deliberately do NOT mark any signal as "correct".
const TONE_LABEL = {
  bull: 'Bullish',
  bear: 'Bearish',
  caution: 'Caution',
  noise: 'Chatter',
};

export default function Signals({ signals }) {
  return (
    <div className="signals">
      {signals.map((s, i) => (
        <div key={i} className={`signal signal-${s.tone}`}>
          <span className="signal-tag">{TONE_LABEL[s.tone] || s.tone}</span>
          <p>{s.text}</p>
        </div>
      ))}
    </div>
  );
}
