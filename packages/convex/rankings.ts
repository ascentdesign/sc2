import { query, mutation, action, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { generateSnippet } from "@stayclose/ai";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** Compute overdue score for a friend */
function computeOverdueScore(
  lastContactAt: number | undefined,
  cadenceDays: number
): number {
  if (!lastContactAt) return 999; // Never contacted
  const daysSinceContact =
    (Date.now() - lastContactAt) / (1000 * 60 * 60 * 24);
  return daysSinceContact / cadenceDays;
}

/** Get today's date string in YYYY-MM-DD format for a given timezone */
function getTodayString(timezone: string): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: timezone });
}

// ──────────────────────────────────────────────
// Queries
// ──────────────────────────────────────────────

/** Returns today's ranked friend card for the current user */
export const getToday = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .first();
    if (!user) return null;

    const today = getTodayString(user.timezone);

    const ranking = await ctx.db
      .query("daily_rankings")
      .withIndex("by_user_and_date", (q) =>
        q.eq("user_id", user._id).eq("date", today)
      )
      .first();

    if (!ranking) return null;

    // If snoozed, return null (no card today)
    if (ranking.snoozed_until && ranking.snoozed_until > Date.now()) {
      return null;
    }

    // Fetch the friend details
    const friend = await ctx.db.get(ranking.ranked_friend_id);

    return {
      ...ranking,
      friend,
    };
  },
});

/** Returns snooze stats for the current user */
export const getSnoozeStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .first();
    if (!user) return null;

    const rankings = await ctx.db
      .query("daily_rankings")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .collect();

    const snoozedCount = rankings.filter(
      (r) => r.snoozed_until && r.snoozed_until > Date.now()
    ).length;

    const totalSnoozes = rankings.filter((r) => r.snoozed_until).length;

    return {
      currentlySnoozed: snoozedCount,
      totalSnoozes,
      totalRankings: rankings.length,
    };
  },
});

// ──────────────────────────────────────────────
// Mutations
// ──────────────────────────────────────────────

/** Snoozes today's ranking with preset options */
export const snooze = mutation({
  args: {
    ranking_id: v.id("daily_rankings"),
    snooze_until: v.union(
      v.literal("tomorrow"),
      v.literal("this_weekend"),
      v.literal("next_week")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const ranking = await ctx.db.get(args.ranking_id);
    if (!ranking) throw new Error("Ranking not found");

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerk_id", identity.subject))
      .first();
    if (!user || ranking.user_id !== user._id) throw new Error("Unauthorized");

    const now = Date.now();
    let snoozedUntil: number;

    switch (args.snooze_until) {
      case "tomorrow":
        snoozedUntil = now + 24 * 60 * 60 * 1000; // +1 day
        break;
      case "this_weekend": {
        const date = new Date(now);
        const dayOfWeek = date.getDay();
        const daysUntilSaturday = dayOfWeek === 6 ? 7 : 6 - dayOfWeek;
        snoozedUntil =
          now + daysUntilSaturday * 24 * 60 * 60 * 1000;
        break;
      }
      case "next_week":
        snoozedUntil = now + 7 * 24 * 60 * 60 * 1000; // +7 days
        break;
    }

    await ctx.db.patch(args.ranking_id, { snoozed_until: snoozedUntil });
    return args.ranking_id;
  },
});

// ──────────────────────────────────────────────
// Internal Queries (used by scheduled actions)
// ──────────────────────────────────────────────

/** Internal: get all users */
export const getAllUsers = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

/** Internal: get all non-archived friends for a user */
export const getFriendsForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const friends = await ctx.db
      .query("friends")
      .withIndex("by_user_id", (q) => q.eq("user_id", args.userId))
      .collect();

    return friends.filter((f) => f.archived_at === undefined);
  },
});

