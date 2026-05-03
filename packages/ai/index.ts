import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import {
  CONTEXT_SNIPPET_SYSTEM,
  CONTEXT_SNIPPET_USER,
  VOICE_TRANSCRIPTION_SYSTEM,
  CADENCE_ANALYSIS_SYSTEM,
  CADENCE_ANALYSIS_USER,
} from "./prompts";

// ──────────────────────────────────────────────
// Claude API Client
// ──────────────────────────────────────────────

const MODEL = "claude-sonnet-4-20250514";

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY environment variable not set");
  return new Anthropic({ apiKey });
}

// ──────────────────────────────────────────────
// Context Snippet Generation
// ──────────────────────────────────────────────

export interface GenerateSnippetInput {
  friendName: string;
  moments: string[];
}

export interface GenerateSnippetOutput {
  snippet: string;
}

/** Generates a short, warm context snippet from recent moments about a friend */
export async function generateSnippet(
  input: GenerateSnippetInput
): Promise<GenerateSnippetOutput> {
  const client = getClient();

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 100,
    system: CONTEXT_SNIPPET_SYSTEM,
    messages: [
      {
        role: "user",
        content: CONTEXT_SNIPPET_USER(input.moments, input.friendName),
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0.text] : "";
  return { snippet: text.trim() };
}

// ──────────────────────────────────────────────
// OpenAI Client (for Whisper transcription)
// ──────────────────────────────────────────────

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("OPENAI_API_KEY not set — voice transcription disabled");
    return null;
  }
  return new OpenAI({ apiKey });
}

// ──────────────────────────────────────────────
// Voice Transcription
// ──────────────────────────────────────────────

export interface TranscribeVoiceInput {
  audioBase64: string;
  mediaType: "audio/webm" | "audio/mp4" | "audio/wav" | "audio/ogg" | "audio/mpeg";
}

export interface TranscribeVoiceOutput {
  transcript: string;
  confidence?: number;
}

/**
 * Transcribes a voice note using OpenAI Whisper API.
 *
 * Falls back to Claude API if OpenAI is unavailable (with a warning message).
 */
export async function transcribeVoice(
  input: TranscribeVoiceInput
): Promise<TranscribeVoiceOutput> {
  const openai = getOpenAIClient();

  // If OpenAI is not configured, return a helpful message
  if (!openai) {
    return {
      transcript: "[Voice transcription unavailable — OpenAI API key not configured]",
    };
  }

  try {
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(input.audioBase64, "base64");

    // Determine file extension from media type
    const extMap: Record<string, string> = {
      "audio/webm": "webm",
      "audio/mp4": "m4a",
      "audio/wav": "wav",
      "audio/ogg": "ogg",
      "audio/mpeg": "mp3",
    };
    const extension = extMap[input.mediaType] || "webm";

    // Create a File object for the OpenAI API
    const file = new File([audioBuffer], `audio.${extension}`, {
      type: input.mediaType,
    });

    // Call Whisper API
    const response = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "json",
    });

    return {
      transcript: response.text.trim(),
    };
  } catch (error) {
    console.error("Whisper transcription failed:", error);
    return {
      transcript: "[Transcription failed — check audio quality and try again]",
    };
  }
}

// ──────────────────────────────────────────────
// Cadence Analysis (Weekly ML Feedback)
// ──────────────────────────────────────────────

export interface CadenceAnalysisInput {
  friendName: string;
  currentCadence: number;
  interactions: { type: string; timestamp: number }[];
  snoozeCount: number;
  daysTracked: number;
}

export interface CadenceAnalysisOutput {
  recommended_cadence_days: number;
  reasoning: string;
}

/** Analyzes interaction patterns and recommends optimal contact cadence */
export async function analyzeCadence(
  input: CadenceAnalysisInput
): Promise<CadenceAnalysisOutput> {
  const client = getClient();

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 200,
    system: CADENCE_ANALYSIS_SYSTEM,
    messages: [
      {
        role: "user",
        content: CADENCE_ANALYSIS_USER(input),
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0.text] : "";

  try {
    return JSON.parse(text);
  } catch {
    // Fallback: keep current cadence if parsing fails
    return {
      recommended_cadence_days: input.currentCadence,
      reasoning: "Could not parse AI recommendation. Keeping current cadence.",
    };
  }
}
