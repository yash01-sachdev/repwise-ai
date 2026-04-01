// No npm imports — uses CDN loaded in index.html
let detector = null;

export async function loadMoveNet() {
  const tf = window.tf;
  const poseDetection = window.poseDetection;

  try {
    await tf.setBackend("webgl");
    await tf.ready();
    console.log("✅ Backend: webgl");
  } catch {
    await tf.setBackend("cpu");
    await tf.ready();
    console.log("✅ Backend: cpu");
  }

  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    }
  );

  console.log("✅ MoveNet Thunder loaded");
  return detector;
}

export async function detectPose(video) {
  if (!detector) return null;
  if (video.readyState < 2) return null;
  const poses = await detector.estimatePoses(video);
  return poses.length === 0 ? null : poses[0];
}

export function getAngle(A, B, C) {
  const radians =
    Math.atan2(C.y - B.y, C.x - B.x) -
    Math.atan2(A.y - B.y, A.x - B.x);
  let angle = Math.abs(radians * (180 / Math.PI));
  if (angle > 180) angle = 360 - angle;
  return angle;
}

export function getKP(keypoints, name, minScore = 0.2) {  // changed 0.4 → 0.2
  const kp = keypoints.find((k) => k.name === name);
  if (!kp || kp.score < minScore) return null;
  return kp;
}