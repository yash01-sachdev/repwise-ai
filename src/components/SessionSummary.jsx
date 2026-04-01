import { EXERCISES } from "../utils/exercises/index";
import { calcScore } from "../utils/bestSetScore";

export default function SessionSummary({ exerciseId, weight, reps, formScore, onSave, onDiscard }) {
  const exercise = EXERCISES[exerciseId];
  const score = calcScore(weight, reps);

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <p style={styles.topLabel}>Set Complete</p>
        <h1 style={styles.reps}>{reps}</h1>
        <p style={styles.repsLabel}>reps</p>

        <div style={styles.divider} />

        <div style={styles.row}>
          <span style={styles.rowLabel}>Exercise</span>
          <span style={styles.rowVal}>{exercise.name}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.rowLabel}>Weight</span>
          <span style={styles.rowVal}>
            {weight > 0 ? `${weight} kg` : "Bodyweight"}
          </span>
        </div>

        <div style={styles.row}>
          <span style={styles.rowLabel}>Set score</span>
          <span style={styles.rowVal}>{Math.round(score)}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.rowLabel}>Form</span>
          <span style={{
            ...styles.rowVal,
            color: formScore === "good" ? "#00ff88" : "#ffaa00"
          }}>
            {formScore === "good" ? "✅ Good" : "⚠️ Watch form"}
          </span>
        </div>

        <div style={styles.divider} />

        <button onClick={onSave} style={styles.saveBtn}>
          Save Session
        </button>

        <button onClick={onDiscard} style={styles.discardBtn}>
          Discard
        </button>

      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#0a0a1a",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "20px",
  },
  card: {
    backgroundColor: "#111127",
    border: "1px solid #1e1e3f",
    borderRadius: "20px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "360px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  topLabel: {
    color: "#444",
    fontSize: "0.75rem",
    letterSpacing: "3px",
    textTransform: "uppercase",
    margin: 0,
  },
  reps: {
    color: "white",
    fontSize: "6rem",
    fontWeight: "900",
    margin: 0,
    lineHeight: 1,
  },
  repsLabel: {
    color: "#444",
    fontSize: "0.85rem",
    margin: 0,
    letterSpacing: "2px",
  },
  divider: {
    width: "100%",
    height: "1px",
    backgroundColor: "#1e1e3f",
    margin: "8px 0",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
  rowLabel: {
    color: "#555",
    fontSize: "0.85rem",
  },
  rowVal: {
    color: "white",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  saveBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#00ff88",
    color: "#0a0a1a",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "8px",
  },
  discardBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #1e1e3f",
    backgroundColor: "transparent",
    color: "#444",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
};