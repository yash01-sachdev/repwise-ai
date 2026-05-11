import { getAngle, getKP } from "../poseDetector";
import { speak } from "../audioCoach";
import { averagePoints, getDistance, nextStableCount, smoothValue } from "./analysisHelpers";

let pushupState = createFreshState();
let formFlagsThisRep = {
  hipSag: false,
};

function createFreshState() {
  return {
    smoothedElbowAngle: null,
    previousElbowAngle: null,
    bottomFrames: 0,
    topFrames: 0,
    wasAtBottom: false,
  };
}

export function resetPushupFlags() {
  pushupState = createFreshState();
  formFlagsThisRep = { hipSag: false };
}

export function analyzePushup(keypoints, repCount) {
  const lShoulder = getKP(keypoints, "left_shoulder");
  const rShoulder = getKP(keypoints, "right_shoulder");
  const lElbow = getKP(keypoints, "left_elbow");
  const rElbow = getKP(keypoints, "right_elbow");
  const lWrist = getKP(keypoints, "left_wrist");
  const rWrist = getKP(keypoints, "right_wrist");
  const lHip = getKP(keypoints, "left_hip");
  const rHip = getKP(keypoints, "right_hip");

  if (!lShoulder || !rShoulder || !lElbow || !rElbow || !lWrist || !rWrist) {
    return {
      canAnalyze: false,
      missing: "Front or top view needed - keep both shoulders, elbows, and wrists visible",
    };
  }

  const shoulderMid = averagePoints(lShoulder, rShoulder);
  const hipMid = averagePoints(lHip, rHip);
  const shoulderWidth = Math.max(getDistance(lShoulder, rShoulder), 1);

  const rawElbowAngle =
    (getAngle(lShoulder, lElbow, lWrist) + getAngle(rShoulder, rElbow, rWrist)) / 2;

  pushupState.smoothedElbowAngle = smoothValue(pushupState.smoothedElbowAngle, rawElbowAngle, 0.4);
  const elbowAngle = pushupState.smoothedElbowAngle;
  const elbowTrend =
    pushupState.previousElbowAngle === null ? 0 : elbowAngle - pushupState.previousElbowAngle;

  pushupState.previousElbowAngle = elbowAngle;
  pushupState.bottomFrames = nextStableCount(pushupState.bottomFrames, elbowAngle < 95);
  pushupState.topFrames = nextStableCount(pushupState.topFrames, elbowAngle > 155);

  if (pushupState.bottomFrames >= 2) {
    pushupState.wasAtBottom = true;
  }

  const hipDrop = hipMid ? hipMid.y - shoulderMid.y : 0;
  const isHipSag = hipMid ? hipDrop > shoulderWidth * 0.45 : false;

  let phase = "UP";
  if (pushupState.bottomFrames >= 2) {
    phase = "BOTTOM";
  } else if (elbowTrend < -1.5) {
    phase = "DESCENDING";
  } else if (elbowTrend > 1.5) {
    phase = "PRESSING";
  }

  if (isHipSag && !formFlagsThisRep.hipSag && phase !== "UP") {
    speak("hips up");
    formFlagsThisRep.hipSag = true;
  }

  let newRep = false;
  if (pushupState.wasAtBottom && pushupState.topFrames >= 2) {
    newRep = true;
    pushupState.wasAtBottom = false;
    const nextRep = repCount + 1;
    speak(nextRep % 4 === 0 ? `good ${nextRep}` : `${nextRep}`);
    resetPushupFlags();
  }

  let label;
  let color;

  if (isHipSag) {
    label = "HIPS UP ⚠️";
    color = "#ff4444";
  } else if (phase === "UP") {
    label = "UP — begin pushup";
    color = "#00bfff";
  } else if (phase === "DESCENDING") {
    label = "DESCENDING ⬇";
    color = "#ffaa00";
  } else if (phase === "PRESSING") {
    label = "PRESS UP ⬆";
    color = "#00bfff";
  } else {
    label = "GOOD DEPTH ✅";
    color = "#00ff88";
  }

  return {
    canAnalyze: true,
    phase,
    newRep,
    elbowAngle: Math.round(elbowAngle),
    isHipSag,
    label,
    color,
    angles: {
      "Elbow Angle": Math.round(elbowAngle),
    },
  };
}