/** Internal: get a ranking for a specific user and date */
export const getRankingByDate = internalQuery({
  args: {
    userId: v.id("users"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("daily_rankings")
      .withIndex("by_user_and_date", (q) =>
        q.eq("user_id", args.userId).eq("date", args.date)
      )
      .first();
  },
});

/** Internal: count snoozes for a friend in the last 30 days */
export const getSnoozeCountForFriend = internalQuery({
  args: { friendId: v.id("friends"), since: v.number() },
  handler: async (ctx, args) => {
    const rankings = await ctx.db
      .query("daily_rankings")
      .withIndex("by_user_and_snoozed", (q) =>
        q.eq("user_id", args.friendId)
      )
      .collect();

    return rankings.filter(
      (r) => r.ranked_friend_id === args.friendId &&
             r.snoozed_until &&
             r.snoozed_until > args.since
    ).length;
  },
});

/** Internal: get recent moments for context snippet generation */
export const getRecentMoments = internalQuery({
  args: {
    friendId: v.id("friends"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const moments = await ctx.db
      .query("moments")
      .withIndex("by_friend_id", (q) => q.eq("friend_id", args.friendId))
      .order("desc")
      .take(args.limit ?? 5);

    return moments.map(m => m.content);
  },
});

// ──────────────────────────────────────────────
// Internal Mutations
// ──────────────────────────────────────────────

/** Internal: upsert a daily ranking record */
export const upsertDailyRanking = internalMutation({
  args: {
    user_id: v.id("users"),
    date: v.string(),
    ranked_friend_id: v.id("friends"),
    overdue_score: v.number(),
    reason: v.optional(v.string()),
    context_snippet: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if ranking already exists for this user+date
    const existing = await ctx.db
      .query("daily_rankings")
      .withIndex("by_user_and_date", (q) =>
        q.eq("user_id", args.user_id).eq("date", args.date)
      )
      .first();

    if (existing) {
      // Update existing ranking
      await ctx.db.patch(existing._id, {
        ranked_friend_id: args.ranked_friend_id,
        overdue_score: args.overdue_score,
        reason: args.reason,
        context_snippet: args.context_snippet,
        snoozed_until: undefined, // Reset snooze on new day
      });
      return existing._id;
    }

    // Create new ranking
    const id = await ctx.db.insert("daily_rankings", {
      user_id: args.user_id,
      date: args.date,
      ranked_friend_id: args.ranked_friend_id,
      overdue_score: args.overdue_score,
      reason: args.reason,
      context_snippet: args.context_snippet,
    });
    return id;
  },
});

/** Internal: update friend's recommended cadence */
export const updateFriendCadence = internalMutation({
  args: {
    friendId: v.id("friends"),
    cadence_days: v.number(),
    reasoning: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const friend = await ctx.db.get(args.friendId);
    if (!friend) return;

    await ctx.db.patch(args.friendId, {
      cadence_days: args.cadence_days,
      // Could store reasoning in a new field if desired
    });
  },
});

// ──────────────────────────────────────────────
// Actions (can call external APIs)
// ──────────────────────────────────────────────

/** Scheduled action: computes daily rankings for all users.
 *  Runs as a cron job at 06:00 UTC.
 *  For Phase 1, uses rule-based scoring (no AI yet for ranking itself).
 */
export const computeDaily = action({
  args: {},
  handler: async (ctx): Promise<void> => {
    const users = await ctx.runQuery(internal.rankings.getAllUsers, {});

    for (const user of users) {
      const today = getTodayString(user.timezone);

      // Check if it's approximately 6 AM in the user's timezone
      const userTime = new Date().toLocaleString("en-US", {
        timeZone: user.timezone,
      });
      const userHour = new Date(userTime).getHours();

      // Only process users whose local time is ~6 AM
      // The cron runs hourly; we skip users where it's not morning
      if (userHour < 5 || userHour > 7) continue;

      // Fetch all non-archived friends for this user
      const friends = await ctx.runQuery(internal.rankings.getFriendsForUser, {
        userId: user._id,
      });

      if (friends.length === 0) continue;

      // Compute overdue scores
      const ranked = friends
        .map((friend) => ({
          friend,
          overdueScore: computeOverdueScore(
            friend.last_contact_at,
            friend.cadence_days
          ),
        }))
        // Filter out snoozed friends
        .filter((entry) => {
          if (!entry.friend.last_contact_at) return true; // Never contacted = always eligible
          return true; // Snooze filtering done on ranking level, not friend level
        })
        .sort((a, b) => b.overdueScore - a.overdueScore);

      // Select top candidate
      const topCandidate = ranked[0];
      if (!topCandidate) continue;

      // Check if this friend was shown yesterday (avoid repeats)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString("en-CA", {
        timeZone: user.timezone,
      });

      const yesterdayRanking = await ctx.runQuery(
        internal.rankings.getRankingByDate,
        {
          userId: user._id,
          date: yesterdayStr,
        }
      );

      let selectedCandidate = topCandidate;
      if (
        yesterdayRanking &&
        yesterdayRanking.ranked_friend_id === topCandidate.friend._id &&
        ranked.length > 1
      ) {
        // Pick the second-highest instead
        selectedCandidate = ranked[1];
      }

      // Generate reason (rule-based for now)
      const reason = generateRuleBasedReason(selectedCandidate);

      // Generate AI context snippet from recent moments
      let contextSnippet: string | undefined;
      try {
        const moments = await ctx.runQuery(internal.rankings.getRecentMoments, {
          friendId: selectedCandidate.friend._id,
          limit: 5,
        });

        if (moments.length > 0) {
          const result = await generateSnippet({
            friendName: selectedCandidate.friend.name,
            moments,
          });
          contextSnippet = result.snippet;
        }
      } catch (error) {
        // Log error but don't fail the ranking generation
        console.error(`Failed to generate context snippet for friend ${selectedCandidate.friend._id}:`, error);
      }

      await ctx.runMutation(internal.rankings.upsertDailyRanking, {
        user_id: user._id,
        date: today,
        ranked_friend_id: selectedCandidate.friend._id,
        overdue_score: selectedCandidate.overdueScore,
        reason,
        context_snippet: contextSnippet,
      });
    }
  },
});

