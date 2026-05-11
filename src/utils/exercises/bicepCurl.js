import { getAngle } from "../poseDetector";
import { speak, speakRep } from "../audioCoach";
import { getBestSide, getDistance, nextStableCount, smoothValue } from "./analysisHelpers";

let curlState = createFreshState();
let formFlagsThisRep = {
  elbowForward: false,
};

function createFreshState() {
  return {
    smoothedElbowAngle: null,
    previousElbowAngle: null,
    topFrames: 0,
    bottomFrames: 0,
    wasAtTop: false,
  };
}

export function resetCurlFlags() {
  curlState = createFreshState();
  formFlagsThisRep = {
    elbowForward: false,
  };
}

export function analyzeBicepCurl(keypoints, repCount) {
  const bestSide = getBestSide(keypoints, ["shoulder", "elbow", "wrist", "hip"]);
  const { shoulder, elbow, wrist } = bestSide.joints;

  if (!shoulder || !elbow || !wrist) {
    return {
      canAnalyze: false,
      missing: "Side view needed - keep your shoulder, elbow, and wrist visible",
    };
  }

  const rawElbowAngle = getAngle(shoulder, elbow, wrist);
  curlState.smoothedElbowAngle = smoothValue(curlState.smoothedElbowAngle, rawElbowAngle, 0.4);

  const elbowAngle = curlState.smoothedElbowAngle;
  const elbowTrend =
    curlState.previousElbowAngle === null ? 0 : elbowAngle - curlState.previousElbowAngle;

  curlState.previousElbowAngle = elbowAngle;
  curlState.topFrames = nextStableCount(curlState.topFrames, elbowAngle < 70);
  curlState.bottomFrames = nextStableCount(curlState.bottomFrames, elbowAngle > 145);

  if (curlState.topFrames >= 2) {
    curlState.wasAtTop = true;
  }

  const upperArmLength = Math.max(getDistance(shoulder, elbow), 1);
  const elbowTravelRatio = Math.abs(elbow.x - shoulder.x) / upperArmLength;
  const isElbowSwinging = elbowTravelRatio > 0.35;

  if (isElbowSwinging && !formFlagsThisRep.elbowForward && elbowAngle < 110) {
    speak("keep elbow still");
    formFlagsThisRep.elbowForward = true;
  }

  let phase = "DOWN";
  if (curlState.topFrames >= 2) {
    phase = "TOP";
  } else if (elbowTrend < -1) {
    phase = "CURLING";
  } else if (elbowTrend > 1) {
    phase = "LOWERING";
  }

  let newRep = false;
  if (curlState.wasAtTop && curlState.bottomFrames >= 2) {
    newRep = true;
    curlState.wasAtTop = false;
    speakRep(`${repCount + 1}`);
    resetCurlFlags();
  }

  let label;
  let color;

  if (isElbowSwinging) {
    label = "ELBOW STILL";
    color = "#ffaa00";
  } else if (phase === "TOP") {
    label = "TOP ✅";
    color = "#00ff88";
  } else if (phase === "CURLING") {
    label = "CURL UP ⬆";
    color = "#00bfff";
  } else if (phase === "LOWERING") {
    label = "LOWER SLOW ⬇";
    color = "#ffaa00";
  } else {
    label = "DOWN — curl up";
    color = "#00bfff";
  }

  return {
    canAnalyze: true,
    phase,
    newRep,
    elbowAngle: Math.round(elbowAngle),
    isElbowSwinging,
    hasFormIssue: isElbowSwinging,
    label,
    color,
    angles: {
      "Elbow Angle": Math.round(elbowAngle),
    },
  };
}
