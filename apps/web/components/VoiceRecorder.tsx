"use client";

import { useState } from "react";

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    // Placeholder for actual recording logic
    setTimeout(() => {
      setIsRecording(false);
      onRecordingComplete?.(new Blob());
    }, 2000);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      className={`rounded-full p-4 transition-all ${
        isRecording
          ? "bg-red-500 text-white animate-pulse"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
    >
      {isRecording ? (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      )}
    </button>
  );
}

export default VoiceRecorder;
