import { useState, useEffect } from "react";
import { saveEntry, getAllEntries, deleteEntry } from "../utils/notebookStorage";
import { getCoachingFeedback } from "../utils/geminiCoach";

export default function NotebookPage({ onBack }) {
  const [entries, setEntries]     = useState([]);
  const [selected, setSelected]   = useState(null);
  const [isWriting, setIsWriting] = useState(false);
  const [log, setLog]             = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const data = await getAllEntries();
    setEntries(data);
  };

  const handleGetFeedback = async () => {
    if (!log.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getCoachingFeedback(log);
      await saveEntry(log, response);
      const updatedEntries = await getAllEntries();
      setEntries(updatedEntries);
      setLog("");
      setIsWriting(false);
      setSelected(updatedEntries[0] ?? null);
    } catch (err) {
      setError(err.message || "Failed to get coaching feedback.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteEntry(id);
    setSelected(null);
    loadEntries();
  };

  const handleSaveOnly = async () => {
    if (!log.trim()) return;
    await saveEntry(log, null);
    await loadEntries();
    setLog("");
    setIsWriting(false);
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (isToday) return `Today, ${time}`;
    return `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
  };

  const formatResponse = (text) => {
    return text
      .split("\n")
      .filter((line) => line.trim())
      .map((line, i) => (
        <p
          key={i}
          style={{
            margin: "0 0 12px 0",
            color: "white",
            fontSize: "0.95rem",
            lineHeight: 1.8,
          }}
        >
          {line}
        </p>
      ));
  };

  return (
    <div style={styles.page}>

      {/* Top bar */}
      <div style={styles.topBar}>
        <button onClick={onBack} style={styles.backBtn}>← Back</button>
        <p style={styles.pageTitle}>Notebook</p>
        <button
          onClick={() => { setIsWriting(true); setSelected(null); }}
          style={styles.newBtn}
        >
          + New Entry
        </button>
      </div>

      <div style={styles.mainRow}>

        {/* Left — entries list */}
        <div style={styles.sidebar}>
          {entries.length === 0 && !isWriting && (
            <p style={styles.empty}>No entries yet. Write your first workout log.</p>
          )}
          {entries.map(entry => (
            <div
              key={entry.id}
              onClick={() => { setSelected(entry); setIsWriting(false); }}
              style={{
                ...styles.entryCard,
                ...(selected?.id === entry.id ? styles.entryCardActive : {}),
              }}
            >
              <p style={styles.entryDate}>{formatDate(entry.date)}</p>
              <p style={styles.entryPreview}>
                {entry.log.substring(0, 60)}...
              </p>
            </div>
          ))}
        </div>

        {/* Right — writing or viewing */}
        <div style={styles.content}>

          {/* New entry writing mode */}
          {isWriting && (
            <div style={styles.writeBox}>
              <p style={styles.writeLabel}>What did you do today?</p>
              <textarea
                value={log}
                onChange={(e) => setLog(e.target.value)}
                placeholder="e.g. Squats 4x5 at 80kg, felt strong on first 3 sets but last set struggled. Bicep curls 3x10 at 15kg. Overall good session."
                style={styles.textarea}
                rows={8}
              />
              {error && <p style={styles.error}>{error}</p>}
<div style={{ display: "flex", gap: "10px" }}>
  <button
    onClick={handleSaveOnly}
    disabled={!log.trim()}
    style={{
      ...styles.saveOnlyBtn,
      opacity: !log.trim() ? 0.5 : 1,
      flex: 1,
    }}
  >
    Save
  </button>
  <button
    onClick={handleGetFeedback}
    disabled={loading || !log.trim()}
    style={{
      ...styles.feedbackBtn,
      opacity: loading || !log.trim() ? 0.5 : 1,
      flex: 2,
    }}
  >
    {loading ? "Analyzing..." : "Get Coaching →"}
  </button>
</div>
            </div>
          )}

          {/* Viewing an entry */}
          {selected && !isWriting && (
            <div style={styles.viewBox}>
              <div style={styles.viewTop}>
                <p style={styles.viewDate}>{formatDate(selected.date)}</p>
                <button
                  onClick={() => handleDelete(selected.id)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>

              <div style={styles.section}>
                <p style={styles.sectionLabel}>YOUR LOG</p>
                <p style={styles.logText}>{selected.log}</p>
              </div>

              <div style={styles.divider} />

              <div style={styles.responseBox}>
  {selected.response 
    ? formatResponse(selected.response)
    : <p style={{ color: "#333", fontSize: "0.8rem" }}>No coaching feedback — click Get Coaching to analyze.</p>
  }
</div>
            </div>
          )}

          {/* Nothing selected */}
          {!isWriting && !selected && (
            <div style={styles.emptyState}>
              <p style={styles.emptyIcon}>📓</p>
              <p style={styles.emptyText}>Select an entry or write a new one</p>
            </div>
          )}

        </div>
      </div>
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
    gap: "20px",
    fontFamily: "'Segoe UI', sans-serif",
    boxSizing: "border-box",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: "900px",
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
  newBtn: {
    background: "none",
    border: "1px solid #00ff88",
    color: "#00ff88",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  mainRow: {
    display: "flex",
    gap: "20px",
    width: "100%",
    maxWidth: "900px",
    alignItems: "flex-start",
  },
  sidebar: {
    width: "240px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  entryCard: {
    backgroundColor: "#111127",
    border: "1px solid #1e1e3f",
    borderRadius: "12px",
    padding: "14px",
    cursor: "pointer",
  },
  entryCardActive: {
    borderColor: "#00ff88",
  },
  entryDate: {
    color: "#555",
    fontSize: "0.7rem",
    margin: "0 0 4px",
    letterSpacing: "1px",
  },
  entryPreview: {
    color: "#888",
    fontSize: "0.8rem",
    margin: 0,
    lineHeight: 1.4,
  },
  content: {
    flex: 1,
    backgroundColor: "#111127",
    border: "1px solid #1e1e3f",
    borderRadius: "16px",
    padding: "24px",
    minHeight: "400px",
  },
  writeBox: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  writeLabel: {
    color: "#888",
    fontSize: "0.85rem",
    margin: 0,
  },
  textarea: {
    backgroundColor: "#0a0a1a",
    border: "1px solid #1e1e3f",
    borderRadius: "10px",
    color: "white",
    fontSize: "0.9rem",
    padding: "14px",
    resize: "vertical",
    outline: "none",
    fontFamily: "'Segoe UI', sans-serif",
    lineHeight: 1.6,
    width: "100%",
    boxSizing: "border-box",
  },
  feedbackBtn: {
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#00ff88",
    color: "#0a0a1a",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  error: {
    color: "#ff4444",
    fontSize: "0.8rem",
    margin: 0,
  },
  viewBox: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  viewTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewDate: {
    color: "#555",
    fontSize: "0.75rem",
    margin: 0,
    letterSpacing: "1px",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#333",
    fontSize: "0.75rem",
    cursor: "pointer",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  sectionLabel: {
    color: "#333",
    fontSize: "0.65rem",
    letterSpacing: "3px",
    margin: 0,
  },
  logText: {
    color: "#888",
    fontSize: "0.85rem",
    lineHeight: 1.6,
    margin: 0,
  },
  divider: {
    height: "1px",
    backgroundColor: "#1e1e3f",
  },
  responseBox: {
    display: "flex",
    flexDirection: "column",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "300px",
    gap: "12px",
  },
  emptyIcon: { fontSize: "2.5rem" },
  emptyText: { color: "#333", fontSize: "0.85rem" },
  empty: {
    color: "#333",
    fontSize: "0.8rem",
    textAlign: "center",
    padding: "20px 0",
  },
  saveOnlyBtn: {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #1e1e3f",
    backgroundColor: "transparent",
    color: "#666",
    fontSize: "0.9rem",
    cursor: "pointer",
  },
};
