import { getAngle, getKP } from "../poseDetector";
import { speak } from "../audioCoach";

let wasAtBottom = false;
let formFlagsThisRep = {
  hipSag:  false,
  notDeep: false,
};

export function resetPushupFlags() {
  wasAtBottom = false;
  formFlagsThisRep = { hipSag: false, notDeep: false };
}

export function analyzePushup(keypoints, repCount) {
  const lShoulder = getKP(keypoints, "left_shoulder");
  const rShoulder = getKP(keypoints, "right_shoulder");
  const lElbow    = getKP(keypoints, "left_elbow");
  const rElbow    = getKP(keypoints, "right_elbow");
  const lWrist    = getKP(keypoints, "left_wrist");
  const rWrist    = getKP(keypoints, "right_wrist");
  const lHip      = getKP(keypoints, "left_hip");
  const rHip      = getKP(keypoints, "right_hip");

  if (!lShoulder || !rShoulder || !lElbow || !rElbow || !lWrist || !rWrist) {
    return { canAnalyze: false, missing: "Move camera above — need to see both arms" };
  }

  // Average both arms for stability
  const lElbowAngle = getAngle(lShoulder, lElbow, lWrist);
  const rElbowAngle = getAngle(rShoulder, rElbow, rWrist);
  const elbowAngle  = (lElbowAngle + rElbowAngle) / 2;

  // Hip sag — hip should not drop below shoulder level
  // In top-down/front view: hip y should be close to shoulder y
  const shoulderY = (lShoulder.y + rShoulder.y) / 2;
  const hipY      = lHip && rHip ? (lHip.y + rHip.y) / 2 : null;
  const isHipSag  = hipY ? (hipY - shoulderY) > 60 : false;

  // Form cues
  if (isHipSag && !formFlagsThisRep.hipSag) {
    speak("hips up");
    formFlagsThisRep.hipSag = true;
  }

  // Rep counting — elbow angle low then high
  let newRep = false;
  if (elbowAngle < 90) wasAtBottom = true;
  if (wasAtBottom && elbowAngle > 150) {
    newRep = true;
    wasAtBottom = false;
    const nextRep = repCount + 1;
    speak(nextRep % 4 === 0 ? `good ${nextRep}` : `${nextRep}`);
    resetPushupFlags();
  }

  // Phase
  let phase;
  if (elbowAngle > 150)      phase = "UP";
  else if (elbowAngle > 90)  phase = "DESCENDING";
  else                       phase = "BOTTOM";

  // Status
  let label, color;
  if (isHipSag)          { label = "HIPS UP ⚠️";     color = "#ff4444"; }
  else if (phase === "UP")         { label = "UP — begin pushup"; color = "#00bfff"; }
  else if (phase === "DESCENDING") { label = "DESCENDING ⬇";      color = "#ffaa00"; }
  else                             { label = "GOOD DEPTH ✅";      color = "#00ff88"; }

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