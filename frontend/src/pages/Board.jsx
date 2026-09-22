import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import KanbanColumn from "../components/KanbanColumn";
import ApplicationModal from "../components/ApplicationModal";
import { STAGE_ORDER, STAGE_COLORS } from "../stageConfig";

export default function Board() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draggingId, setDraggingId] = useState(null);
  const [modalState, setModalState] = useState(null); // { mode: "create" | "edit", app?, stage? }

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    try {
      const { applications } = await api.listApplications();
      setApps(applications);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const grouped = useMemo(() => {
    const map = Object.fromEntries(STAGE_ORDER.map((s) => [s, []]));
    apps.forEach((a) => map[a.stage]?.push(a));
    Object.values(map).forEach((list) => list.sort((a, b) => a.order - b.order));
    return map;
  }, [apps]);

  function handleDragStart(e, app) {
    setDraggingId(app._id);
    e.dataTransfer.effectAllowed = "move";
  }

  async function handleDropCard(targetStage, targetIndex) {
    const dragged = apps.find((a) => a._id === draggingId);
    setDraggingId(null);
    if (!dragged) return;
    if (dragged.stage === targetStage && grouped[targetStage][targetIndex]?._id === dragged._id) return;

    // Optimistic reorder in local state
    const withoutDragged = apps.filter((a) => a._id !== dragged._id);
    const destList = withoutDragged.filter((a) => a.stage === targetStage).sort((a, b) => a.order - b.order);
    const clampedIndex = Math.min(targetIndex, destList.length);
    destList.splice(clampedIndex, 0, { ...dragged, stage: targetStage });
    const reindexedDest = destList.map((a, i) => ({ ...a, order: i }));

    const others = withoutDragged.filter((a) => a.stage !== targetStage);
    setApps([...others, ...reindexedDest]);

    try {
      await api.moveApplication(dragged._id, { stage: targetStage, order: clampedIndex });
      loadApplications();
    } catch (err) {
      setError(err.message);
      loadApplications();
    }
  }

  function openCreate(stage) {
    setModalState({ mode: "create", stage });
  }

  function openEdit(app) {
    setModalState({ mode: "edit", app });
  }

  async function handleSave(form) {
    const payload = {
      ...form,
      appliedOn: form.appliedOn || null,
      nextActionAt: form.nextActionAt || null,
    };

    if (modalState.mode === "create") {
      await api.createApplication(payload);
    } else {
      await api.updateApplication(modalState.app._id, payload);
    }
    setModalState(null);
    loadApplications();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this application? This can't be undone.")) return;
    try {
      await api.deleteApplication(id);
      setModalState(null);
      loadApplications();
    } catch (err) {
      setError(err.message);
    }
  }

  const totals = useMemo(() => {
    const active = apps.filter((a) => !["Rejected", "Wishlist"].includes(a.stage)).length;
    const offers = grouped.Offer?.length || 0;
    return { total: apps.length, active, offers };
  }, [apps, grouped]);

  if (loading) return <div className="center-loader">Loading your board…</div>;

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span className="dot" /> Pipeline
        </div>
        <div className="topbar-right">
          <span className="user-badge">{user?.name}</span>
          <button
            className="btn btn-ghost"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="stats-strip">
        <div className="stat">
          <span className="n">{totals.total}</span>
          <span className="label">total applications</span>
        </div>
        <div className="stat">
          <span className="n">{totals.active}</span>
          <span className="label">in motion</span>
        </div>
        <div className="stat">
          <span className="n" style={{ color: STAGE_COLORS.Offer }}>
            {totals.offers}
          </span>
          <span className="label">offers</span>
        </div>
      </div>

      {error && (
        <div style={{ padding: "10px 24px 0" }}>
          <div className="error-banner">{error}</div>
        </div>
      )}

      <div className="board-wrap">
        <div className="board">
          {STAGE_ORDER.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              apps={grouped[stage]}
              draggingId={draggingId}
              onDragStart={handleDragStart}
              onDropCard={handleDropCard}
              onOpenCard={openEdit}
              onAddCard={openCreate}
            />
          ))}
        </div>
      </div>

      {modalState && (
        <ApplicationModal
          initial={modalState.mode === "edit" ? modalState.app : null}
          defaultStage={modalState.stage}
          onClose={() => setModalState(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
