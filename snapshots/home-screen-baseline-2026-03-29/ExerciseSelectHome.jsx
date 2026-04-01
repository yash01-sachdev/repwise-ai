export default function ExerciseSelectHome({ onSelect, onViewSessions, onViewNotebook }) {
  const exercises = [
    {
      id: "squat",
      name: "Squat",
      icon: "🏋️",
      cameraNote: "Side view - hip height",
      desc: "Tracks knee angle, back lean, and depth",
    },
    {
      id: "pushup",
      name: "Push-up",
      icon: "💪",
      cameraNote: "Front view - above you",
      desc: "Tracks elbow angle and hip position",
    },
    {
      id: "bicepCurl",
      name: "Bicep Curl",
      icon: "💪",
      cameraNote: "Side view - hip height",
      desc: "Tracks elbow angle and curl control",
    },
    {
      id: "deadlift",
      name: "Deadlift",
      icon: "🏋️",
      cameraNote: "Side view - hip height",
      desc: "Tracks hinge, lockout, and torso position",
    },
    {
      id: "overheadPress",
      name: "Overhead Press",
      icon: "🔼",
      cameraNote: "Side view - hip height",
      desc: "Tracks lockout, elbow extension, and torso control",
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.topBar}>
          <div style={styles.brandBlock}>
            <div style={styles.brandRow}>
              <span style={styles.brandIcon}>⚡</span>
              <span style={styles.brandName}>AI Form Coach</span>
            </div>
            <h1 style={styles.title}>Train With Live Coaching</h1>
            <p style={styles.sub}>
              Pick a lift, set your weight, and get clean rep tracking with simple form feedback.
            </p>
          </div>

          <div style={styles.quickActions}>
            <button onClick={onViewSessions} style={styles.ghostBtn}>
              View Sessions
            </button>
            <button onClick={onViewNotebook} style={styles.secondaryBtn}>
              Notebook
            </button>
          </div>
        </div>

        <div style={styles.hero}>
          <div style={styles.heroCard}>
            <p style={styles.heroLabel}>Starter Friendly</p>
            <p style={styles.heroTitle}>Simple flow, sharper look.</p>
            <p style={styles.heroText}>
              Everything stays easy to read in one component, but the landing page feels much more intentional now.
            </p>

            <div style={styles.heroStats}>
              <div style={styles.statPill}>Real-time cues</div>
              <div style={styles.statPill}>Session replay</div>
              <div style={styles.statPill}>AI notebook</div>
            </div>
          </div>

          <div style={styles.heroSide}>
            <p style={styles.heroSideLabel}>Quick Start</p>
            <div style={styles.stepRow}>
              <span style={styles.stepNum}>1</span>
              <span style={styles.stepText}>Choose an exercise below</span>
            </div>
            <div style={styles.stepRow}>
              <span style={styles.stepNum}>2</span>
              <span style={styles.stepText}>Set your weight or go bodyweight</span>
            </div>
            <div style={styles.stepRow}>
              <span style={styles.stepNum}>3</span>
              <span style={styles.stepText}>Start training with live feedback</span>
            </div>
          </div>
        </div>

        <div style={styles.sectionHead}>
          <p style={styles.sectionLabel}>Choose Exercise</p>
          <p style={styles.sectionText}>Built to stay simple, but look like a real product.</p>
        </div>

        <div style={styles.grid}>
          {exercises.map((ex) => (
            <button key={ex.id} style={styles.card} onClick={() => onSelect(ex.id)}>
              <div style={styles.cardGlow} />
              <span style={styles.icon}>{ex.icon}</span>
              <p style={styles.exName}>{ex.name}</p>
              <p style={styles.exDesc}>{ex.desc}</p>
              <p style={styles.camera}>📷 {ex.cameraNote}</p>
              <div style={styles.startBtn}>Start</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(0,255,136,0.10), transparent 28%), linear-gradient(180deg, #090916 0%, #070712 100%)",
    padding: "32px 20px 48px",
    fontFamily: "'Segoe UI', sans-serif",
    boxSizing: "border-box",
  },
  shell: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    flexWrap: "wrap",
  },
  brandBlock: {
    maxWidth: "700px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  brandIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1d2448, #0d1233)",
    fontSize: "1rem",
  },
  brandName: {
    color: "#8a90b8",
    fontSize: "0.95rem",
    fontWeight: "600",
    letterSpacing: "0.3px",
  },
  title: {
    color: "white",
    fontSize: "clamp(2.6rem, 6vw, 4.6rem)",
    lineHeight: 1,
    fontWeight: "900",
    margin: 0,
    letterSpacing: "-2px",
    maxWidth: "700px",
  },
  sub: {
    color: "#95a0c5",
    fontSize: "1rem",
    lineHeight: 1.7,
    margin: 0,
    maxWidth: "620px",
  },
  quickActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  ghostBtn: {
    backgroundColor: "rgba(13, 17, 38, 0.72)",
    color: "#d4dbff",
    border: "1px solid #232a4f",
    padding: "12px 18px",
    borderRadius: "14px",
    cursor: "pointer",
    fontSize: "0.92rem",
    fontWeight: "600",
  },
  secondaryBtn: {
    backgroundColor: "#00ff88",
    color: "#081118",
    border: "none",
    padding: "12px 18px",
    borderRadius: "14px",
    cursor: "pointer",
    fontSize: "0.92rem",
    fontWeight: "700",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
    gap: "18px",
  },
  heroCard: {
    background: "linear-gradient(160deg, rgba(18,22,48,0.96), rgba(12,13,32,0.94))",
    border: "1px solid #20264a",
    borderRadius: "28px",
    padding: "28px",
    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.28)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  heroLabel: {
    margin: 0,
    color: "#00ff88",
    fontSize: "0.8rem",
    fontWeight: "700",
    letterSpacing: "2px",
    textTransform: "uppercase",
  },
  heroTitle: {
    margin: 0,
    color: "white",
    fontSize: "1.8rem",
    fontWeight: "800",
  },
  heroText: {
    margin: 0,
    color: "#95a0c5",
    fontSize: "0.98rem",
    lineHeight: 1.8,
    maxWidth: "560px",
  },
  heroStats: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "6px",
  },
  statPill: {
    border: "1px solid #27305b",
    color: "#d4dbff",
    padding: "10px 14px",
    borderRadius: "999px",
    fontSize: "0.82rem",
    backgroundColor: "rgba(10, 12, 30, 0.58)",
  },
  heroSide: {
    backgroundColor: "rgba(14, 16, 37, 0.96)",
    border: "1px solid #20264a",
    borderRadius: "24px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  heroSideLabel: {
    margin: 0,
    color: "white",
    fontSize: "1rem",
    fontWeight: "700",
  },
  stepRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  stepNum: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#00ff88",
    color: "#081118",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8rem",
    fontWeight: "800",
    flexShrink: 0,
  },
  stepText: {
    color: "#a5afd4",
    fontSize: "0.9rem",
    lineHeight: 1.5,
  },
  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  sectionLabel: {
    margin: 0,
    color: "white",
    fontSize: "1.2rem",
    fontWeight: "700",
  },
  sectionText: {
    margin: 0,
    color: "#657095",
    fontSize: "0.9rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },
  card: {
    position: "relative",
    backgroundColor: "rgba(16, 18, 40, 0.98)",
    border: "1px solid #21274d",
    borderRadius: "24px",
    padding: "26px 22px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "12px",
    cursor: "pointer",
    textAlign: "left",
    minHeight: "250px",
    overflow: "hidden",
  },
  cardGlow: {
    position: "absolute",
    top: "-30px",
    right: "-20px",
    width: "110px",
    height: "110px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,255,136,0.18), transparent 70%)",
    pointerEvents: "none",
  },
  icon: {
    fontSize: "2rem",
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, rgba(68,111,255,0.35), rgba(0,255,136,0.12))",
  },
  exName: {
    color: "white",
    fontSize: "1.35rem",
    fontWeight: "800",
    margin: 0,
    lineHeight: 1.15,
  },
  exDesc: {
    color: "#8792b8",
    fontSize: "0.92rem",
    margin: 0,
    lineHeight: 1.65,
    flex: 1,
  },
  camera: {
    color: "#687396",
    fontSize: "0.82rem",
    margin: 0,
  },
  startBtn: {
    marginTop: "6px",
    backgroundColor: "#00ff88",
    color: "#071018",
    padding: "11px 20px",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "0.92rem",
  },
};