/** Scheduled action: analyzes interaction patterns weekly and updates cadence recommendations.
 *  Runs weekly on Sundays.
 */
export const analyzeCadenceWeekly = action({
  args: {},
  handler: async (ctx): Promise<void> => {
    const users = await ctx.runQuery(internal.rankings.getAllUsers, {});

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    for (const user of users) {
      // Only run on Sundays (day 0)
      const userDate = new Date().toLocaleString("en-US", {
        timeZone: user.timezone,
      });
      const userDayOfWeek = new Date(userDate).getDay();
      if (userDayOfWeek !== 0) continue;

      // Fetch all non-archived friends for this user
      const friends = await ctx.runQuery(internal.rankings.getFriendsForUser, {
        userId: user._id,
      });

      for (const friend of friends) {
        // Get interactions for this friend
        const interactions = await ctx.runQuery(
          internal.interactions.listByFriendForAnalysisInternal,
          { friendId: friend._id }
        );

        // Get snooze count in last 30 days
        const snoozeCount = await ctx.runQuery(
          internal.rankings.getSnoozeCountForFriend,
          { friendId: friend._id, since: thirtyDaysAgo }
        );

        if (interactions.length === 0) continue; // Skip friends with no interactions

        // Calculate days tracked (since first interaction or friend creation)
        const firstInteraction = interactions[interactions.length - 1]?.timestamp;
        const daysTracked = firstInteraction
          ? Math.floor((Date.now() - firstInteraction) / (1000 * 60 * 60 * 24))
          : 30;

        // Call AI to analyze cadence
        try {
          const { analyzeCadence } = await import("@stayclose/ai");
          const result = await analyzeCadence({
            friendName: friend.name,
            currentCadence: friend.cadence_days,
            interactions,
            snoozeCount,
            daysTracked: Math.max(daysTracked, 7),
          });

          // Only update if the recommendation is significantly different (>20% change)
          const changeRatio = Math.abs(result.recommended_cadence_days - friend.cadence_days) / friend.cadence_days;
          if (changeRatio > 0.2) {
            await ctx.runMutation(internal.rankings.updateFriendCadence, {
              friendId: friend._id,
              cadence_days: result.recommended_cadence_days,
              reasoning: result.reasoning,
            });
          }
        } catch (error) {
          console.error(`Failed to analyze cadence for friend ${friend._id}:`, error);
          // Continue with next friend
        }
      }
    }
  },
});

// ──────────────────────────────────────────────
// Rule-based reason generation (Sprint 1–2)
// Replaced by AI in Sprint 3
// ──────────────────────────────────────────────

function generateRuleBasedReason(candidate: {
  friend: { name: string; cadence_days: number; last_contact_at?: number };
  overdueScore: number;
}): string {
  const { friend, overdueScore } = candidate;

  if (!friend.last_contact_at) {
    return `You haven't reached out to ${friend.name} yet.`;
  }

  const daysSince = Math.floor(
    (Date.now() - friend.last_contact_at) / (1000 * 60 * 60 * 24)
  );

  if (overdueScore > 2) {
    return `It's been ${daysSince} days since you talked to ${friend.name}.`;
  }
  if (overdueScore > 1.2) {
    return `You usually talk to ${friend.name} every ${friend.cadence_days} days — it's been ${daysSince}.`;
  }
  return `Right on schedule — ${friend.name} could use a check-in.`;
}
