import { STAGE_COLORS, formatDate } from "../stageConfig";

export default function ApplicationCard({ app, onOpen, onDragStart, isDragging }) {
  return (
    <div
      className={`card${isDragging ? " dragging" : ""}`}
      style={{ "--stage-color": STAGE_COLORS[app.stage] }}
      draggable
      onDragStart={(e) => onDragStart(e, app)}
      onClick={() => onOpen(app)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen(app);
      }}
    >
      <div className="company">{app.company}</div>
      <div className="role">{app.role}</div>
      <div className="meta">
        {app.location && <span>{app.location}</span>}
        {app.ctcOrStipend && <span>{app.ctcOrStipend}</span>}
        {app.appliedOn && <span>{formatDate(app.appliedOn)}</span>}
      </div>
      {app.nextActionAt && (
        <div className="next-action">next: {formatDate(app.nextActionAt)}</div>
      )}
    </div>
  );
}
