// Capture the Why — one tap, the data spine. Re-skins 4 motivations for the
// day's context. The tapped motivationId feeds the DNA vector.
export default function WhyCapture({ context, chosenLabel, onPick }) {
  return (
    <div className="why-capture">
      <div className="chosen-recap">
        You chose: <strong>{chosenLabel}</strong>
      </div>
      <h2 className="why-prompt">{context.prompt}</h2>
      <p className="why-sub">One tap. Be honest — this is just for you.</p>
      <div className="why-options">
        {context.options.map((o) => (
          <button key={o.motivationId} className="why-btn" onClick={() => onPick(o.motivationId)}>
            {o.text}
          </button>
        ))}
      </div>
    </div>
  );
}
