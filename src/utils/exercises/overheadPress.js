import { getAngle } from "../poseDetector";
import { speak } from "../audioCoach";
import { getBestSide, getTorsoLean, nextStableCount, smoothValue } from "./analysisHelpers";

let pressState = createFreshState();
let formFlagsThisRep = {
  brace: false,
  stack: false,
};

function createFreshState() {
  return {
    smoothedElbowAngle: null,
    smoothedTorsoLean: null,
    previousElbowAngle: null,
    bottomFrames: 0,
    lockoutFrames: 0,
    wasAtBottom: false,
  };
}

export function resetOverheadPressFlags() {
  pressState = createFreshState();
  formFlagsThisRep = {
    brace: false,
    stack: false,
  };
}

export function analyzeOverheadPress(keypoints, currentPhase, repCount) {
  const bestSide = getBestSide(keypoints, ["shoulder", "elbow", "wrist", "hip"]);
  const { shoulder, elbow, wrist, hip } = bestSide.joints;

  if (!shoulder || !elbow || !wrist || !hip) {
    return {
      canAnalyze: false,
      missing: "Side view needed - keep shoulder, elbow, wrist, and hip visible",
    };
  }

  const rawElbowAngle = getAngle(shoulder, elbow, wrist);
  const rawTorsoLean = getTorsoLean(shoulder, hip);

  pressState.smoothedElbowAngle = smoothValue(pressState.smoothedElbowAngle, rawElbowAngle, 0.35);
  pressState.smoothedTorsoLean = smoothValue(pressState.smoothedTorsoLean, rawTorsoLean, 0.35);

  const elbowAngle = pressState.smoothedElbowAngle;
  const torsoLean = pressState.smoothedTorsoLean;
  const elbowTrend =
    pressState.previousElbowAngle === null ? 0 : elbowAngle - pressState.previousElbowAngle;

  pressState.previousElbowAngle = elbowAngle;

  const wristAboveShoulder = wrist.y < shoulder.y - 35;
  const wristStacked = Math.abs(wrist.x - shoulder.x) < 55;

  pressState.bottomFrames = nextStableCount(
    pressState.bottomFrames,
    elbowAngle < 98 && wrist.y >= shoulder.y - 15,
  );
  pressState.lockoutFrames = nextStableCount(
    pressState.lockoutFrames,
    elbowAngle > 160 && wristAboveShoulder,
  );

  if (pressState.bottomFrames >= 2) {
    pressState.wasAtBottom = true;
  }

  let phase = currentPhase || "BOTTOM";
  if (pressState.bottomFrames >= 2) {
    phase = "BOTTOM";
  } else if (elbowTrend > 1.2) {
    phase = "PRESSING";
  } else if (elbowTrend < -1.2) {
    phase = "LOWERING";
  } else if (pressState.lockoutFrames >= 2) {
    phase = "LOCKOUT";
  }

  const isLeaningBack = torsoLean > 24;
  const isOutOfStack = pressState.lockoutFrames >= 2 && !wristStacked;

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
  if (pressState.wasAtBottom && pressState.lockoutFrames >= 2) {
    newRep = true;
    pressState.wasAtBottom = false;
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
  } else if (phase === "LOWERING") {
    label = "LOWER WITH CONTROL";
    color = "#ffaa00";
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
