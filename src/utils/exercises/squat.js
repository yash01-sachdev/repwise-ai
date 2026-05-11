import { getAngle } from "../poseDetector";
import { speak, CUE } from "../audioCoach";
import { getBestSide, getDistance, getTorsoLean, nextStableCount, smoothValue } from "./analysisHelpers";

export const PHASE = {
  STANDING: "STANDING",
  DESCENDING: "DESCENDING",
  BOTTOM: "BOTTOM",
  ASCENDING: "ASCENDING",
};

let formFlagsThisRep = {
  chestUp: false,
  kneesBack: false,
  tooDeep: false,
  halfway: false,
};

let squatState = createFreshState();

function createFreshState() {
  return {
    smoothedKneeAngle: null,
    smoothedTorsoLean: null,
    previousKneeAngle: null,
    bottomFrames: 0,
    lockoutFrames: 0,
    wasAtBottom: false,
  };
}

export function resetRepFlags() {
  formFlagsThisRep = {
    chestUp: false,
    kneesBack: false,
    tooDeep: false,
    halfway: false,
  };

  squatState = createFreshState();
}

export function analyzeSquat(keypoints, currentPhase, repCount) {
  const bestSide = getBestSide(keypoints, ["shoulder", "hip", "knee", "ankle"]);
  const { shoulder, hip, knee, ankle } = bestSide.joints;

  if (!shoulder || !hip || !knee || !ankle) {
    return {
      canAnalyze: false,
      missing: "Side view needed - keep shoulder, hip, knee, and ankle visible",
    };
  }

  const rawKneeAngle = getAngle(hip, knee, ankle);
  const rawTorsoLean = getTorsoLean(shoulder, hip);

  squatState.smoothedKneeAngle = smoothValue(squatState.smoothedKneeAngle, rawKneeAngle, 0.4);
  squatState.smoothedTorsoLean = smoothValue(squatState.smoothedTorsoLean, rawTorsoLean, 0.35);

  const kneeAngle = squatState.smoothedKneeAngle;
  const torsoLean = squatState.smoothedTorsoLean;
  const kneeTrend =
    squatState.previousKneeAngle === null ? 0 : kneeAngle - squatState.previousKneeAngle;

  squatState.previousKneeAngle = kneeAngle;

  squatState.bottomFrames = nextStableCount(squatState.bottomFrames, kneeAngle < 108);
  squatState.lockoutFrames = nextStableCount(
    squatState.lockoutFrames,
    kneeAngle > 158 && torsoLean < 28,
  );

  if (squatState.bottomFrames >= 2) {
    squatState.wasAtBottom = true;
  }

  let phase = currentPhase || PHASE.STANDING;

  if (squatState.lockoutFrames >= 2 && !squatState.wasAtBottom) {
    phase = PHASE.STANDING;
  } else if (squatState.bottomFrames >= 2) {
    phase = PHASE.BOTTOM;
  } else if (kneeTrend < -1.5) {
    phase = PHASE.DESCENDING;
  } else if (kneeTrend > 1.5) {
    phase = PHASE.ASCENDING;
  }

  const shinLength = Math.max(getDistance(knee, ankle), 1);
  const kneeTravelRatio = Math.abs(knee.x - ankle.x) / shinLength;

  const isLeaningForward = torsoLean > 36;
  const isTooDeep = kneeAngle < 52;
  const kneeOverToe = kneeTravelRatio > 0.5;

  let newRep = false;
  if (squatState.wasAtBottom && squatState.lockoutFrames >= 2) {
    newRep = true;
    squatState.wasAtBottom = false;
    squatState.bottomFrames = 0;
  }

  fireAudioCues({
    phase,
    currentPhase,
    kneeAngle,
    isLeaningForward,
    isTooDeep,
    kneeOverToe,
    newRep,
    repCount,
  });

  if (newRep) {
    resetRepFlags();
  }

  const { label, color } = getStatusDisplay(phase, isLeaningForward, isTooDeep, kneeOverToe);

  return {
    canAnalyze: true,
    phase,
    newRep,
    kneeAngle: Math.round(kneeAngle),
    backAngle: Math.round(torsoLean),
    isLeaningForward,
    isTooDeep,
    kneeOverToe,
    label,
    color,
    angles: {
      "Knee Angle": Math.round(kneeAngle),
      "Torso Lean": Math.round(torsoLean),
    },
  };
}

function fireAudioCues({
  phase,
  currentPhase,
  kneeAngle,
  isLeaningForward,
  isTooDeep,
  kneeOverToe,
  newRep,
  repCount,
}) {
  if (isTooDeep && !formFlagsThisRep.tooDeep) {
    speak(CUE.tooDeep(), "high");
    formFlagsThisRep.tooDeep = true;
    return;
  }

  if (isLeaningForward && !formFlagsThisRep.chestUp && phase !== PHASE.STANDING) {
    speak(CUE.chestUp());
    formFlagsThisRep.chestUp = true;
    return;
  }

  if (kneeOverToe && !formFlagsThisRep.kneesBack && phase !== PHASE.STANDING) {
    speak("sit back");
    formFlagsThisRep.kneesBack = true;
    return;
  }

  if (phase === PHASE.DESCENDING && kneeAngle < 120 && !formFlagsThisRep.halfway) {
    speak(CUE.halfway());
    formFlagsThisRep.halfway = true;
    return;
  }

  if (phase === PHASE.ASCENDING && currentPhase === PHASE.BOTTOM) {
    speak("drive up");
    return;
  }

  if (phase === PHASE.DESCENDING && currentPhase === PHASE.STANDING) {
    speak(CUE.keepGoing());
    return;
  }

  if (phase === PHASE.BOTTOM && currentPhase === PHASE.DESCENDING && !isTooDeep) {
    speak(CUE.goodDepth());
    return;
  }

  if (newRep) {
    const nextRep = repCount + 1;
    speak(nextRep % 4 === 0 ? `good ${nextRep}` : `${nextRep}`);
  }
}

function getStatusDisplay(phase, isLeaningForward, isTooDeep, kneeOverToe) {
  if (isTooDeep) return { label: "TOO DEEP ⚠️", color: "#ff4444" };
  if (isLeaningForward) return { label: "CHEST UP 🔺", color: "#ffaa00" };
  if (kneeOverToe) return { label: "SIT BACK ↩", color: "#ffaa00" };

  switch (phase) {
    case PHASE.STANDING:
      return { label: "STANDING — begin squat", color: "#00bfff" };
    case PHASE.DESCENDING:
      return { label: "DESCENDING ⬇", color: "#ffaa00" };
    case PHASE.BOTTOM:
      return { label: "GOOD DEPTH ✅", color: "#00ff88" };
    case PHASE.ASCENDING:
      return { label: "ASCENDING ⬆", color: "#00bfff" };
    default:
      return { label: "ANALYZING...", color: "#888" };
  }
}
