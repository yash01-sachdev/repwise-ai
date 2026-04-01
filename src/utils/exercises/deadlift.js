import { getAngle, getKP } from "../poseDetector";
import { speak, CUE } from "../audioCoach";

let wasAtBottom = false;
let formFlagsThisRep = {
  chestUp: false,
  hipsBack: false,
};

export function resetDeadliftFlags() {
  wasAtBottom = false;
  formFlagsThisRep = {
    chestUp: false,
    hipsBack: false,
  };
}

function getBestSide(keypoints) {
  const left = {
    shoulder: getKP(keypoints, "left_shoulder"),
    hip: getKP(keypoints, "left_hip"),
    knee: getKP(keypoints, "left_knee"),
    ankle: getKP(keypoints, "left_ankle"),
  };

  const right = {
    shoulder: getKP(keypoints, "right_shoulder"),
    hip: getKP(keypoints, "right_hip"),
    knee: getKP(keypoints, "right_knee"),
    ankle: getKP(keypoints, "right_ankle"),
  };

  const leftScore = Object.values(left).reduce((sum, kp) => sum + (kp?.score || 0), 0);
  const rightScore = Object.values(right).reduce((sum, kp) => sum + (kp?.score || 0), 0);

  return leftScore >= rightScore ? left : right;
}

function getTorsoLean(shoulder, hip) {
  const dx = Math.abs(shoulder.x - hip.x);
  const dy = Math.abs(hip.y - shoulder.y) || 1;
  return Math.atan2(dx, dy) * (180 / Math.PI);
}

export function analyzeDeadlift(keypoints, currentPhase, repCount) {
  const { shoulder, hip, knee, ankle } = getBestSide(keypoints);

  if (!shoulder || !hip || !knee || !ankle) {
    return {
      canAnalyze: false,
      missing: "Side view needed - keep shoulder, hip, knee, and ankle visible",
    };
  }

  const hipAngle = getAngle(shoulder, hip, knee);
  const kneeAngle = getAngle(hip, knee, ankle);
  const torsoLean = getTorsoLean(shoulder, hip);

  let phase;
  if (hipAngle > 150 && torsoLean < 20) {
    phase = "LOCKOUT";
  } else if (hipAngle < 110 && torsoLean > 45) {
    phase = "BOTTOM";
  } else if (currentPhase === "BOTTOM" || wasAtBottom) {
    phase = "LIFTING";
  } else {
    phase = "LOWERING";
  }

  const isChestDropped = torsoLean > 60;
  const isSquattingThePull = kneeAngle < 95;

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
  if (phase === "BOTTOM") {
    wasAtBottom = true;
  }

  if (wasAtBottom && phase === "LOCKOUT") {
    newRep = true;
    wasAtBottom = false;
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
