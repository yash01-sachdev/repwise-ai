import { getAngle, getKP } from "../poseDetector";
import { speakRep } from "../audioCoach";

let wasAtTop = false;
let repJustCounted = false;

export function resetCurlFlags() {
  wasAtTop = false;
  repJustCounted = false;
}

export function analyzeBicepCurl(keypoints, repCount) {
  const shoulder = getKP(keypoints, "left_shoulder");
  const elbow    = getKP(keypoints, "left_elbow");
  const wrist    = getKP(keypoints, "left_wrist");

  if (!shoulder || !elbow || !wrist) {
    return {
      canAnalyze: false,
      missing: "Can't see arm — side view, full arm visible",
    };
  }

  const elbowAngle = getAngle(shoulder, elbow, wrist);

  let phase;
  if (elbowAngle > 130)     phase = "DOWN";
  else if (elbowAngle < 80) phase = "TOP";
  else                      phase = "MOVING";

  // Mark top
  if (phase === "TOP") {
    wasAtTop = true;
    repJustCounted = false; // reset so next DOWN can count
  }

  let newRep = false;

  // Count rep only once per DOWN after TOP
  if (wasAtTop && phase === "DOWN" && !repJustCounted) {
    newRep = true;
    wasAtTop = false;
    repJustCounted = true;
    const nextRep = repCount + 1;
    if (nextRep % 2 !== 0) speakRep(`${nextRep}`);
  }

  let label, color;
  if (phase === "DOWN")     { label = "DOWN — curl up"; color = "#00bfff"; }
  else if (phase === "TOP") { label = "TOP ✅";          color = "#00ff88"; }
  else                      { label = "CURLING...";      color = "#ffaa00"; }

  return {
    canAnalyze: true,
    phase,
    newRep,
    elbowAngle: Math.round(elbowAngle),
    label,
    color,
    angles: {
      "Elbow Angle": Math.round(elbowAngle),
    },
  };
}