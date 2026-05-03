"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@stayclose/convex";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Calendar,
  User,
  MessageSquare,
  Clock,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";
import type { PreferredChannel } from "@stayclose/types";
import { PageSkeleton } from "../../../../components/Skeleton";

// ──────────────────────────────────────────────
// Channel Options
// ──────────────────────────────────────────────

const channelOptions: { value: PreferredChannel; label: string; emoji: string }[] = [
  { value: "call", label: "Phone call", emoji: "📞" },
  { value: "text", label: "Text message", emoji: "💬" },
  { value: "voice", label: "Voice note", emoji: "🎙️" },
  { value: "in_person", label: "In person", emoji: "🤝" },
];

const cadenceOptions = [
  { value: 7, label: "Stay close", description: "Every week" },
  { value: 14, label: "Regular", description: "Every 2 weeks" },
  { value: 30, label: "Catch up", description: "Every month" },
  { value: 90, label: "Now & then", description: "Every quarter" },
];

// ──────────────────────────────────────────────
// Import Date Form
// ──────────────────────────────────────────────

function ImportantDateInput({
  label,
  date,
  onLabelChange,
  onDateChange,
  onRemove,
}: {
  label: string;
  date: string;
  onLabelChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={label}
        onChange={(e) => onLabelChange(e.target.value)}
        placeholder="e.g. Birthday"
        className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        className="w-32 rounded-xl border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />
      <button
        type="button"
        onClick={onRemove}
        className="rounded-xl p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-red-500"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Error Boundary
// ──────────────────────────────────────────────

function ErrorState({ error }: { error: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg px-6 py-20 text-center"
    >
      <div className="mb-4 text-5xl">😕</div>
      <h2 className="mb-2 text-lg font-semibold">Something went wrong</h2>
      <p className="mb-6 text-sm text-[var(--muted-foreground)]">{error}</p>
      <Link
        href="/circle"
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white"
      >
        Back to Circle
      </Link>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Main Settings Page
// ──────────────────────────────────────────────

export default function FriendSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const friendId = params.friendId as string;

  const friend = useQuery(api.friends.get, { friendId: friendId as any });
  const updateFriend = useMutation(api.friends.update);

  // Form state
  const [name, setName] = useState("");
  const [relationshipContext, setRelationshipContext] = useState("");
  const [cadenceDays, setCadenceDays] = useState(14);
  const [preferredChannel, setPreferredChannel] = useState<PreferredChannel>("text");
  const [importantDates, setImportantDates] = useState<{ label: string; date: string }[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form when friend data loads
  useEffect(() => {
    if (friend) {
      setName(friend.name);
      setRelationshipContext(friend.relationship_context || "");
      setCadenceDays(friend.cadence_days);
      setPreferredChannel(friend.preferred_channel);
      setImportantDates(friend.important_dates || []);
    }
  }, [friend]);

  // Track changes
  useEffect(() => {
    if (!friend) return;
    const changed =
      name !== friend.name ||
      relationshipContext !== (friend.relationship_context || "") ||
      cadenceDays !== friend.cadence_days ||
      preferredChannel !== friend.preferred_channel ||
      JSON.stringify(importantDates) !== JSON.stringify(friend.important_dates || []);
    setHasChanges(changed);
  }, [name, relationshipContext, cadenceDays, preferredChannel, importantDates, friend]);

  const handleAddDate = () => {
    setImportantDates([...importantDates, { label: "", date: "" }]);
  };

  const handleUpdateDate = (index: number, field: "label" | "date", value: string) => {
    const updated = [...importantDates];
    updated[index] = { ...updated[index], [field]: value };
    setImportantDates(updated);
  };

  const handleRemoveDate = (index: number) => {
    const updated = importantDates.filter((_, i) => i !== index);
    setImportantDates(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      await updateFriend({
        friendId: friendId as any,
        name: name.trim(),
        relationship_context: relationshipContext.trim() || undefined,
        cadence_days: cadenceDays,
        preferred_channel: preferredChannel,
        important_dates: importantDates.filter((d) => d.label && d.date),
      });

      router.push(`/circle/${friendId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
      setIsSaving(false);
    }
  };

  // Loading state
  if (friend === undefined) {
    return <PageSkeleton variant="form" />;
  }

  // Friend not found
  if (!friend) {
    return <ErrorState error="Friend not found. They may have been deleted or archived." />;
  }

  return (
    <div className="mx-auto max-w-lg px-6 pt-6 pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/circle/${friendId}`} className="text-[var(--muted-foreground)]">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Edit {friend.name}</h1>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="space-y-4"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <User className="h-5 w-5 text-[var(--accent)]" />
            Basic Info
          </h2>

          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Their name"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </div>

          {/* Relationship Context */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              How do you know them?
            </label>
            <input
              type="text"
              value={relationshipContext}
              onChange={(e) => setRelationshipContext(e.target.value)}
              placeholder='e.g. "College roommate", "Work friend"'
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
        </motion.div>

        {/* Contact Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="h-5 w-5 text-[var(--accent)]" />
            Contact Preferences
          </h2>

          {/* Cadence */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              How close do you want to stay?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {cadenceOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCadenceDays(option.value)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    cadenceDays === option.value
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]"
                      : "border-[var(--border)] hover:bg-[var(--muted)]"
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Channel */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Best way to reach out
            </label>
            <div className="grid grid-cols-2 gap-2">
              {channelOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPreferredChannel(option.value)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    preferredChannel === option.value
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]"
                      : "border-[var(--border)] hover:bg-[var(--muted)]"
                  }`}
                >
                  <span className="text-lg">{option.emoji}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Important Dates Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="h-5 w-5 text-[var(--accent)]" />
              Important Dates
            </h2>
            <button
              type="button"
              onClick={handleAddDate}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-[var(--accent)] hover:bg-[var(--accent)]/10"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          <div className="space-y-2">
            {importantDates.map((date, index) => (
              <ImportantDateInput
                key={index}
                label={date.label}
                date={date.date}
                onLabelChange={(value) => handleUpdateDate(index, "label", value)}
                onDateChange={(value) => handleUpdateDate(index, "date", value)}
                onRemove={() => handleRemoveDate(index)}
              />
            ))}
            {importantDates.length === 0 && (
              <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">
                No important dates set. Add birthdays, anniversaries, etc.
              </p>
            )}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 pt-4"
        >
          <button
            type="submit"
            disabled={!name.trim() || isSaving || !hasChanges}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-4 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : hasChanges ? "Save Changes" : "No Changes"}
          </button>

          <Link
            href={`/circle/${friendId}`}
            className="flex w-full items-center justify-center rounded-xl border border-[var(--border)] px-4 py-4 text-sm font-medium transition-colors hover:bg-[var(--muted)]"
          >
            Cancel
          </Link>
        </motion.div>

        {/* Current Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 p-4"
        >
          <h3 className="mb-2 text-sm font-medium">Current Status</h3>
          <div className="space-y-1 text-sm text-[var(--muted-foreground)]">
            <div className="flex justify-between">
              <span>Last contact:</span>
              <span className="font-medium text-[var(--foreground)]">
                {friend.last_contact_at
                  ? new Date(friend.last_contact_at).toLocaleDateString()
                  : "Never"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Added:</span>
              <span className="font-medium text-[var(--foreground)]">
                {new Date(friend.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </motion.div>
      </form>
    </div>
  );
}
