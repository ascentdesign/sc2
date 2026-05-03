import { query, mutation, action, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// ──────────────────────────────────────────────
// Queries
// ──────────────────────────────────────────────

/** Returns paginated interactions for a specific friend, sorted by timestamp descending */
export const listByFriend = query({
  args: {
    friendId: v.id("friends"),
    paginationOpts: v.optional(
      v.object({
        numItems: v.number(),
        cursor: v.union(v.string(), v.null()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const interactions = await ctx.db
      .query("interactions")
      .withIndex("by_friend_id", (q) => q.eq("friend_id", args.friendId))
      .order("desc")
      .collect();

    return interactions;
  },
});

/** Returns all interactions for the authenticated user */
export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    const interactions = await ctx.db
      .query("interactions")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .order("desc")
      .collect();

    return interactions;
  },
});

/** Returns interactions for a specific friend (for cadence analysis) */
export const listByFriendForAnalysis = query({
  args: { friendId: v.id("friends") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const interactions = await ctx.db
      .query("interactions")
      .withIndex("by_friend_id", (q) => q.eq("friend_id", args.friendId))
      .order("desc")
      .take(100);

    return interactions.map((i) => ({
      type: i.type,
      timestamp: i.timestamp,
    }));
  },
});

// ──────────────────────────────────────────────
// Mutations
// ──────────────────────────────────────────────

/** Logs a completed interaction and updates the friend's last_contact_at */
export const create = mutation({
  args: {
    friend_id: v.id("friends"),
    type: v.union(
      v.literal("call"),
      v.literal("text"),
      v.literal("voice_note"),
      v.literal("in_person")
    ),
    note_text: v.optional(v.string()),
    voice_storage_id: v.optional(v.string()),
    transcript: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    const friend = await ctx.db.get(args.friend_id);
    if (!friend) throw new Error("Friend not found");
    if (friend.user_id !== user._id) throw new Error("Unauthorized");

    const now = Date.now();

    const interactionId = await ctx.db.insert("interactions", {
      user_id: user._id,
      friend_id: args.friend_id,
      type: args.type,
      timestamp: now,
      note_text: args.note_text,
      voice_storage_id: args.voice_storage_id,
      transcript: args.transcript,
    });

    // Update the friend's last_contact_at
    await ctx.db.patch(args.friend_id, { last_contact_at: now });

    return interactionId;
  },
});

/** Generates a presigned upload URL for voice notes */
export const generateVoiceUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

/** Updates an interaction with a transcript */
export const addTranscript = mutation({
  args: {
    interactionId: v.id("interactions"),
    transcript: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const interaction = await ctx.db.get(args.interactionId);
    if (!interaction) throw new Error("Interaction not found");

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .first();
    if (!user || interaction.user_id !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.interactionId, { transcript: args.transcript });
    return args.interactionId;
  },
});

// ──────────────────────────────────────────────
// Internal Queries
// ──────────────────────────────────────────────

/** Internal: Returns interactions for a specific friend (for cadence analysis) */
export const listByFriendForAnalysisInternal = internalQuery({
  args: { friendId: v.id("friends") },
  handler: async (ctx, args) => {
    const interactions = await ctx.db
      .query("interactions")
      .withIndex("by_friend_id", (q) => q.eq("friend_id", args.friendId))
      .order("desc")
      .take(100);

    return interactions.map((i) => ({
      type: i.type,
      timestamp: i.timestamp,
    }));
  },
});

// ──────────────────────────────────────────────
// Actions (can call external APIs)
// ──────────────────────────────────────────────

/** Transcribes a voice note using OpenAI Whisper */
export const transcribeVoice = action({
  args: {
    audioBase64: v.string(),
    mediaType: v.string(),
  },
  handler: async (ctx, args) => {
    // Import the AI package dynamically to avoid issues in edge runtime
    const { transcribeVoice: transcribeFn } = await import("@stayclose/ai");

    const result = await transcribeFn({
      audioBase64: args.audioBase64,
      mediaType: args.mediaType as any,
    });

    return { transcript: result.transcript };
  },
});
