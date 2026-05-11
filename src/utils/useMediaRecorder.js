import { useRef } from "react";

const RECORDING_TYPES = [
  "video/webm;codecs=vp8",
  "video/webm",
];

function getSupportedMimeType() {
  return RECORDING_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

export function useMediaRecorder() {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const mimeTypeRef = useRef("");

  const startRecording = (stream) => {
    if (!stream) return;
    chunksRef.current = [];

    const mimeType = getSupportedMimeType();
    const options = {
      videoBitsPerSecond: 2_500_000,
    };

    if (mimeType) {
      options.mimeType = mimeType;
    }

    mimeTypeRef.current = mimeType || "video/webm";

    const recorder = new MediaRecorder(stream, options);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.start(1000); // collect data every 1 second
    mediaRecorderRef.current = recorder;
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(null);
        return;
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        chunksRef.current = [];
        resolve(blob);
      };
      recorder.stop();
    });
  };

  return { startRecording, stopRecording };
}
