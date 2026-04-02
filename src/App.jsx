import { useState, useRef } from "react";
import ExerciseSelect from "./components/ExerciseSelectHome";
import WeightEntry from "./components/WeightEntry";
import WebcamFeed from "./components/WebcamFeedLive";
import SessionPanel from "./components/SessionPanel";
import SessionSummary from "./components/SessionSummary";
import SessionsPage from "./components/SessionsPage";
import { EXERCISES } from "./utils/exercises/index";

import { speak, resetAudio, CUE } from "./utils/audioCoach";
import { PHASE, resetRepFlags } from "./utils/exercises/squat";
import { resetPushupFlags } from "./utils/exercises/pushup";

import { useMediaRecorder } from "./utils/useMediaRecorder";
import { saveSessionWithVideo } from "./utils/sessionStorage";
import { resetCurlFlags } from "./utils/exercises/bicepCurl";
import { resetDeadliftFlags } from "./utils/exercises/deadlift";
import { resetOverheadPressFlags } from "./utils/exercises/overheadPress";


import NotebookPage from "./components/NotebookPage";

export default function App() {
  const [screen, setScreen]       = useState("select");
  const [exerciseId, setExerciseId] = useState(null);
  const [weight, setWeight]       = useState(0);
  const [reps, setReps]           = useState(0);
  const [analysis, setAnalysis]   = useState(null);
  const [formScore, setFormScore] = useState("good");

  const repsRef      = useRef(0);
  const phaseRef     = useRef(PHASE.STANDING);

  const formIssueRef = useRef(false);

  const videoBlobRef = useRef(null);
const setVideoBlobRef = (blob) => { videoBlobRef.current = blob; };

  const { startRecording, stopRecording } = useMediaRecorder();
  // ─── Screen: select exercise ───
  const handleSelectExercise = (id) => {
    setExerciseId(id);
    setScreen("weight");
  };

  // ─── Screen: weight entry ───
  const handleWeightEntry = (kg) => {
    setWeight(kg);
    setReps(0);
    setAnalysis(null);
    setFormScore("good");
    repsRef.current      = 0;
    phaseRef.current     = PHASE.STANDING;
    formIssueRef.current = false;
    resetRepFlags();
    resetPushupFlags();
    resetCurlFlags();
    resetDeadliftFlags();
    resetOverheadPressFlags();
    resetAudio();
    setScreen("workout");
    setTimeout(() => speak(CUE.start()), 800);
  };

  const handleStreamReady = (stream) => {
    startRecording(stream);
  };

  // ─── Screen: workout — pose handler ───
  const handlePose = (keypoints) => {
    const exercise = EXERCISES[exerciseId];
    if (!exercise) return;

    const result = exercise.analyze(keypoints, phaseRef.current, repsRef.current);
    if (!result) return;

    setAnalysis(result);
    if (!result.canAnalyze) return;

    phaseRef.current = result.phase;

    // Track if any form issue happened this session
    if (
      result.isLeaningForward ||
      result.isTooDeep ||
      result.kneeOverToe ||
      result.isHipSag ||
      result.hasFormIssue
    ) {
      formIssueRef.current = true;
    }

    if (result.newRep) {
      repsRef.current += 1;
      setReps(repsRef.current);
    }
  };

  // ─── Screen: end set ───
  const handleEndSet = async () => {
    const score = formIssueRef.current ? "watch" : "good";
    setFormScore(score);
    resetAudio();
    const blob = await stopRecording();
    setVideoBlobRef(blob);
    setScreen("summary");
  };


  // ─── Screen: summary — save ───
  const handleSave = async () => {
    await saveSessionWithVideo({
      exerciseId,
      weight,
      reps: repsRef.current,
      formScore,
    }, videoBlobRef.current);
    setScreen("sessions");
  };

  // ─── Screen: summary — discard ───
  const handleDiscard = () => {
    setScreen("select");
  };

  // ─── Screen: back to select from sessions ───
  const handleBackFromSessions = () => {
    setScreen("select");
  };

  // ─── Render ───
  if (screen === "select") {
    return (
      <ExerciseSelect
        onSelect={handleSelectExercise}
        onViewSessions={() => setScreen("sessions")}
        onViewNotebook={() => setScreen("notebook")}
      />
    );
  }

  if (screen === "weight") {
    return (
      <WeightEntry
        exerciseId={exerciseId}
        onStart={handleWeightEntry}
      />
    );
  }

  if (screen === "workout") {
    return (
      <div style={styles.page}>
        <div style={styles.topBar}>
          <button onClick={() => setScreen("select")} style={styles.backBtn}>
            ← Back
          </button>
          <p style={styles.exTitle}>
            {EXERCISES[exerciseId]?.name}
            {weight > 0 && <span style={styles.weightTag}> · {weight} kg</span>}
          </p>
          <div style={{ width: "60px" }} />
        </div>

        <div style={styles.mainRow}>
        <WebcamFeed
           onPoseDetected={handlePose}
           onStreamReady={handleStreamReady}
/>
          <SessionPanel
            reps={reps}
            analysis={analysis}
            exercise={exerciseId}
            onEnd={handleEndSet}
          />
        </div>
      </div>
    );
  }

  if (screen === "summary") {
    return (
      <SessionSummary
        exerciseId={exerciseId}
        weight={weight}
        reps={reps}
        formScore={formScore}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    );
  }

  if (screen === "sessions") {
    return (
      <SessionsPage
        onBack={handleBackFromSessions}
      />
      
    );
  }

if (screen === "notebook") {
  return <NotebookPage onBack={() => setScreen("select")} />;
}
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
    maxWidth: "960px",
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
  exTitle: {
    color: "white",
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: "600",
  },
  weightTag: {
    color: "#555",
    fontWeight: "400",
    fontSize: "0.95rem",
  },
  mainRow: {
    display: "flex",
    gap: "24px",
    alignItems: "flex-start",
    flexWrap: "wrap",
    justifyContent: "center",
  },
};
