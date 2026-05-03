import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ──────────────────────────────────────────────
// Queries
// ──────────────────────────────────────────────

/** Returns all non-archived friends for the authenticated user, sorted by overdue score descending */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    const friends = await ctx.db
      .query("friends")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .collect();

    // Filter out archived friends
    const activeFriends = friends.filter((f) => f.archived_at === undefined);

    // Compute overdue score for each friend
    const now = Date.now();
    const withScores = activeFriends.map((friend) => {
      const daysSinceContact = friend.last_contact_at
        ? (now - friend.last_contact_at) / (1000 * 60 * 60 * 24)
        : 999; // Never contacted = very high overdue
      const overdueScore = daysSinceContact / friend.cadence_days;
      return { ...friend, overdueScore };
    });

    // Sort by overdue score descending (highest need first)
    withScores.sort((a, b) => b.overdueScore - a.overdueScore);

    return withScores;
  },
});

/** Returns a single friend by ID */
export const get = query({
  args: { friendId: v.id("friends") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const friend = await ctx.db.get(args.friendId);
    if (!friend) throw new Error("Friend not found");

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .first();
    if (!user || friend.user_id !== user._id) throw new Error("Unauthorized");

    return friend;
  },
});

// ──────────────────────────────────────────────
// Mutations
// ──────────────────────────────────────────────

/** Creates a new friend record */
export const create = mutation({
  args: {
    name: v.string(),
    relationship_context: v.optional(v.string()),
    cadence_days: v.number(), // 7 | 14 | 30 | 90
    preferred_channel: v.union(
      v.literal("call"),
      v.literal("text"),
      v.literal("voice"),
      v.literal("in_person")
    ),
    photo_storage_id: v.optional(v.string()),
    important_dates: v.array(
      v.object({
        label: v.string(),
        date: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    const friendId = await ctx.db.insert("friends", {
      user_id: user._id,
      name: args.name,
      photo_storage_id: args.photo_storage_id,
      relationship_context: args.relationship_context,
      cadence_days: args.cadence_days,
      preferred_channel: args.preferred_channel,
      important_dates: args.important_dates,
      created_at: Date.now(),
    });

    return friendId;
  },
});

/** Updates any friend field */
export const update = mutation({
  args: {
    friendId: v.id("friends"),
    name: v.optional(v.string()),
    photo_storage_id: v.optional(v.string()),
    relationship_context: v.optional(v.string()),
    cadence_days: v.optional(v.number()),
    preferred_channel: v.optional(
      v.union(
        v.literal("call"),
        v.literal("text"),
        v.literal("voice"),
        v.literal("in_person")
      )
    ),
    important_dates: v.optional(
      v.array(
        v.object({
          label: v.string(),
          date: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const friend = await ctx.db.get(args.friendId);
    if (!friend) throw new Error("Friend not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .first();
    if (!user || friend.user_id !== user._id) throw new Error("Unauthorized");

    const { friendId, ...updates } = args;
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(args.friendId, cleanUpdates);
    return args.friendId;
  },
});

/** Soft-deletes a friend by setting archived_at */
export const archive = mutation({
  args: { friendId: v.id("friends") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const friend = await ctx.db.get(args.friendId);
    if (!friend) throw new Error("Friend not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .first();
    if (!user || friend.user_id !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.friendId, { archived_at: Date.now() });
    return args.friendId;
  },
});

/** Generates a presigned upload URL for friend photos */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    return await ctx.storage.generateUploadUrl();
  },
});
