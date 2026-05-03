import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// ──────────────────────────────────────────────
// Queries
// ──────────────────────────────────────────────

/** Returns the current authenticated user's profile */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .first();

    return user;
  },
});

// ──────────────────────────────────────────────
// Mutations
// ──────────────────────────────────────────────

/** Syncs/creates a user record from Clerk auth data.
 *  Called on first sign-in or when Clerk webhook fires.
 */
export const syncFromClerk = internalMutation({
  args: {
    clerk_id: v.string(),
    name: v.string(),
    email: v.string(),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", args.clerk_id))
      .first();

    if (existing) {
      // Update existing user
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        timezone: args.timezone ?? existing.timezone,
      });
      return existing._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerk_id: args.clerk_id,
      name: args.name,
      email: args.email,
      timezone: args.timezone ?? "America/New_York",
      created_at: Date.now(),
    });

    return userId;
  },
});

/** GDPR: Deletes all data for a user.
 *  Called when user requests account deletion via Clerk.
 */
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    // Delete all friends (and their related data)
    const friends = await ctx.db
      .query("friends")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .collect();

    for (const friend of friends) {
      // Delete interactions for this friend
      const interactions = await ctx.db
        .query("interactions")
        .withIndex("by_friend_id", (q) => q.eq("friend_id", friend._id))
        .collect();
      for (const interaction of interactions) {
        await ctx.db.delete(interaction._id);
      }

      // Delete moments for this friend
      const moments = await ctx.db
        .query("moments")
        .withIndex("by_friend_id", (q) => q.eq("friend_id", friend._id))
        .collect();
      for (const moment of moments) {
        await ctx.db.delete(moment._id);
      }

      // Delete the friend
      await ctx.db.delete(friend._id);
    }

    // Delete daily rankings
    const rankings = await ctx.db
      .query("daily_rankings")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .collect();
    for (const ranking of rankings) {
      await ctx.db.delete(ranking._id);
    }

    // Delete user interactions (those not covered by friend deletion)
    const userInteractions = await ctx.db
      .query("interactions")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .collect();
    for (const interaction of userInteractions) {
      await ctx.db.delete(interaction._id);
    }

    // Delete user moments
    const userMoments = await ctx.db
      .query("moments")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .collect();
    for (const moment of userMoments) {
      await ctx.db.delete(moment._id);
    }

    // Finally, delete the user record
    await ctx.db.delete(user._id);

    return { success: true };
  },
});
