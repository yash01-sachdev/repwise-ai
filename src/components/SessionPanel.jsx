export default function SessionPanel({ reps, analysis, exercise, onEnd }) {
    return (
      <div style={styles.panel}>
  
        {/* Rep counter */}
        <div style={styles.repBox}>
          <p style={styles.repLabel}>REPS</p>
          <p style={styles.repCount}>{reps}</p>
          <p
            style={{
              ...styles.phase,
              color: analysis?.color || "#444",
            }}
          >
            {analysis?.label || "Waiting..."}
          </p>
        </div>
  
        {/* Angles */}
        {analysis?.canAnalyze && (
          <div style={styles.angleBox}>
            <p style={styles.sectionLabel}>JOINT ANGLES</p>
            {Object.entries(analysis.angles).map(([name, val]) => (
              <div key={name} style={styles.angleRow}>
                <span style={styles.angleName}>{name}</span>
                <span style={{ ...styles.angleVal, color: analysis.color }}>
                  {val}°
                </span>
              </div>
            ))}
          </div>
        )}
  
        {/* Form checks */}
        {analysis?.canAnalyze && (
          <div style={styles.formBox}>
            <p style={styles.sectionLabel}>FORM CHECK</p>
            {exercise === "squat" && (
              <>
                <FormRow label="Back" good={!analysis.isLeaningForward} badText="Lean forward" />
                <FormRow label="Depth" good={!analysis.isTooDeep} badText="Too deep" />
                <FormRow label="Knees" good={!analysis.kneeOverToe} badText="Watch knees" />
              </>
            )}
            {exercise === "pushup" && (
              <>
                <FormRow label="Hips" good={!analysis.isHipSag} badText="Hips sagging" />
                <FormRow label="Depth" good={analysis.elbowAngle < 100} badText="Go lower" goodText="Good depth" />
              </>
            )}
            {exercise === "bicepCurl" && (
              <>
                <FormRow label="Elbow" good={!analysis.isElbowSwinging} badText="Elbow swinging" goodText="Still" />
                <FormRow label="Range" good={analysis.elbowAngle < 75 || analysis.phase !== "TOP"} badText="Curl higher" goodText="Good top" />
              </>
            )}
            {exercise === "deadlift" && (
              <>
                <FormRow label="Chest" good={!analysis.isChestDropped} badText="Chest dropped" />
                <FormRow label="Hinge" good={!analysis.isSquattingThePull} badText="Too much squat" goodText="Good hinge" />
              </>
            )}
            {exercise === "overheadPress" && (
              <>
                <FormRow label="Torso" good={!analysis.isLeaningBack} badText="Leaning back" goodText="Braced" />
                <FormRow label="Lockout" good={!analysis.isOutOfStack} badText="Not stacked" goodText="Stacked" />
              </>
            )}
          </div>
        )}
  
        {/* Can't see body */}
        {analysis && !analysis.canAnalyze && (
          <div style={styles.warning}>
            <p style={styles.warnTitle}>📷 Adjust Camera</p>
            <p style={styles.warnMsg}>{analysis.missing}</p>
          </div>
        )}
  
        {/* End set */}
        <button onClick={onEnd} style={styles.endBtn}>
          End Set
        </button>
      </div>
    );
  }
  
  function FormRow({ label, good, badText, goodText = "Good" }) {
    return (
      <div style={styles.formRow}>
        <span style={styles.formLabel}>{label}</span>
        <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: good ? "#00ff88" : "#ff4444" }}>
          {good ? `✅ ${goodText}` : `❌ ${badText}`}
        </span>
      </div>
    );
  }
  
  const styles = {
    panel: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      width: "260px",
      fontFamily: "'Segoe UI', sans-serif",
    },
    repBox: {
      backgroundColor: "#111127",
      border: "1px solid #1e1e3f",
      borderRadius: "16px",
      padding: "24px",
      textAlign: "center",
    },
    repLabel: {
      color: "#333",
      fontSize: "0.7rem",
      letterSpacing: "4px",
      margin: 0,
    },
    repCount: {
      color: "white",
      fontSize: "5rem",
      fontWeight: "900",
      margin: "4px 0",
      lineHeight: 1,
    },
    phase: {
      fontSize: "0.85rem",
      fontWeight: "bold",
      margin: 0,
    },
    angleBox: {
      backgroundColor: "#111127",
      border: "1px solid #1e1e3f",
      borderRadius: "16px",
      padding: "16px",
    },
    sectionLabel: {
      color: "#333",
      fontSize: "0.65rem",
      letterSpacing: "3px",
      margin: "0 0 12px 0",
    },
    angleRow: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px",
    },
    angleName: { color: "#555", fontSize: "0.85rem" },
    angleVal: { fontWeight: "bold", fontFamily: "monospace", fontSize: "1rem" },
    formBox: {
      backgroundColor: "#111127",
      border: "1px solid #1e1e3f",
      borderRadius: "16px",
      padding: "16px",
    },
    formRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "10px",
    },
    formLabel: { color: "#555", fontSize: "0.85rem" },
    warning: {
      backgroundColor: "#1a0a0a",
      border: "1px solid #ff444433",
      borderRadius: "16px",
      padding: "20px",
      textAlign: "center",
    },
    warnTitle: { color: "#ff4444", fontWeight: "bold", margin: "0 0 8px 0" },
    warnMsg: { color: "#666", fontSize: "0.8rem", margin: 0 },
    endBtn: {
      width: "100%",
      padding: "14px",
      borderRadius: "12px",
      border: "1px solid #222",
      backgroundColor: "#111127",
      color: "#666",
      fontSize: "0.9rem",
      cursor: "pointer",
      letterSpacing: "1px",
    },
  };
