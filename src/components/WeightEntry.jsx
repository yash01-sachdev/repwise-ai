import { useState } from "react";
import { EXERCISES } from "../utils/exercises/index";

export default function WeightEntry({ exerciseId, onStart }) {
  const [weight, setWeight] = useState("");
  const exercise = EXERCISES[exerciseId];

  const handleStart = (isBodyweight) => {
    onStart(isBodyweight ? 0 : parseFloat(weight) || 0);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconBox}>{exercise.icon}</div>
        <h2 style={styles.title}>{exercise.name}</h2>
        <p style={styles.camera}>📷 {exercise.camera}</p>

        <div style={styles.divider} />

        <p style={styles.label}>How much weight are you using?</p>

        <div style={styles.inputRow}>
          <input
            type="number"
            placeholder="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            style={styles.input}
            min="0"
            max="500"
          />
          <span style={styles.unit}>kg</span>
        </div>

        <button
          onClick={() => handleStart(false)}
          style={styles.startBtn}
          disabled={weight === ""}
        >
          Start Session
        </button>

        <button
          onClick={() => handleStart(true)}
          style={styles.skipBtn}
        >
          Bodyweight — no weight
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
  iconBox: {
    width: "60px",
    height: "60px",
    borderRadius: "14px",
    backgroundColor: "#1a1a3e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#555",
    letterSpacing: "1px",
  },
  title: {
    color: "white",
    fontSize: "1.5rem",
    fontWeight: "700",
    margin: 0,
  },
  camera: {
    color: "#444",
    fontSize: "0.8rem",
    margin: 0,
    textAlign: "center",
  },
  divider: {
    width: "100%",
    height: "1px",
    backgroundColor: "#1e1e3f",
    margin: "8px 0",
  },
  label: {
    color: "#666",
    fontSize: "0.85rem",
    margin: 0,
    textAlign: "center",
  },
  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
  },
  input: {
    flex: 1,
    backgroundColor: "#0a0a1a",
    border: "1px solid #1e1e3f",
    borderRadius: "10px",
    color: "white",
    fontSize: "2rem",
    fontWeight: "bold",
    padding: "14px 16px",
    outline: "none",
    textAlign: "center",
  },
  unit: {
    color: "#444",
    fontSize: "1.2rem",
  },
  startBtn: {
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
  skipBtn: {
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