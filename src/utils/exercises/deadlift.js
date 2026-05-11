import { getAngle } from "../poseDetector";
import { speak, CUE } from "../audioCoach";
import { getBestSide, getTorsoLean, nextStableCount, smoothValue } from "./analysisHelpers";

let deadliftState = createFreshState();
let formFlagsThisRep = {
  chestUp: false,
  hipsBack: false,
};

function createFreshState() {
  return {
    smoothedHipAngle: null,
    smoothedKneeAngle: null,
    smoothedTorsoLean: null,
    previousHipAngle: null,
    bottomFrames: 0,
    lockoutFrames: 0,
    wasAtBottom: false,
  };
}

export function resetDeadliftFlags() {
  deadliftState = createFreshState();
  formFlagsThisRep = {
    chestUp: false,
    hipsBack: false,
  };
}

export function analyzeDeadlift(keypoints, currentPhase, repCount) {
  const bestSide = getBestSide(keypoints, ["shoulder", "hip", "knee", "ankle"]);
  const { shoulder, hip, knee, ankle } = bestSide.joints;

  if (!shoulder || !hip || !knee || !ankle) {
    return {
      canAnalyze: false,
      missing: "Side view needed - keep shoulder, hip, knee, and ankle visible",
    };
  }

  const rawHipAngle = getAngle(shoulder, hip, knee);
  const rawKneeAngle = getAngle(hip, knee, ankle);
  const rawTorsoLean = getTorsoLean(shoulder, hip);

  deadliftState.smoothedHipAngle = smoothValue(deadliftState.smoothedHipAngle, rawHipAngle, 0.35);
  deadliftState.smoothedKneeAngle = smoothValue(deadliftState.smoothedKneeAngle, rawKneeAngle, 0.35);
  deadliftState.smoothedTorsoLean = smoothValue(deadliftState.smoothedTorsoLean, rawTorsoLean, 0.35);

  const hipAngle = deadliftState.smoothedHipAngle;
  const kneeAngle = deadliftState.smoothedKneeAngle;
  const torsoLean = deadliftState.smoothedTorsoLean;
  const hipTrend =
    deadliftState.previousHipAngle === null ? 0 : hipAngle - deadliftState.previousHipAngle;

  deadliftState.previousHipAngle = hipAngle;
  deadliftState.bottomFrames = nextStableCount(
    deadliftState.bottomFrames,
    hipAngle < 118 && torsoLean > 35,
  );
  deadliftState.lockoutFrames = nextStableCount(
    deadliftState.lockoutFrames,
    hipAngle > 158 && kneeAngle > 150 && torsoLean < 20,
  );

  if (deadliftState.bottomFrames >= 2) {
    deadliftState.wasAtBottom = true;
  }

  let phase = currentPhase || "LOCKOUT";
  if (deadliftState.bottomFrames >= 2) {
    phase = "BOTTOM";
  } else if (hipTrend > 1.2) {
    phase = "LIFTING";
  } else if (hipTrend < -1.2) {
    phase = "LOWERING";
  } else if (deadliftState.lockoutFrames >= 2) {
    phase = "LOCKOUT";
  }

  const isChestDropped = torsoLean > 48;
  const isSquattingThePull = kneeAngle < 100 && torsoLean < 34;

  if (isChestDropped && phase !== "LOCKOUT" && !formFlagsThisRep.chestUp) {
    speak(CUE.chestUp());
    formFlagsThisRep.chestUp = true;
  } else if (isSquattingThePull && phase !== "LOCKOUT" && !formFlagsThisRep.hipsBack) {
    speak("hips back");
    formFlagsThisRep.hipsBack = true;
  } else if (phase === "LIFTING" && currentPhase === "BOTTOM") {
    speak("drive up");
  }

  let newRep = false;
  if (deadliftState.wasAtBottom && deadliftState.lockoutFrames >= 2) {
    newRep = true;
    deadliftState.wasAtBottom = false;
    const nextRep = repCount + 1;
    speak(nextRep % 4 === 0 ? `good ${nextRep}` : `${nextRep}`);
    resetDeadliftFlags();
  }

  let label = "HINGE DOWN";
  let color = "#ffaa00";

  if (isChestDropped) {
    label = "CHEST UP";
    color = "#ff4444";
  } else if (isSquattingThePull) {
    label = "HIPS BACK";
    color = "#ffaa00";
  } else if (phase === "LOCKOUT") {
    label = "LOCKOUT";
    color = "#00ff88";
  } else if (phase === "BOTTOM") {
    label = "READY TO PULL";
    color = "#00bfff";
  } else if (phase === "LIFTING") {
    label = "DRIVE UP";
    color = "#00bfff";
  }

  return {
    canAnalyze: true,
    phase,
    newRep,
    hipAngle: Math.round(hipAngle),
    kneeAngle: Math.round(kneeAngle),
    torsoLean: Math.round(torsoLean),
    isChestDropped,
    isSquattingThePull,
    hasFormIssue: isChestDropped || isSquattingThePull,
    label,
    color,
    angles: {
      "Hip Angle": Math.round(hipAngle),
      "Knee Angle": Math.round(kneeAngle),
      "Torso Lean": Math.round(torsoLean),
    },
  };
}
