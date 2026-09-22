import { useEffect, useState } from "react";
import { STAGE_ORDER, formatDate } from "../stageConfig";

const emptyForm = {
  company: "",
  role: "",
  location: "",
  stage: "Applied",
  ctcOrStipend: "",
  jobUrl: "",
  appliedOn: "",
  nextActionAt: "",
  notes: "",
};

function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function ApplicationModal({ initial, defaultStage, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(initial);

  useEffect(() => {
    if (initial) {
      setForm({
        company: initial.company || "",
        role: initial.role || "",
        location: initial.location || "",
        stage: initial.stage || "Applied",
        ctcOrStipend: initial.ctcOrStipend || "",
        jobUrl: initial.jobUrl || "",
        appliedOn: toDateInput(initial.appliedOn),
        nextActionAt: toDateInput(initial.nextActionAt),
        notes: initial.notes || "",
      });
    } else {
      setForm({ ...emptyForm, stage: defaultStage || "Applied" });
    }
  }, [initial, defaultStage]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h3>{isEditing ? "Edit application" : "New application"}</h3>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="company">Company</label>
              <input
                id="company"
                required
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="e.g. Razorpay"
              />
            </div>
            <div className="field">
              <label htmlFor="role">Role</label>
              <input
                id="role"
                required
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. SDE Intern"
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Bengaluru / Remote"
              />
            </div>
            <div className="field">
              <label htmlFor="stage">Stage</label>
              <select id="stage" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
                {STAGE_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="ctc">CTC / stipend</label>
              <input
                id="ctc"
                value={form.ctcOrStipend}
                onChange={(e) => setForm({ ...form, ctcOrStipend: e.target.value })}
                placeholder="e.g. 12 LPA"
              />
            </div>
            <div className="field">
              <label htmlFor="jobUrl">Job link</label>
              <input
                id="jobUrl"
                value={form.jobUrl}
                onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
                placeholder="https://…"
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="appliedOn">Applied on</label>
              <input
                id="appliedOn"
                type="date"
                value={form.appliedOn}
                onChange={(e) => setForm({ ...form, appliedOn: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="nextActionAt">Next action date</label>
              <input
                id="nextActionAt"
                type="date"
                value={form.nextActionAt}
                onChange={(e) => setForm({ ...form, nextActionAt: e.target.value })}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Interviewer names, rounds covered, referral contact…"
            />
          </div>

          <div className="modal-actions">
            <div>
              {isEditing && (
                <button type="button" className="btn btn-danger" onClick={() => onDelete(initial._id)}>
                  Delete
                </button>
              )}
            </div>
            <div className="right">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : isEditing ? "Save changes" : "Add to board"}
              </button>
            </div>
          </div>
        </form>

        {isEditing && initial.timeline?.length > 0 && (
          <div className="timeline">
            <h4>Stage history</h4>
            {initial.timeline
              .slice()
              .reverse()
              .map((t, i) => (
                <div className="timeline-item" key={`${t.stage}-${i}`}>
                  <span className="dot" />
                  <span>{t.stage}</span>
                  <span className="when">{formatDate(t.at)}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
