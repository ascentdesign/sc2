"use client";

import { useQuery } from "convex/react";
import { api } from "@stayclose/convex";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { getStatusLabel, STATUS_LABEL_DISPLAY, STATUS_LABEL_COLOR } from "@stayclose/types";

export default function CirclePage() {
  const friends = useQuery(api.friends.list);
  const [searchQuery, setSearchQuery] = useState("");

  // Client-side search filter
  const filteredFriends = friends?.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-lg px-6 pt-12">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Circle</h1>
        <Link
          href="/friends/new"
          className="flex items-center gap-1 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your circle..."
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] py-3 pl-10 pr-4 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
      </div>

      {/* Loading state */}
      {filteredFriends === undefined && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      )}

      {/* Empty state */}
      {filteredFriends !== undefined && filteredFriends.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 text-center"
        >
          <div className="mb-4 text-5xl">🤝</div>
          <h2 className="mb-2 text-lg font-semibold">No friends yet</h2>
          <p className="mb-6 text-sm text-[var(--muted-foreground)]">
            Add your first friend to start staying close.
          </p>
          <Link
            href="/friends/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Add a friend
          </Link>
        </motion.div>
      )}

      {/* Friend list */}
      {filteredFriends && filteredFriends.length > 0 && (
        <div className="space-y-2">
          {filteredFriends.map((friend, index) => {
            const statusLabel = getStatusLabel(friend.overdueScore);
            const dotColor =
              STATUS_LABEL_COLOR[statusLabel] === "gray"
                ? "var(--gray)"
                : STATUS_LABEL_COLOR[statusLabel] === "amber"
                ? "var(--amber)"
                : "var(--red)";

            return (
              <motion.div
                key={friend._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/circle/${friend._id}`}
                  className="flex items-center gap-4 rounded-xl border border-[var(--border)] p-4 transition-colors hover:bg-[var(--muted)]"
                >
                  {/* Avatar */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-lg font-semibold">
                    {friend.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{friend.name}</div>
                    {friend.relationship_context && (
                      <div className="truncate text-sm text-[var(--muted-foreground)]">
                        {friend.relationship_context}
                      </div>
                    )}
                  </div>

                  {/* Status dot */}
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: dotColor }}
                    title={STATUS_LABEL_DISPLAY[statusLabel]}
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
