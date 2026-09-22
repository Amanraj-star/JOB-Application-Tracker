const STAGES = ["Wishlist", "Applied", "OA", "Interview", "Offer"];

export default function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      <div className="auth-hero">
        <div className="wordmark">
          <span style={{ color: "var(--blue)" }}>●</span> Pipeline
        </div>
        <div className="pitch">
          <h1>Every application, tracked in one place.</h1>
          <p>
            A board built for placement season — log every company you apply to, drag cards across
            stages as recruiters respond, and never lose track of what's pending.
          </p>
          <div className="stage-strip" style={{ marginTop: 28 }}>
            {STAGES.map((s) => (
              <span key={s} className="stage-chip">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div style={{ color: "var(--text-faint)", fontSize: 13 }}>Built for one thing: getting hired.</div>
      </div>
      <div className="auth-form-side">
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
}
