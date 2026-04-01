export default function ExerciseSelect({ onSelect, onViewSessions, onViewNotebook }) {
    const exercises = [
      {
        id: "squat",
        name: "Squat",
        icon: "🏋️",
        cameraNote: "Side view • Hip height",
        desc: "Tracks knee angle, back lean, depth",
      },
      {
        id: "pushup",
        name: "Push-up",
        icon: "💪",
        cameraNote: "Front view • Above you",
        desc: "Tracks elbow angle, hip sag",
      },

      {
        id: "bicepCurl",
        name: "Bicep Curl",
        icon: "💪",
        cameraNote: "Side view • Hip height",
        desc: "Tracks elbow angle, eccentric control",
      },
      {
        id: "deadlift",
        name: "Deadlift",
        icon: "🏋️",
        cameraNote: "Side view - Hip height",
        desc: "Tracks hip hinge, lockout, torso position",
      },
      {
        id: "overheadPress",
        name: "Overhead Press",
        icon: "🔼",
        cameraNote: "Side view - Hip height",
        desc: "Tracks lockout, elbow extension, torso control",
      },
    ];
  
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>AI Form Coach</h1>
          <p style={styles.sub}>Real-time feedback. Every rep.</p>
        </div>
    
        <div style={styles.grid}>
          {exercises.map((ex) => (
            <button key={ex.id} style={styles.card} onClick={() => onSelect(ex.id)}>
              <span style={styles.icon}>{ex.icon}</span>
              <p style={styles.exName}>{ex.name}</p>
              <p style={styles.exDesc}>{ex.desc}</p>
              <p style={styles.camera}>📷 {ex.cameraNote}</p>
              <div style={styles.startBtn}>Start →</div>
            </button>
          ))}
        </div>
    
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={onViewSessions} style={styles.sessionsBtn}>
            View Sessions →
          </button>
          <button onClick={onViewNotebook} style={styles.sessionsBtn}>
            📓 Notebook
          </button>
        </div>
    
      </div>
    );
}
  const styles = {
    page: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "#0a0a1a",
      gap: "48px",
      padding: "40px",
      fontFamily: "'Segoe UI', sans-serif",
    },
    header: { textAlign: "center" },
    title: {
      fontSize: "3rem",
      fontWeight: "900",
      color: "white",
      margin: 0,
      letterSpacing: "-1px",
    },
    sub: {
      color: "#444",
      fontSize: "1rem",
      margin: "8px 0 0 0",
      letterSpacing: "2px",
      textTransform: "uppercase",
    },
    grid: {
      display: "flex",
      gap: "24px",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    card: {
      backgroundColor: "#111127",
      border: "1px solid #222",
      borderRadius: "20px",
      padding: "40px 32px",
      width: "220px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "10px",
      cursor: "pointer",
      transition: "all 0.2s",
      textAlign: "center",
    },
    icon: { fontSize: "3rem" },
    exName: {
      color: "white",
      fontSize: "1.4rem",
      fontWeight: "bold",
      margin: 0,
    },
    exDesc: {
      color: "#555",
      fontSize: "0.8rem",
      margin: 0,
      lineHeight: 1.4,
    },
    camera: {
      color: "#333",
      fontSize: "0.75rem",
      margin: 0,
    },
    startBtn: {
      marginTop: "12px",
      backgroundColor: "#00ff88",
      color: "#0a0a1a",
      padding: "10px 24px",
      borderRadius: "50px",
      fontWeight: "bold",
      fontSize: "0.9rem",
    },
    sessionsBtn: {
        background: "none",
        border: "1px solid #1e1e3f",
        color: "#444",
        padding: "10px 24px",
        borderRadius: "10px",
        cursor: "pointer",
        fontSize: "0.85rem",
      },
  };
