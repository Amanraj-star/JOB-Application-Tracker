import { useState } from "react";
import ApplicationCard from "./ApplicationCard";
import { STAGE_COLORS } from "../stageConfig";

export default function KanbanColumn({ stage, apps, draggingId, onDragStart, onDropCard, onOpenCard, onAddCard }) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      className={`column${isOver ? " drag-over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        onDropCard(stage, apps.length);
      }}
    >
      <div className="column-head">
        <div className="title">
          <span className="swatch" style={{ background: STAGE_COLORS[stage] }} />
          {stage}
        </div>
        <span className="count">{apps.length}</span>
      </div>

      <div className="column-body">
        {apps.length === 0 && <div className="column-empty">Nothing here yet — drag a card in or add one below.</div>}
        {apps.map((app, index) => (
          <div
            key={app._id}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOver(false);
              onDropCard(stage, index);
            }}
          >
            <ApplicationCard
              app={app}
              onOpen={onOpenCard}
              onDragStart={onDragStart}
              isDragging={draggingId === app._id}
            />
          </div>
        ))}
      </div>

      <button className="column-add" onClick={() => onAddCard(stage)}>
        + Add application
      </button>
    </div>
  );
}
