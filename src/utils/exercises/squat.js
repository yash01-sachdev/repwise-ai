import { getAngle, getKP } from "../poseDetector";
import { speak, CUE } from "../audioCoach";

// These are the only keypoints we need for side-view squat
const REQUIRED = [
  "left_hip",
  "left_knee", 
  "left_ankle",
  "left_shoulder",
];

// Squat phases — what's happening right now
export const PHASE = {
  STANDING:  "STANDING",
  DESCENDING:"DESCENDING",
  BOTTOM:    "BOTTOM",
  ASCENDING: "ASCENDING",
};

// One flag per rep — so we only say each cue ONCE per rep
let formFlagsThisRep = {
  chestUp:   false,
  kneesOut:  false,
  tooDeep:   false,
};

export function resetRepFlags() {
  formFlagsThisRep = {
    chestUp:  false,
    wasAtBottom : false,
    kneesOut: false,
    tooDeep:  false,
  };
}

let wasAtBottom = false;

// ─── MAIN ANALYSIS FUNCTION ───────────────────────────
export function analyzeSquat(keypoints, currentPhase, repCount) {

  // Step 1 — can we see enough of the body?
  const hip      = getKP(keypoints, "left_hip");
  const knee     = getKP(keypoints, "left_knee");
  const ankle    = getKP(keypoints, "left_ankle");
  const shoulder = getKP(keypoints, "left_shoulder");

  if (!hip || !knee || !ankle || !shoulder) {
    return {
      canAnalyze: false,
      missing: getMissing(keypoints),
    };
  }

  // Step 2 — calculate angles
  const kneeAngle = getAngle(hip, knee, ankle);

  // Back angle — how far forward are they leaning?
  // We compare shoulder position relative to hip (vertical = 90°)
  const backAngle = getAngle(
    { x: shoulder.x, y: shoulder.y - 100 }, // point above shoulder
    shoulder,
    hip
  );

  // Step 3 — determine current phase from knee angle
  let phase;
  if (kneeAngle > 155)                        phase = PHASE.STANDING;
  else if (kneeAngle <= 155 && kneeAngle > 110) phase = PHASE.DESCENDING;
  else if (kneeAngle <= 110 && kneeAngle >= 65) phase = PHASE.BOTTOM;
  else                                          phase = PHASE.BOTTOM; // <65 = too deep, still bottom

  // Step 4 — form checks
  const isLeaningForward = backAngle > 80;
  const isTooDeep = kneeAngle < 45;

  // Knee tracking — is knee going past toes?
  // In side view: knee x should not go more than ankle x + some threshold
  const kneeOverToe = (knee.x - ankle.x) > 40; // pixels

  // Step 5 — audio cues (only fire once per rep per issue)
  fireAudioCues({
    phase,
    currentPhase,
    kneeAngle,
    isLeaningForward,
    isTooDeep,
    kneeOverToe,
    repCount,
  });

  // Step 6 — rep counting logic
  // A rep completes when: was at BOTTOM, now ASCENDING back to STANDING
  let newRep = false;
  if (kneeAngle < 110) {
    wasAtBottom = true;
  }
  if (wasAtBottom && kneeAngle > 145) {
    newRep = true;
    wasAtBottom = false;
    resetRepFlags();
  }

  // Step 7 — status for UI
  const { label, color } = getStatusDisplay(phase, kneeAngle, isLeaningForward, isTooDeep);

  return {
    canAnalyze:  true,
    phase,
    newRep,
    kneeAngle:   Math.round(kneeAngle),
    backAngle:   Math.round(backAngle),
    isLeaningForward,
    isTooDeep,
    kneeOverToe,
    label,
    color,
    angles: {
      "Knee Angle": Math.round(kneeAngle),
      "Back Angle": Math.round(backAngle),
    },
  };
}

// ─── AUDIO CUE LOGIC ─────────────────────────────────
function fireAudioCues({
  phase, currentPhase, kneeAngle,
  isLeaningForward, isTooDeep, kneeOverToe, repCount,
}) {
  // Danger first — always override
  if (isTooDeep && !formFlagsThisRep.tooDeep) {
    speak(CUE.tooDeep(), "high");
    formFlagsThisRep.tooDeep = true;
    return;
  }

  // Form fixes — only say once per rep
  if (isLeaningForward && !formFlagsThisRep.chestUp && phase !== PHASE.STANDING) {
    speak(CUE.chestUp());
    formFlagsThisRep.chestUp = true;
    return;
  }

  if (kneeOverToe && !formFlagsThisRep.kneesOut && phase !== PHASE.STANDING) {
    speak(CUE.heelsDown());
    formFlagsThisRep.kneesOut = true;
    return;
  }


  if (phase === PHASE.ASCENDING && currentPhase === PHASE.BOTTOM) {
    speak(CUE.driveUp());
    return;
  }
  
  if (phase === PHASE.DESCENDING && kneeAngle < 120 && !formFlagsThisRep.halfway) {
    speak(CUE.halfway());
    formFlagsThisRep.halfway = true;
    return;
  }

  // Positive cues — guide them down
  if (phase === PHASE.DESCENDING && currentPhase === PHASE.STANDING) {
    speak(CUE.keepGoing());
    return;
  }

  if (phase === PHASE.BOTTOM && currentPhase === PHASE.DESCENDING) {
    if (!isTooDeep) speak(CUE.goodDepth());
    return;
  }

  // Rep completed cue
  if (wasAtBottom && kneeAngle > 145) {
    const nextRep = repCount + 1;
    if (nextRep % 4 === 0) {
      speak(`good ${nextRep}`);
    } else {
      speak(`${nextRep}`);
    }
  }
}

// ─── UI STATUS ────────────────────────────────────────
function getStatusDisplay(phase, kneeAngle, isLeaningForward, isTooDeep) {
  if (isTooDeep)         return { label: "TOO DEEP ⚠️",     color: "#ff4444" };
  if (isLeaningForward)  return { label: "CHEST UP 🔺",      color: "#ffaa00" };

  switch (phase) {
    case PHASE.STANDING:   return { label: "STANDING — begin squat", color: "#00bfff" };
    case PHASE.DESCENDING: return { label: "DESCENDING ⬇",           color: "#ffaa00" };
    case PHASE.BOTTOM:     return { label: "GOOD DEPTH ✅",           color: "#00ff88" };
    case PHASE.ASCENDING:  return { label: "ASCENDING ⬆",            color: "#00bfff" };
    default:               return { label: "ANALYZING...",            color: "#888"    };
  }
}

// ─── MISSING KEYPOINTS MESSAGE ────────────────────────
function getMissing(keypoints) {
  const needed = {
    "left_hip":      "left hip",
    "left_knee":     "left knee",
    "left_ankle":    "left ankle",
    "left_shoulder": "left shoulder",
  };

  const missing = Object.entries(needed)
    .filter(([name]) => getKP(keypoints, name, 0.4) === null)
    .map(([, label]) => label);

  if (missing.length > 2) return "Move camera back — can't see enough of your body";
  return `Can't see: ${missing.join(", ")}`;
}