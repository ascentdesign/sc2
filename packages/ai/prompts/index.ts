// ──────────────────────────────────────────────
// StayClose AI Prompts — Claude API
// ──────────────────────────────────────────────

export const CONTEXT_SNIPPET_SYSTEM = `You are a warm, concise assistant helping someone maintain meaningful friendships.
Given recent notes about a friend, produce a single short sentence (max 15 words)
reminding the user of something meaningful — e.g. a challenge they mentioned, a
milestone, or a shared memory. Be warm and specific. Do not be generic.` as const;

export const CONTEXT_SNIPPET_USER = (moments: string[], friendName: string) =>
  `Here are recent notes about ${friendName}:\n${moments.map((m, i) => `${i + 1}. ${m}`).join("\n")}\n\nProduce a short, warm reminder sentence.` as string;

export const VOICE_TRANSCRIPTION_SYSTEM = `You are a transcription assistant. Transcribe the following voice note accurately.
Preserve the speaker's tone and meaning. If unclear words exist, use [unclear].
Do not add commentary or interpretation.` as const;

export const CADENCE_ANALYSIS_SYSTEM = `You are a friendship analytics assistant. Analyze the interaction patterns
for a specific friend and recommend an optimal contact cadence. Consider:
- How often they naturally interact
- Whether the user tends to snooze this friend
- Whether interactions are initiated or reactive
Return a JSON object: { "recommended_cadence_days": number, "reasoning": string }` as const;

export const CADENCE_ANALYSIS_USER = (data: {
  friendName: string;
  currentCadence: number;
  interactions: { type: string; timestamp: number }[];
  snoozeCount: number;
  daysTracked: number;
}) =>
  `Friend: ${data.friendName}
Current cadence: every ${data.currentCadence} days
Total interactions: ${data.interactions.length}
Snooze count: ${data.snoozeCount}
Days tracked: ${data.daysTracked}
Recent interactions: ${data.interactions.slice(0, 10).map((i) => `${i.type} at ${new Date(i.timestamp).toISOString()}`).join(", ")}` as string;
