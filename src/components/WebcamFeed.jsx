import { useEffect, useRef, useState } from "react";
import { loadMoveNet, detectPose } from "../utils/poseDetector";

const CONNECTIONS = [
  [0, 1], [0, 2], [1, 3], [2, 4],
  [5, 6], [5, 11], [6, 12], [11, 12],
  [5, 7], [7, 9],
  [6, 8], [8, 10],
  [11, 13], [13, 15],
  [12, 14], [14, 16],
];

export default function WebcamFeed({ onPoseDetected, onStreamReady }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const [status, setStatus] = useState("Loading MoveNet Thunder...");
  const [ready, setReady]   = useState(false);

  const streamRef = useRef(null);

  const onPoseDetectedRef = useRef(onPoseDetected);

useEffect(() => {
  onPoseDetectedRef.current = onPoseDetected;
}, [onPoseDetected]);

  useEffect(() => {
    const init = async () => {
      try {
        await loadMoveNet();
        setStatus("Model ready — starting camera...");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        videoRef.current.srcObject = stream;
        streamRef.current = stream;  
        if (onStreamReady) onStreamReady(stream);
        setReady(true);
        setStatus("Camera active ✅");
      } catch (err) {
        setStatus("Error: " + err.message);
      }
    };
    init();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const handleVideoPlay = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;

    const drawSkeleton = (keypoints) => {
      // Draw bones
      CONNECTIONS.forEach(([a, b]) => {
        const kpA = keypoints[a];
        const kpB = keypoints[b];
        if (kpA.score > 0.2 && kpB.score > 0.2) {
          ctx.beginPath();
          ctx.moveTo(kpA.x, kpA.y);
          ctx.lineTo(kpB.x, kpB.y);
          ctx.strokeStyle = "#00ff88";
          ctx.lineWidth   = 2;
          ctx.stroke();
        }
      });

      // Draw joints
      keypoints.forEach((kp) => {
        if (kp.score > 0.2) {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = "#ff4444";
          ctx.fill();
        }
      });
    };

    const loop = async () => {
      if (!video.paused && !video.ended) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const pose = await detectPose(video);
        if (pose) {
          drawSkeleton(pose.keypoints);
          if (onPoseDetectedRef.current) onPoseDetectedRef.current(pose.keypoints);
        }
      }
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
  };




  const loop = async () => {
    if (!video.paused && !video.ended) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pose = await detectPose(video);
      console.log("pose:", pose); // ADD THIS
      if (pose) {
        drawSkeleton(pose.keypoints);
        if (onPoseDetected) onPoseDetected(pose.keypoints);
      }
    }
    animRef.current = requestAnimationFrame(loop);
  };

  return (
    <div style={styles.wrapper}>
      {/* Status bar */}
      <div style={styles.statusBar}>
        <span style={{
          ...styles.dot,
          backgroundColor: ready ? "#00ff88" : "#ffaa00"
        }} />
        <p style={styles.statusText}>{status}</p>
      </div>

      {/* Camera guide — shown before ready */}
      {!ready && (
        <div style={styles.guide}>
          <p style={styles.guideText}>📱 Place your phone on a chair</p>
          <p style={styles.guideText}>📐 Hip height, side view</p>
          <p style={styles.guideText}>📏 3-4 feet away from you</p>
          <p style={styles.guideText}>🎯 Full body must be visible</p>
        </div>
      )}


      

      {/* Video + canvas overlay */}
      <div style={styles.videoContainer}>
        <video
          ref={videoRef}
          autoPlay
          muted
          onPlay={handleVideoPlay}
          style={styles.video}
        />
        <canvas ref={canvasRef} style={styles.canvas} />
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  statusBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  statusText: {
    color: "#888",
    fontSize: "0.85rem",
    margin: 0,
  },
  guide: {
    backgroundColor: "#1a1a3e",
    border: "1px dashed #333",
    borderRadius: "10px",
    padding: "16px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  guideText: {
    color: "#aaa",
    fontSize: "0.85rem",
    margin: 0,
  },
  videoContainer: {
    position: "relative",
    width: "640px",
    height: "480px",
    backgroundColor: "#000",
    borderRadius: "12px",
    overflow: "hidden",
  },
  video: {
    position: "absolute",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
};