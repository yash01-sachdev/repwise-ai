export default function ExerciseSelectPremium({ onSelect, onViewSessions, onViewNotebook }) {
  const exercises = [
    {
      id: "squat",
      name: "Squat",
      icon: "SQ",
      cameraNote: "Side view - hip height",
      desc: "Tracks knee angle, back lean, and depth",
    },
    {
      id: "pushup",
      name: "Push-up",
      icon: "PU",
      cameraNote: "Front view - above you",
      desc: "Tracks elbow angle and hip position",
    },
    {
      id: "bicepCurl",
      name: "Bicep Curl",
      icon: "BC",
      cameraNote: "Side view - hip height",
      desc: "Tracks elbow angle and curl control",
    },
    {
      id: "deadlift",
      name: "Deadlift",
      icon: "DL",
      cameraNote: "Side view - hip height",
      desc: "Tracks hinge, lockout, and torso position",
    },
    {
      id: "overheadPress",
      name: "Overhead Press",
      icon: "OP",
      cameraNote: "Side view - hip height",
      desc: "Tracks lockout, elbow extension, and torso control",
    },
  ];

  return (
    <div className="premium-home" style={styles.page}>
      <div className="premium-orb premium-orb-a" />
      <div className="premium-orb premium-orb-b" />
      <div className="premium-orb premium-orb-c" />

      <div style={styles.shell}>
        <div className="premium-fade-up" style={styles.topBar}>
          <div style={styles.brandBlock}>
            <div style={styles.brandRow}>
              <span style={styles.brandIcon}>AI</span>
              <span style={styles.brandName}>AI Form Coach</span>
            </div>
            <h1 style={styles.title}>Train With Live Coaching</h1>
            <p style={styles.sub}>
              Pick a lift, set your weight, and get clean rep tracking with simple form feedback.
            </p>
          </div>

          <div style={styles.statusPill}>Premium home preview</div>
        </div>

        <div className="premium-hero-grid" style={styles.hero}>
          <div className="premium-fade-up premium-delay-1" style={styles.heroCard}>
            <p style={styles.heroLabel}>Live Form Lab</p>
            <p style={styles.heroTitle}>Simple logic. Bigger product feel.</p>
            <p style={styles.heroText}>
              This version adds more depth, contrast, and motion while still staying readable as plain React plus style objects.
            </p>

            <div style={styles.heroStats}>
              <div style={styles.statPill}>5 tracked lifts</div>
              <div style={styles.statPill}>Voice cues</div>
              <div style={styles.statPill}>Notebook + sessions</div>
            </div>

            <div style={styles.metricsRow}>
              <div style={styles.metricCard}>
                <p style={styles.metricNumber}>05</p>
                <p style={styles.metricLabel}>Exercises ready</p>
              </div>
              <div style={styles.metricCard}>
                <p style={styles.metricNumber}>AI</p>
                <p style={styles.metricLabel}>Notebook coaching</p>
              </div>
              <div style={styles.metricCard}>
                <p style={styles.metricNumber}>HD</p>
                <p style={styles.metricLabel}>Session replay</p>
              </div>
            </div>
          </div>

          <div className="premium-fade-up premium-delay-2" style={styles.heroSide}>
            <p style={styles.heroSideLabel}>Workspace</p>
            <p style={styles.heroSideText}>
              Your saved sessions and notebook now sit near the top where they feel intentional instead of tucked away below the cards.
            </p>

            <button onClick={onViewSessions} className="premium-action" style={styles.workspaceBtn}>
              <span style={styles.workspaceIcon}>SS</span>
              <span style={styles.workspaceCopy}>
                <span style={styles.workspaceTitle}>View Sessions</span>
                <span style={styles.workspaceSub}>Replays, PRs, and saved sets</span>
              </span>
            </button>

            <button onClick={onViewNotebook} className="premium-action" style={styles.workspaceBtnAlt}>
              <span style={styles.workspaceIcon}>NB</span>
              <span style={styles.workspaceCopy}>
                <span style={styles.workspaceTitle}>Open Notebook</span>
                <span style={styles.workspaceSub}>Log workouts and get AI coaching</span>
              </span>
            </button>

            <div style={styles.stepList}>
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
        </div>

        <div className="premium-fade-up premium-delay-3" style={styles.sectionHead}>
          <p style={styles.sectionLabel}>Choose Exercise</p>
          <p style={styles.sectionText}>Same app logic underneath. Stronger first impression on top.</p>
        </div>

        <div style={styles.grid}>
          {exercises.map((ex, index) => (
            <button
              key={ex.id}
              className="premium-card"
              style={{ ...styles.card, animationDelay: `${240 + index * 70}ms` }}
              onClick={() => onSelect(ex.id)}
            >
              <div style={styles.cardGlow} />
              <span style={styles.icon}>{ex.icon}</span>
              <span style={styles.cardTag}>Ready</span>
              <p style={styles.exName}>{ex.name}</p>
              <p style={styles.exDesc}>{ex.desc}</p>
              <p style={styles.camera}>CAMERA: {ex.cameraNote}</p>
              <div style={styles.startBtn}>Start -&gt;</div>
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
    position: "relative",
    overflow: "hidden",
  },
  shell: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
    position: "relative",
    zIndex: 1,
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    flexWrap: "wrap",
  },
  brandBlock: {
    maxWidth: "720px",
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
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #202a5a, #121833)",
    color: "#7ef0c9",
    fontSize: "0.8rem",
    fontWeight: "800",
    letterSpacing: "1px",
  },
  brandName: {
    color: "#8a90b8",
    fontSize: "0.95rem",
    fontWeight: "600",
    letterSpacing: "0.3px",
  },
  title: {
    color: "white",
    fontSize: "clamp(2.7rem, 6vw, 4.8rem)",
    lineHeight: 0.98,
    fontWeight: "900",
    margin: 0,
    letterSpacing: "-2px",
    maxWidth: "760px",
  },
  sub: {
    color: "#95a0c5",
    fontSize: "1rem",
    lineHeight: 1.7,
    margin: 0,
    maxWidth: "640px",
  },
  statusPill: {
    border: "1px solid #26305d",
    color: "#d6ddff",
    padding: "10px 14px",
    borderRadius: "999px",
    backgroundColor: "rgba(11, 16, 37, 0.75)",
    fontSize: "0.82rem",
    fontWeight: "700",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 2fr) minmax(310px, 1fr)",
    gap: "18px",
  },
  heroCard: {
    background: "linear-gradient(160deg, rgba(18,22,48,0.96), rgba(12,13,32,0.94))",
    border: "1px solid #20264a",
    borderRadius: "28px",
    padding: "30px",
    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.28)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  heroLabel: {
    margin: 0,
    color: "#78f3c5",
    fontSize: "0.8rem",
    fontWeight: "700",
    letterSpacing: "2px",
    textTransform: "uppercase",
  },
  heroTitle: {
    margin: 0,
    color: "white",
    fontSize: "1.95rem",
    fontWeight: "800",
    lineHeight: 1.1,
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
  metricsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    marginTop: "10px",
  },
  metricCard: {
    backgroundColor: "rgba(10, 14, 32, 0.72)",
    border: "1px solid #243057",
    borderRadius: "18px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  metricNumber: {
    margin: 0,
    color: "white",
    fontSize: "1.5rem",
    fontWeight: "900",
    letterSpacing: "-1px",
  },
  metricLabel: {
    margin: 0,
    color: "#8090bb",
    fontSize: "0.8rem",
    lineHeight: 1.5,
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
  heroSideText: {
    margin: 0,
    color: "#99a3c8",
    fontSize: "0.9rem",
    lineHeight: 1.65,
  },
  workspaceBtn: {
    background: "linear-gradient(135deg, #00ff88, #6cf6c5)",
    color: "#081118",
    border: "none",
    borderRadius: "20px",
    padding: "16px",
    display: "flex",
    gap: "14px",
    alignItems: "center",
    cursor: "pointer",
    textAlign: "left",
  },
  workspaceBtnAlt: {
    backgroundColor: "rgba(18, 21, 46, 0.92)",
    color: "white",
    border: "1px solid #27305b",
    borderRadius: "20px",
    padding: "16px",
    display: "flex",
    gap: "14px",
    alignItems: "center",
    cursor: "pointer",
    textAlign: "left",
  },
  workspaceIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    backgroundColor: "rgba(8, 17, 24, 0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.78rem",
    fontWeight: "800",
    letterSpacing: "1px",
    flexShrink: 0,
  },
  workspaceCopy: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  workspaceTitle: {
    fontSize: "0.98rem",
    fontWeight: "800",
  },
  workspaceSub: {
    fontSize: "0.78rem",
    lineHeight: 1.5,
    color: "inherit",
    opacity: 0.82,
  },
  stepList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "6px",
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
    fontSize: "1rem",
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, rgba(68,111,255,0.35), rgba(0,255,136,0.12))",
    color: "white",
    fontWeight: "800",
    letterSpacing: "1px",
  },
  cardTag: {
    border: "1px solid #27305b",
    color: "#9db0df",
    borderRadius: "999px",
    padding: "5px 10px",
    fontSize: "0.72rem",
    fontWeight: "700",
    backgroundColor: "rgba(10, 12, 30, 0.55)",
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
    fontSize: "0.78rem",
    margin: 0,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
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
