"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Play, Pause, Loader2 } from "lucide-react";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, url: string) => void;
  onRecordingError?: (error: string) => void;
  maxDurationMs?: number;
}

interface RecordingState {
  status: "idle" | "recording" | "paused" | "completed" | "error";
  durationMs: number;
  error?: string;
}

// ──────────────────────────────────────────────
// Browser Compatibility Check
// ──────────────────────────────────────────────

function checkMediaRecorderSupport(): {
  supported: boolean;
  mimeType?: string;
} {
  if (typeof window === "undefined" || !window.MediaRecorder) {
    return { supported: false };
  }

  // Try common MIME types in order of preference
  const mimeTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/wav",
  ];

  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return { supported: true, mimeType };
    }
  }

  // Fallback: try without specifying MIME type
  return { supported: true };
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function VoiceRecorder({
  onRecordingComplete,
  onRecordingError,
  maxDurationMs = 60000, // 60 seconds default
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>({
    status: "idle",
    durationMs: 0,
  });
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);

  // Check browser support on mount
  useEffect(() => {
    const support = checkMediaRecorderSupport();
    if (!support.supported) {
      setIsSupported(false);
      setState({
        status: "error",
        durationMs: 0,
        error: "Voice recording is not supported in this browser. Please try Chrome, Safari, or Firefox.",
      });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [audioUrl]);

  // ──────────────────────────────────────────────
  // Recording Controls
  // ──────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;

      const support = checkMediaRecorderSupport();
      const options: MediaRecorderOptions = support.mimeType
        ? { mimeType: support.mimeType }
        : {};

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: support.mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setState((prev) => ({ ...prev, status: "completed" }));
        onRecordingComplete(audioBlob, url);
      };

      mediaRecorder.onerror = (event) => {
        const errorMsg = "Recording error occurred";
        setState({
          status: "error",
          durationMs: 0,
          error: errorMsg,
        });
        onRecordingError?.(errorMsg);
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      startTimeRef.current = Date.now();
      pausedDurationRef.current = 0;

      setState({ status: "recording", durationMs: 0 });

      // Start duration timer
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current - pausedDurationRef.current;
        setState((prev) => ({ ...prev, durationMs: elapsed }));

        // Auto-stop at max duration
        if (elapsed >= maxDurationMs) {
          stopRecording();
        }
      }, 100);
    } catch (error) {
      const errorMsg =
        error instanceof DOMException
          ? error.name === "NotAllowedError"
            ? "Microphone access was denied. Please allow microphone access to record voice notes."
            : error.name === "NotFoundError"
            ? "No microphone found. Please connect a microphone and try again."
            : "Could not access microphone"
          : "Failed to start recording";

      setState({
        status: "error",
        durationMs: 0,
        error: errorMsg,
      });
      onRecordingError?.(errorMsg);
    }
  }, [maxDurationMs, onRecordingComplete, onRecordingError]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.status === "recording") {
      mediaRecorderRef.current.pause();
      pausedDurationRef.current += Date.now() - startTimeRef.current;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setState((prev) => ({ ...prev, status: "paused" }));
    }
  }, [state.status]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.status === "paused") {
      mediaRecorderRef.current.resume();
      startTimeRef.current = Date.now() - pausedDurationRef.current;
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current - pausedDurationRef.current;
        setState((prev) => ({ ...prev, durationMs: elapsed }));

        if (elapsed >= maxDurationMs) {
          stopRecording();
        }
      }, 100);
      setState((prev) => ({ ...prev, status: "recording" }));
    }
  }, [state.status, maxDurationMs]);

  const stopRecording = useCallback(() => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop media recorder
    if (
      mediaRecorderRef.current &&
      (state.status === "recording" || state.status === "paused")
    ) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch {
        // Ignore errors if already stopped
      }
    }

    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, [state.status]);

  // ──────────────────────────────────────────────
  // Playback Controls
  // ──────────────────────────────────────────────

  const togglePlayback = useCallback(() => {
    if (!audioUrl) return;

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl, isPlaying]);

  const resetRecording = useCallback(() => {
    stopRecording();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setState({ status: "idle", durationMs: 0 });
  }, [audioUrl, stopRecording]);

  // ──────────────────────────────────────────────
  // Formatting
  // ──────────────────────────────────────────────

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────

  if (!isSupported) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {state.error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Display */}
      <AnimatePresence>
        {state.status === "error" && state.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {state.error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Visualization */}
      <AnimatePresence mode="wait">
        {state.status === "recording" && (
          <motion.div
            key="recording-viz"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center gap-2 py-4"
          >
            {/* Animated recording bars */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 rounded-full bg-red-500"
                animate={{
                  height: [20, 40, 20],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 0.5 + i * 0.1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        )}

        {state.status === "paused" && (
          <motion.div
            key="paused-viz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 py-4"
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-5 w-2 rounded-full bg-amber-500 opacity-50"
              />
            ))}
          </motion.div>
        )}

        {(state.status === "idle" || state.status === "completed") && audioUrl && (
          <motion.div
            key="playback-viz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-4"
          >
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <div className="flex gap-1">
                  <motion.div
                    className="h-4 w-1 rounded-full bg-white"
                    animate={{ scaleY: [1, 0.5, 1] }}
                    transition={{ duration: 0.4, repeat: Infinity }}
                  />
                  <motion.div
                    className="h-4 w-1 rounded-full bg-white"
                    animate={{ scaleY: [1, 0.3, 1] }}
                    transition={{ duration: 0.3, repeat: Infinity, delay: 0.1 }}
                  />
                  <motion.div
                    className="h-4 w-1 rounded-full bg-white"
                    animate={{ scaleY: [1, 0.6, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.05 }}
                  />
                </div>
              ) : (
                <Play className="h-5 w-5 text-white" fill="white" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duration Display */}
      {(state.status === "recording" ||
        state.status === "paused" ||
        state.status === "completed") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm font-medium text-[var(--muted-foreground)]"
        >
          {formatDuration(state.durationMs)}
          {state.status === "recording" && (
            <span className="ml-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-red-500" />
          )}
        </motion.div>
      )}

      {/* Recorded Audio Player (for completed state) */}
      <AnimatePresence>
        {state.status === "completed" && audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-4"
          >
            <button
              onClick={togglePlayback}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--muted)]"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Play
                </>
              )}
            </button>
            <button
              onClick={resetRecording}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Square className="h-4 w-4" />
              Re-record
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Controls */}
      <AnimatePresence mode="wait">
        {state.status === "idle" && (
          <motion.button
            key="start-btn"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startRecording}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            <Mic className="h-4 w-4" />
            Start Recording
          </motion.button>
        )}

        {(state.status === "recording" || state.status === "paused") && (
          <motion.div
            key="recording-controls"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex gap-3"
          >
            {state.status === "recording" ? (
              <button
                onClick={pauseRecording}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-medium transition-colors hover:bg-[var(--muted)]"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
              >
                Resume
              </button>
            )}
            <button
              onClick={stopRecording}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              <Square className="h-4 w-4" />
              Stop
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Max Duration Hint */}
      {state.status !== "idle" && state.status !== "completed" && (
        <p className="text-center text-xs text-[var(--muted-foreground)]">
          Max recording: {formatDuration(maxDurationMs)}
        </p>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Hook for consuming the recorder
// ──────────────────────────────────────────────

export function useVoiceRecorder() {
  const [recordings, setRecordings] = useState<
    { blob: Blob; url: string; id: string }[]
  >([]);

  const addRecording = useCallback((blob: Blob, url: string) => {
    const id = `recording-${Date.now()}`;
    setRecordings((prev) => [...prev, { blob, url, id }]);
    return id;
  }, []);

  const removeRecording = useCallback((id: string) => {
    setRecordings((prev) => {
      const recording = prev.find((r) => r.id === id);
      if (recording) {
        URL.revokeObjectURL(recording.url);
      }
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  const getLatestRecording = useCallback(() => {
    return recordings[recordings.length - 1] ?? null;
  }, [recordings]);

  return {
    recordings,
    addRecording,
    removeRecording,
    getLatestRecording,
  };
}
