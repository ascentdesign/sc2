import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ──────────────────────────────────────────────
// Queries
// ──────────────────────────────────────────────

/** Returns all moments for a specific friend, sorted by created_at descending */
export const listByFriend = query({
  args: { friendId: v.id("friends") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const moments = await ctx.db
      .query("moments")
      .withIndex("by_friend_id", (q) => q.eq("friend_id", args.friendId))
      .order("desc")
      .collect();

    return moments;
  },
});

/** Returns the last N moments for a friend — used by AI for context snippet generation */
export const recentByFriend = query({
  args: {
    friendId: v.id("friends"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;

    const moments = await ctx.db
      .query("moments")
      .withIndex("by_friend_id", (q) => q.eq("friend_id", args.friendId))
      .order("desc")
      .take(limit);

    return moments;
  },
});

// ──────────────────────────────────────────────
// Mutations
// ──────────────────────────────────────────────

/** Creates a new moment note for a friend */
export const create = mutation({
  args: {
    friend_id: v.id("friends"),
    content: v.string(),
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

    const momentId = await ctx.db.insert("moments", {
      user_id: user._id,
      friend_id: args.friend_id,
      content: args.content,
      created_at: Date.now(),
    });

    return momentId;
  },
});
