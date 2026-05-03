import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ──────────────────────────────────────────────
// StayClose Convex Schema v1.0
// Phase 1 Data Model
// ──────────────────────────────────────────────

export default defineSchema({
  // ─── Users ──────────────────────────────────
  users: defineTable({
    clerk_id: v.string(),
    name: v.string(),
    email: v.string(),
    timezone: v.string(), // IANA timezone string, e.g. "America/Kingston"
    created_at: v.number(), // Unix timestamp (ms)
  })
    .index("by_clerk_id", ["clerk_id"])
    .index("by_email", ["email"]),

  // ─── Friends ────────────────────────────────
  friends: defineTable({
    user_id: v.id("users"),
    name: v.string(),
    photo_storage_id: v.optional(v.string()), // Convex File Storage ID
    relationship_context: v.optional(v.string()), // e.g. "College roommate"
    cadence_days: v.number(), // 7 | 14 | 30 | 90
    preferred_channel: v.union(
      v.literal("call"),
      v.literal("text"),
      v.literal("voice"),
      v.literal("in_person")
    ),
    last_contact_at: v.optional(v.number()), // Unix ms
    important_dates: v.array(
      v.object({
        label: v.string(),
        date: v.string(), // ISO date string YYYY-MM-DD
      })
    ),
    archived_at: v.optional(v.number()), // Soft delete timestamp
    created_at: v.number(),
  })
    .index("by_user_id", ["user_id"])
    .index("by_user_and_archived", ["user_id", "archived_at"]),

  // ─── Interactions ───────────────────────────
  interactions: defineTable({
    user_id: v.id("users"),
    friend_id: v.id("friends"),
    type: v.union(
      v.literal("call"),
      v.literal("text"),
      v.literal("voice_note"),
      v.literal("in_person")
    ),
    timestamp: v.number(), // UTC Unix ms
    note_text: v.optional(v.string()),
    voice_storage_id: v.optional(v.string()), // Convex File Storage ID
    transcript: v.optional(v.string()), // AI-generated transcript
  })
    .index("by_friend_id", ["friend_id"])
    .index("by_user_id", ["user_id"])
    .index("by_user_and_friend", ["user_id", "friend_id"]),

  // ─── Moments ────────────────────────────────
  moments: defineTable({
    user_id: v.id("users"),
    friend_id: v.id("friends"),
    content: v.string(),
    created_at: v.number(),
  })
    .index("by_friend_id", ["friend_id"])
    .index("by_user_id", ["user_id"]),

  // ─── Daily Rankings ─────────────────────────
  daily_rankings: defineTable({
    user_id: v.id("users"),
    date: v.string(), // YYYY-MM-DD in user local time
    ranked_friend_id: v.id("friends"),
    overdue_score: v.number(), // Float: days_since / cadence_days
    reason: v.optional(v.string()), // Human-readable AI explanation
    context_snippet: v.optional(v.string()), // AI-generated snippet
    snoozed_until: v.optional(v.number()), // Unix ms — excludes from ranking until
  })
    .index("by_user_id", ["user_id"])
    .index("by_user_and_date", ["user_id", "date"])
    .index("by_user_and_snoozed", ["user_id", "snoozed_until"]),
});
