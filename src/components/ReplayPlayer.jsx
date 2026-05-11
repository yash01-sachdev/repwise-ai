import { useEffect, useMemo, useRef } from "react";

const CONNECTIONS = [
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
];

function getFrameForTime(poseFrames, timeMs) {
  if (!poseFrames?.length) {
    return null;
  }

  let bestFrame = poseFrames[0];

  for (const frame of poseFrames) {
    if (frame.t > timeMs) {
      break;
    }
    bestFrame = frame;
  }

  return bestFrame;
}

function drawSkeleton(ctx, keypoints, width, height) {
  ctx.clearRect(0, 0, width, height);

  if (!keypoints?.length) {
    return;
  }

  const byName = Object.fromEntries(keypoints.map((kp) => [kp.name, kp]));

  CONNECTIONS.forEach(([start, end]) => {
    const pointA = byName[start];
    const pointB = byName[end];

    if (!pointA || !pointB || pointA.score < 0.2 || pointB.score < 0.2) {
      return;
    }

    ctx.beginPath();
    ctx.moveTo(pointA.x, pointA.y);
    ctx.lineTo(pointB.x, pointB.y);
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  keypoints.forEach((kp) => {
    if (kp.score < 0.2) {
      return;
    }

    ctx.beginPath();
    ctx.arc(kp.x, kp.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ff4444";
    ctx.fill();
  });
}

export default function ReplayPlayer({ session }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const poseFrames = useMemo(() => session?.poseFrames || [], [session]);
  const videoUrl = useMemo(() => {
    if (!session?.videoBuffer) {
      return "";
    }

    const blob = new Blob([session.videoBuffer], {
      type: session.videoType || "video/webm",
    });

    return URL.createObjectURL(blob);
  }, [session]);

  useEffect(() => (
    () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    }
  ), [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!video || !canvas || !ctx) {
      return undefined;
    }

    let frameId = 0;

    const syncCanvasSize = () => {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    };

    const render = () => {
      if (poseFrames.length > 0) {
        const frame = getFrameForTime(poseFrames, video.currentTime * 1000);
        drawSkeleton(ctx, frame?.keypoints, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      frameId = requestAnimationFrame(render);
    };

    syncCanvasSize();
    video.addEventListener("loadedmetadata", syncCanvasSize);
    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      video.removeEventListener("loadedmetadata", syncCanvasSize);
    };
  }, [poseFrames, videoUrl]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.videoShell}>
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          playsInline
          preload="metadata"
          style={styles.video}
        />
        <canvas ref={canvasRef} style={styles.canvas} />
      </div>
      <p style={styles.note}>
        {poseFrames.length > 0
          ? "Replay includes the saved skeleton overlay from your set."
          : "This older session only has the recorded video."}
      </p>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  videoShell: {
    position: "relative",
    width: "100%",
    backgroundColor: "#000",
    borderRadius: "12px",
    overflow: "hidden",
  },
  video: {
    display: "block",
    width: "100%",
    borderRadius: "12px",
    backgroundColor: "#000",
  },
  canvas: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  },
  note: {
    color: "#666",
    fontSize: "0.8rem",
    margin: 0,
  },
};
