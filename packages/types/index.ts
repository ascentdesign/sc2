import { z } from "zod";

// ──────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────

export const PreferredChannel = z.enum([
  "call",
  "text",
  "voice",
  "in_person",
]);
export type PreferredChannel = z.infer<typeof PreferredChannel>;

export const InteractionType = z.enum([
  "call",
  "text",
  "voice_note",
  "in_person",
]);
export type InteractionType = z.infer<typeof InteractionType>;

export const VibePreset = z.enum(["stay_close", "regular", "catch_up", "now_and_then"]);
export type VibePreset = z.infer<typeof VibePreset>;

/** Maps vibe presets to cadence days */
export const VIBE_CADENCE_MAP: Record<VibePreset, number> = {
  stay_close: 7,
  regular: 14,
  catch_up: 30,
  now_and_then: 90,
};

// ──────────────────────────────────────────────
// Status labels derived from overdue score
// ──────────────────────────────────────────────

export type StatusLabel = "in_touch" | "soon" | "its_been_a_while";

export function getStatusLabel(overdueScore: number): StatusLabel {
  if (overdueScore < 0.8) return "in_touch";
  if (overdueScore <= 1.2) return "soon";
  return "its_been_a_while";
}

export const STATUS_LABEL_DISPLAY: Record<StatusLabel, string> = {
  in_touch: "In touch",
  soon: "Soon",
  its_been_a_while: "It's been a while",
};

export const STATUS_LABEL_COLOR: Record<StatusLabel, string> = {
  in_touch: "gray",
  soon: "amber",
  its_been_a_while: "red",
};

// ──────────────────────────────────────────────
// Zod Schemas — Form validation
// ──────────────────────────────────────────────

export const CreateFriendSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  relationship_context: z.string().max(200).optional(),
  vibe: VibePreset.default("regular"),
  preferred_channel: PreferredChannel.default("text"),
  important_dates: z
    .array(
      z.object({
        label: z.string().max(50),
        date: z.string(), // ISO date string YYYY-MM-DD
      })
    )
    .optional()
    .default([]),
});

export type CreateFriendInput = z.infer<typeof CreateFriendSchema>;

export const UpdateFriendSchema = CreateFriendSchema.partial().extend({
  photo_storage_id: z.string().optional(),
  archived_at: z.number().optional(),
});

export type UpdateFriendInput = z.infer<typeof UpdateFriendSchema>;

export const CreateMomentSchema = z.object({
  friend_id: z.string().min(1),
  content: z.string().min(1, "Moment cannot be empty").max(1000),
});

export type CreateMomentInput = z.infer<typeof CreateMomentSchema>;

export const CreateInteractionSchema = z.object({
  friend_id: z.string().min(1),
  type: InteractionType,
  note_text: z.string().max(2000).optional(),
  voice_storage_id: z.string().optional(),
  transcript: z.string().optional(),
});

export type CreateInteractionInput = z.infer<typeof CreateInteractionSchema>;

export const SnoozeSchema = z.object({
  ranking_id: z.string().min(1),
  snooze_until: z.enum(["tomorrow", "this_weekend", "next_week"]),
});

export type SnoozeInput = z.infer<typeof SnoozeSchema>;

// ──────────────────────────────────────────────
// Time-of-day greeting
// ──────────────────────────────────────────────

export type TimeOfDay = "morning" | "afternoon" | "evening";

export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export const GREETING_DISPLAY: Record<TimeOfDay, string> = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
};
