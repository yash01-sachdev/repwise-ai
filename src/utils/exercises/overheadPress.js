import { getAngle, getKP } from "../poseDetector";
import { speak } from "../audioCoach";

let wasAtBottom = false;
let formFlagsThisRep = {
  brace: false,
  stack: false,
};

export function resetOverheadPressFlags() {
  wasAtBottom = false;
  formFlagsThisRep = {
    brace: false,
    stack: false,
  };
}

function getBestSide(keypoints) {
  const left = {
    shoulder: getKP(keypoints, "left_shoulder"),
    elbow: getKP(keypoints, "left_elbow"),
    wrist: getKP(keypoints, "left_wrist"),
    hip: getKP(keypoints, "left_hip"),
  };

  const right = {
    shoulder: getKP(keypoints, "right_shoulder"),
    elbow: getKP(keypoints, "right_elbow"),
    wrist: getKP(keypoints, "right_wrist"),
    hip: getKP(keypoints, "right_hip"),
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

export function analyzeOverheadPress(keypoints, currentPhase, repCount) {
  const { shoulder, elbow, wrist, hip } = getBestSide(keypoints);

  if (!shoulder || !elbow || !wrist || !hip) {
    return {
      canAnalyze: false,
      missing: "Side view needed - keep shoulder, elbow, wrist, and hip visible",
    };
  }

  const elbowAngle = getAngle(shoulder, elbow, wrist);
  const torsoLean = getTorsoLean(shoulder, hip);
  const wristAboveShoulder = wrist.y < shoulder.y - 30;
  const wristStacked = Math.abs(wrist.x - shoulder.x) < 70;

  let phase;
  if (elbowAngle > 155 && wristAboveShoulder) {
    phase = "LOCKOUT";
  } else if (elbowAngle < 95 && wrist.y >= shoulder.y - 10) {
    phase = "BOTTOM";
  } else if (currentPhase === "BOTTOM" || wasAtBottom) {
    phase = "PRESSING";
  } else {
    phase = "LOWERING";
  }

  const isLeaningBack = torsoLean > 24;
  const isOutOfStack = phase === "LOCKOUT" && !wristStacked;

  if (isLeaningBack && phase !== "LOCKOUT" && !formFlagsThisRep.brace) {
    speak("brace tight");
    formFlagsThisRep.brace = true;
  } else if (isOutOfStack && !formFlagsThisRep.stack) {
    speak("stack overhead");
    formFlagsThisRep.stack = true;
  } else if (phase === "PRESSING" && currentPhase === "BOTTOM") {
    speak("press up");
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
    resetOverheadPressFlags();
  }

  let label = "PRESSING";
  let color = "#ffaa00";

  if (isLeaningBack) {
    label = "BRACE TIGHT";
    color = "#ff4444";
  } else if (isOutOfStack) {
    label = "STACK OVERHEAD";
    color = "#ffaa00";
  } else if (phase === "BOTTOM") {
    label = "READY TO PRESS";
    color = "#00bfff";
  } else if (phase === "LOCKOUT") {
    label = "LOCKOUT";
    color = "#00ff88";
  } else if (phase === "PRESSING") {
    label = "PRESS UP";
    color = "#00bfff";
  }

  return {
    canAnalyze: true,
    phase,
    newRep,
    elbowAngle: Math.round(elbowAngle),
    torsoLean: Math.round(torsoLean),
    isLeaningBack,
    isOutOfStack,
    hasFormIssue: isLeaningBack || isOutOfStack,
    label,
    color,
    angles: {
      "Elbow Angle": Math.round(elbowAngle),
      "Torso Lean": Math.round(torsoLean),
    },
  };
}
