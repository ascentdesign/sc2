"use client";

import { useQuery } from "convex/react";
import { api } from "@stayclose/convex";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Clock,
  Zap,
  ChevronLeft,
  Activity,
  TrendingUp,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "../../../components/Skeleton";

// ──────────────────────────────────────────────
// Stats Card Component
// ──────────────────────────────────────────────

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  delay = 0,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "accent" | "amber" | "green" | "blue";
  delay?: number;
}) {
  const colorClasses = {
    accent: "bg-[var(--accent)]/10 text-[var(--accent)]",
    amber: "bg-amber-500/10 text-amber-500",
    green: "bg-green-500/10 text-green-500",
    blue: "bg-blue-500/10 text-blue-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--muted-foreground)]">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {subtitle}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Cadence Distribution Chart
// ──────────────────────────────────────────────

function CadenceDistribution({
  friends,
}: {
  friends: { cadence_days: number }[];
}) {
  const distribution = friends.reduce(
    (acc, friend) => {
      const days = friend.cadence_days;
      if (days <= 7) acc.weekly++;
      else if (days <= 14) acc.biweekly++;
      else if (days <= 30) acc.monthly++;
      else acc.quarterly++;
      return acc;
    },
    { weekly: 0, biweekly: 0, monthly: 0, quarterly: 0 }
  );

  const total = friends.length || 1;

  const categories = [
    { label: "Weekly", count: distribution.weekly, color: "#ef4444" },
    { label: "Bi-weekly", count: distribution.biweekly, color: "#f59e0b" },
    { label: "Monthly", count: distribution.monthly, color: "#3b82f6" },
    { label: "Quarterly", count: distribution.quarterly, color: "#10b981" },
  ];

  return (
    <div className="space-y-3">
      {categories.map((cat) => (
        <div key={cat.label}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--foreground)]">{cat.label}</span>
            <span className="text-[var(--muted-foreground)]">
              {cat.count} ({Math.round((cat.count / total) * 100)}%)
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(cat.count / total) * 100}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full rounded-full"
              style={{ backgroundColor: cat.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// Weekly Activity Chart
// ──────────────────────────────────────────────

function WeeklyActivity({
  interactions,
}: {
  interactions: { timestamp: number }[];
}) {
  // Get last 7 days
  const days: { day: string; count: number }[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const count = interactions.filter(
      (i) => i.timestamp >= dayStart && i.timestamp < dayEnd
    ).length;

    days.push({
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      count,
    });
  }

  const maxCount = Math.max(...days.map((d) => d.count), 1);

  return (
    <div className="flex items-end justify-between gap-2">
      {days.map((day, i) => (
        <div key={day.day} className="flex flex-col items-center gap-2">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(day.count / maxCount) * 80}px` }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="w-8 rounded-t-md bg-[var(--accent)]"
            style={{ minHeight: day.count > 0 ? "4px" : "0" }}
          />
          <span className="text-xs text-[var(--muted-foreground)]">
            {day.day}
          </span>
          {day.count > 0 && (
            <span className="text-xs font-medium">{day.count}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// Empty State
// ──────────────────────────────────────────────

function EmptyStats() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--background)] p-12 text-center"
    >
      <div className="mb-4 rounded-full bg-[var(--muted)] p-4">
        <BarChart3 className="h-8 w-8 text-[var(--muted-foreground)]" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">No stats yet</h3>
      <p className="max-w-xs text-sm text-[var(--muted-foreground)]">
        Add friends and log interactions to see your connection analytics here.
      </p>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Main Stats Page
// ──────────────────────────────────────────────

export default function StatsPage() {
  const friends = useQuery(api.friends.list);
  const interactions = useQuery(api.interactions.listByUser);
  const snoozeStats = useQuery(api.rankings.getSnoozeStats);

  const isLoading = friends === undefined || interactions === undefined;

  // Calculate stats
  const totalFriends = friends?.length ?? 0;
  const weeklyInteractions = interactions?.filter(
    (i) => i.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length ?? 0;
  const totalInteractions = interactions?.length ?? 0;

  return (
    <div className="mx-auto max-w-lg px-6 pt-6 pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard" className="text-[var(--muted-foreground)]">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Your Stats</h1>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : totalFriends === 0 ? (
        <EmptyStats />
      ) : (
        <div className="space-y-6">
          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Total Friends"
              value={totalFriends}
              subtitle="In your circle"
              icon={Users}
              color="accent"
              delay={0}
            />
            <StatCard
              title="This Week"
              value={weeklyInteractions}
              subtitle="Interactions"
              icon={Activity}
              color="green"
              delay={0.05}
            />
            <StatCard
              title="Total Logs"
              value={totalInteractions}
              subtitle="All time"
              icon={TrendingUp}
              color="blue"
              delay={0.1}
            />
            <StatCard
              title="Snoozed"
              value={snoozeStats?.currentlySnoozed ?? 0}
              subtitle="Right now"
              icon={Clock}
              color="amber"
              delay={0.15}
            />
          </div>

          {/* Weekly Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="font-semibold">Weekly Activity</h2>
            </div>
            {interactions.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                No interactions logged yet
              </p>
            ) : (
              <WeeklyActivity interactions={interactions} />
            )}
          </motion.div>

          {/* Cadence Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <Zap className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="font-semibold">Friend Distribution</h2>
            </div>
            {friends.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                No friends yet
              </p>
            ) : (
              <CadenceDistribution friends={friends} />
            )}
          </motion.div>

          {/* Snooze Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="font-semibold">Snooze Overview</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Currently snoozed</span>
                <span className="font-medium">
                  {snoozeStats?.currentlySnoozed ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total snoozes</span>
                <span className="font-medium">
                  {snoozeStats?.totalSnoozes ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Snooze rate</span>
                <span className="font-medium">
                  {snoozeStats && snoozeStats.totalRankings > 0
                    ? `${Math.round(
                        (snoozeStats.totalSnoozes / snoozeStats.totalRankings) * 100
                      )}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Monthly Streak (Placeholder for future) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--accent)]/5 to-transparent p-6"
          >
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-full bg-[var(--accent)]/10 p-2">
                <Zap className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div>
                <h2 className="font-semibold">Weekly Streak</h2>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Coming in Sprint 4
                </p>
              </div>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              Log at least one interaction each week to build your streak and
              earn badges.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
