export default function Intro({ meta, onStart }) {
  return (
    <div className="screen intro">
      <p className="kicker">Investment Time Machine</p>
      <h1 className="intro-title">{meta.title}</h1>
      <p className="intro-sub">{meta.subtitle}</p>

      <div className="card intro-card">
        <p className="intro-profile">{meta.profile}</p>
        <p className="intro-blurb">{meta.profileBlurb}</p>
        <p className="intro-meta">
          ~{meta.estimatedMinutes} min · 3 decisions · outcomes stay hidden until the end
        </p>
      </div>

      <button className="primary-btn" onClick={onStart}>
        Start
      </button>
      <p className="footnote">No real money. Real history. Real decisions.</p>
    </div>
  );
}
