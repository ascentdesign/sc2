"use client";

import { useMutation } from "convex/react";
import { api } from "@stayclose/convex";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera } from "lucide-react";
import Link from "next/link";
import { VIBE_CADENCE_MAP } from "@stayclose/types";
import type { VibePreset, PreferredChannel } from "@stayclose/types";

const vibeOptions: { value: VibePreset; label: string; description: string; emoji: string }[] = [
  { value: "stay_close", label: "Stay close", description: "Every week", emoji: "🔥" },
  { value: "regular", label: "Regular", description: "Every 2 weeks", emoji: "👋" },
  { value: "catch_up", label: "Catch up", description: "Every month", emoji: "☕" },
  { value: "now_and_then", label: "Now & then", description: "Every quarter", emoji: "🤗" },
];

const channelOptions: { value: PreferredChannel; label: string; emoji: string }[] = [
  { value: "call", label: "Phone call", emoji: "📞" },
  { value: "text", label: "Text", emoji: "💬" },
  { value: "voice", label: "Voice note", emoji: "🎙️" },
  { value: "in_person", label: "In person", emoji: "🤝" },
];

export default function AddFriendPage() {
  const router = useRouter();
  const createFriend = useMutation(api.friends.create);
  const generateUploadUrl = useMutation(api.friends.generateUploadUrl);

  const [name, setName] = useState("");
  const [relationshipContext, setRelationshipContext] = useState("");
  const [vibe, setVibe] = useState<VibePreset>("regular");
  const [channel, setChannel] = useState<PreferredChannel>("text");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    try {
      await createFriend({
        name: name.trim(),
        relationship_context: relationshipContext.trim() || undefined,
        cadence_days: VIBE_CADENCE_MAP[vibe],
        preferred_channel: channel,
        important_dates: [],
      });

      router.push("/circle");
    } catch (error) {
      console.error("Failed to create friend:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-6 pt-6 pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href="/circle" className="text-[var(--muted-foreground)]">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Add a friend</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo + Name */}
        <div className="flex items-start gap-4">
          <button
            type="button"
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[var(--border)] bg-[var(--muted)] transition-colors hover:border-[var(--accent)]"
          >
            <Camera className="h-6 w-6 text-[var(--muted-foreground)]" />
          </button>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Their name"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
              autoFocus
            />
          </div>
        </div>

        {/* Relationship context */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            How do you know them?
          </label>
          <input
            type="text"
            value={relationshipContext}
            onChange={(e) => setRelationshipContext(e.target.value)}
            placeholder='e.g. "College roommate", "Work friend"'
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        {/* Vibe selector */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            How close do you want to stay?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {vibeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setVibe(option.value)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  vibe === option.value
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)] hover:bg-[var(--muted)]"
                }`}
              >
                <div className="mb-1 text-2xl">{option.emoji}</div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preferred channel */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Best way to reach out
          </label>
          <div className="grid grid-cols-2 gap-2">
            {channelOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setChannel(option.value)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  channel === option.value
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)] hover:bg-[var(--muted)]"
                }`}
              >
                <span className="text-lg">{option.emoji}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!name.trim() || isSubmitting}
          className="w-full rounded-xl bg-[var(--accent)] py-4 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Adding..." : "Add to Circle"}
        </button>
      </form>
    </div>
  );
}
