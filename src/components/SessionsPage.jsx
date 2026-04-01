import { useState, useEffect } from "react";
import { getAllSessions, deleteSession } from "../utils/sessionStorage";
import { getBestSet, getMaxWeight, calcScore } from "../utils/bestSetScore";
import { EXERCISES } from "../utils/exercises/index";



export default function SessionsPage({ onBack }) {
  const [sessions, setSessions]   = useState([]);
  const [filter, setFilter]       = useState("all");
  const [loading, setLoading]     = useState(true);

const [replayBlob, setReplayBlob] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const data = await getAllSessions();
    setSessions(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await deleteSession(id);
    loadSessions();
  };

  const filtered = filter === "all"
    ? sessions
    : sessions.filter(s => s.exerciseId === filter);

  const bestSet    = getBestSet(sessions);
  const maxWeight  = getMaxWeight(sessions, filter === "all" ? "squat" : filter);
  const totalSessions = sessions.length;

  const formatDate = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const isYesterday = new Date(now - 86400000).toDateString() === d.toDateString();
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (isToday)     return `Today, ${time}`;
    if (isYesterday) return `Yesterday, ${time}`;
    return `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
  };

  return (
    <div style={styles.page}>

      {/* Top bar */}
      <div style={styles.topBar}>
        <button onClick={onBack} style={styles.backBtn}>← Back</button>
        <p style={styles.pageTitle}>Sessions</p>
        <div style={{ width: "60px" }} />
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.stat}>
          <p style={styles.statLabel}>Max weight</p>
          <p style={styles.statVal}>
            {maxWeight > 0 ? `${maxWeight}` : "—"}
            {maxWeight > 0 && <span style={styles.statUnit}> kg</span>}
          </p>
          <p style={styles.statSub}>
            {filter === "all" ? "Squat PR" : `${EXERCISES[filter]?.name} PR`}
          </p>
        </div>
        <div style={styles.stat}>
          <p style={styles.statLabel}>Sessions</p>
          <p style={styles.statVal}>{totalSessions}</p>
          <p style={styles.statSub}>all time</p>
        </div>
        <div style={styles.stat}>
          <p style={styles.statLabel}>Best set</p>
          <p style={styles.statVal}>
            {bestSet ? Math.round(calcScore(bestSet.weight, bestSet.reps)) : "—"}
          </p>
          <p style={styles.statSub}>
            {bestSet
              ? `${bestSet.weight > 0 ? bestSet.weight + "kg" : "BW"} × ${bestSet.reps} reps`
              : "no sets yet"}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div style={styles.filterRow}>
        {["all", ...Object.keys(EXERCISES)].map(id => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            style={{
              ...styles.filterBtn,
              ...(filter === id ? styles.filterActive : {}),
            }}
          >
            {id === "all" ? "All" : EXERCISES[id].name}
          </button>
        ))}
      </div>

      {/* Sessions list */}
      {loading ? (
        <p style={styles.empty}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={styles.empty}>No sessions yet. Complete a set to see it here.</p>
      ) : (
        <div style={styles.list}>
          {filtered.map(session => {
            const ex = EXERCISES[session.exerciseId];
            const isPR = session.id === bestSet?.id;
            return (
              <div key={session.id} style={styles.card}>
                <div style={styles.exIcon}>{ex?.icon || "??"}</div>
                <div style={styles.cardBody}>
                  <div style={styles.cardTitleRow}>
                    <p style={styles.cardTitle}>{ex?.name || session.exerciseId}</p>
                    {isPR && <span style={styles.prBadge}>PR</span>}
                  </div>
                  <p style={styles.cardMeta}>
                    {formatDate(session.date)} · {session.weight > 0 ? `${session.weight} kg` : "Bodyweight"}
                  </p>
                </div>
                <div style={styles.cardRight}>
                  <span style={styles.repBadge}>
                    {session.reps} <span style={styles.repLabel}>reps</span>
                  </span>
                  <span style={{
                    ...styles.formBadge,
                    backgroundColor: session.formScore === "good" ? "#00ff8822" : "#ffaa0022",
                    color: session.formScore === "good" ? "#00ff88" : "#ffaa00",
                  }}>
                    {session.formScore === "good" ? "Good form" : "Watch form"}
                  </span>
                  
                  <button
  onClick={() => {
    if (session.videoBuffer) {
      const blob = new Blob([session.videoBuffer], { 
        type: session.videoType || "video/webm" 
      });
      setReplayBlob(blob);
    }
  }}
  style={styles.replayBtn}
  disabled={!session.videoBuffer}
>
  {session.videoBuffer ? "Replay" : "No video"}
</button>

                  <button
                    onClick={() => handleDelete(session.id)}
                    style={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

{replayBlob && (
  <div style={styles.modalOverlay} onClick={() => setReplayBlob(null)}>
    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
      <div style={styles.modalTop}>
        <p style={styles.modalTitle}>Session Replay</p>
        <button onClick={() => setReplayBlob(null)} style={styles.closeBtn}>✕</button>
      </div>
      <video
        src={URL.createObjectURL(replayBlob)}
        controls
        autoPlay
        style={styles.video}
      />
    </div>
  </div>
)}
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#0a0a1a",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "'Segoe UI', sans-serif",
    gap: "16px",
    boxSizing: "border-box",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: "700px",
  },
  backBtn: {
    background: "none",
    border: "1px solid #222",
    color: "#555",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  pageTitle: {
    color: "white",
    fontSize: "1.1rem",
    fontWeight: "600",
    margin: 0,
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    width: "100%",
    maxWidth: "700px",
  },
  stat: {
    backgroundColor: "#111127",
    border: "1px solid #1e1e3f",
    borderRadius: "12px",
    padding: "16px",
  },
  statLabel: {
    color: "#444",
    fontSize: "0.65rem",
    letterSpacing: "2px",
    textTransform: "uppercase",
    margin: "0 0 4px",
  },
  statVal: {
    color: "white",
    fontSize: "1.6rem",
    fontWeight: "700",
    margin: 0,
  },
  statUnit: {
    fontSize: "0.9rem",
    color: "#555",
  },
  statSub: {
    color: "#444",
    fontSize: "0.7rem",
    margin: "2px 0 0",
  },
  filterRow: {
    display: "flex",
    gap: "8px",
    width: "100%",
    maxWidth: "700px",
  },
  filterBtn: {
    border: "1px solid #1e1e3f",
    borderRadius: "20px",
    padding: "6px 16px",
    fontSize: "0.8rem",
    background: "none",
    color: "#555",
    cursor: "pointer",
  },
  filterActive: {
    backgroundColor: "#1e1e3f",
    color: "white",
    borderColor: "#333",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "100%",
    maxWidth: "700px",
  },
  card: {
    backgroundColor: "#111127",
    border: "1px solid #1e1e3f",
    borderRadius: "14px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  exIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    backgroundColor: "#1a1a3e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: "bold",
    color: "#555",
    flexShrink: 0,
    letterSpacing: "1px",
  },
  cardBody: { flex: 1 },
  cardTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "3px",
  },
  cardTitle: {
    color: "white",
    fontSize: "0.9rem",
    fontWeight: "600",
    margin: 0,
  },
  prBadge: {
    fontSize: "0.65rem",
    backgroundColor: "#00bfff22",
    color: "#00bfff",
    padding: "2px 7px",
    borderRadius: "6px",
    fontWeight: "bold",
  },
  cardMeta: {
    color: "#444",
    fontSize: "0.75rem",
    margin: 0,
  },
  cardRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "5px",
  },
  repBadge: {
    color: "white",
    fontSize: "1rem",
    fontWeight: "600",
  },
  repLabel: {
    color: "#555",
    fontSize: "0.7rem",
  },
  formBadge: {
    fontSize: "0.7rem",
    padding: "3px 8px",
    borderRadius: "6px",
    fontWeight: "500",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#333",
    fontSize: "0.7rem",
    cursor: "pointer",
    padding: 0,
  },
  empty: {
    color: "#333",
    fontSize: "0.85rem",
    textAlign: "center",
    marginTop: "40px",
  },

  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  modal: {
    backgroundColor: "#111127",
    border: "1px solid #1e1e3f",
    borderRadius: "16px",
    padding: "20px",
    width: "90%",
    maxWidth: "700px",
  },
  modalTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  modalTitle: {
    color: "white",
    fontSize: "1rem",
    fontWeight: "600",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#555",
    fontSize: "1.2rem",
    cursor: "pointer",
  },
  video: {
    width: "100%",
    borderRadius: "10px",
    backgroundColor: "#000",
  },
  replayBtn: {
    background: "none",
    border: "0.5px solid #1e1e3f",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "0.75rem",
    color: "#555",
    cursor: "pointer",
  },

};