"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@stayclose/convex";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Archive, ChevronDown } from "lucide-react";
import Link from "next/link";

// ──────────────────────────────────────────────
// Timeline Item Component
// ──────────────────────────────────────────────

function TimelineItem({
  type,
  content,
  timestamp,
}: {
  type: string;
  content: string;
  timestamp: number;
}) {
  const icons: Record<string, string> = {
    call: "📞",
    text: "💬",
    voice_note: "🎙️",
    in_person: "🤝",
    moment: "💭",
  };

  const date = new Date(timestamp);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="flex gap-4 py-3">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--muted)] text-lg">
          {icons[type] || "📝"}
        </div>
        <div className="mt-1 h-full w-px bg-[var(--border)]" />
      </div>
      <div className="flex-1 pb-4">
        <div className="text-sm text-[var(--muted-foreground)]">
          {dateStr} · {timeStr}
        </div>
        <p className="mt-1 text-sm">{content}</p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Settings Accordion Component
// ──────────────────────────────────────────────

function SettingsAccordion({ friend }: { friend: any }) {
  const [isOpen, setIsOpen] = useState(false);

  const channelLabels: Record<string, string> = {
    call: "Phone call",
    text: "Text message",
    voice: "Voice note",
    in_person: "In person",
  };

  const cadenceLabels: Record<number, string> = {
    7: "Stay close (weekly)",
    14: "Regular (biweekly)",
    30: "Catch up (monthly)",
    90: "Now & then (quarterly)",
  };

  return (
    <div className="rounded-xl border border-[var(--border)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <span className="font-medium">Settings</span>
        <ChevronDown
          className={`h-4 w-4 text-[var(--muted-foreground)] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="border-t border-[var(--border)] p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">Vibe</span>
            <span>{cadenceLabels[friend.cadence_days] || `${friend.cadence_days} days`}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">Preferred channel</span>
            <span>{channelLabels[friend.preferred_channel] || friend.preferred_channel}</span>
          </div>
          {friend.important_dates && friend.important_dates.length > 0 && (
            <div className="pt-2">
              <div className="mb-2 text-sm text-[var(--muted-foreground)]">Important dates</div>
              {friend.important_dates.map((d: { label: string; date: string }, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{d.label}</span>
                  <span className="text-[var(--muted-foreground)]">{d.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Friend Detail Page
// ──────────────────────────────────────────────

export default function FriendDetailPage() {
  const params = useParams();
  const router = useRouter();
  const friendId = params.friendId as string;

  const friend = useQuery(api.friends.get, { friendId: friendId as any });
  const interactions = useQuery(api.interactions.listByFriend, {
    friendId: friendId as any,
  });
  const moments = useQuery(api.moments.listByFriend, {
    friendId: friendId as any,
  });

  const createMoment = useMutation(api.moments.create);
  const archiveFriend = useMutation(api.friends.archive);

  const [momentText, setMomentText] = useState("");
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const handleAddMoment = async () => {
    if (!momentText.trim()) return;
    await createMoment({
      friend_id: friendId as any,
      content: momentText.trim(),
    });
    setMomentText("");
  };

  const handleArchive = async () => {
    await archiveFriend({ friendId: friendId as any });
    router.push("/circle");
  };

  // Loading
  if (friend === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (!friend) {
    return (
      <div className="mx-auto max-w-lg px-6 pt-12 text-center">
        <h1 className="text-xl font-semibold">Friend not found</h1>
        <Link href="/circle" className="mt-4 inline-block text-[var(--accent)]">
          Back to Circle
        </Link>
      </div>
    );
  }

  // Merge interactions and moments into timeline
  const timelineItems = [
    ...(interactions || []).map((i) => ({
      type: i.type,
      content: i.note_text || i.transcript || `${i.type} interaction`,
      timestamp: i.timestamp,
    })),
    ...(moments || []).map((m) => ({
      type: "moment",
      content: m.content,
      timestamp: m.created_at,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="mx-auto max-w-lg px-6 pt-6 pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href="/circle" className="text-[var(--muted-foreground)]">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">{friend.name}</h1>
      </div>

      {/* Friend info card */}
      <div className="mb-6 flex items-center gap-4 rounded-xl border border-[var(--border)] p-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)] text-xl font-semibold">
          {friend.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-bold">{friend.name}</h2>
          {friend.relationship_context && (
            <p className="text-sm text-[var(--muted-foreground)]">
              {friend.relationship_context}
            </p>
          )}
          {friend.last_contact_at && (
            <p className="text-xs text-[var(--muted-foreground)]">
              Last contact:{" "}
              {new Date(friend.last_contact_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Add moment */}
      <div className="mb-6">
        <h3 className="mb-2 text-sm font-medium text-[var(--muted-foreground)]">
          + Add something
        </h3>
        <div className="flex gap-2">
          <textarea
            value={momentText}
            onChange={(e) => setMomentText(e.target.value)}
            placeholder="Note something about this friend..."
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            rows={2}
          />
          <button
            onClick={handleAddMoment}
            disabled={!momentText.trim()}
            className="self-end rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-6">
        <h3 className="mb-4 text-sm font-medium text-[var(--muted-foreground)]">
          Timeline
        </h3>
        {timelineItems.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
            No interactions or moments yet
          </p>
        ) : (
          timelineItems.map((item, i) => (
            <TimelineItem
              key={i}
              type={item.type}
              content={item.content}
              timestamp={item.timestamp}
            />
          ))
        )}
      </div>

      {/* Settings */}
      <div className="mb-6">
        <SettingsAccordion friend={friend} />
      </div>

      {/* Archive */}
      <div className="mb-6">
        {!showArchiveConfirm ? (
          <button
            onClick={() => setShowArchiveConfirm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]"
          >
            <Archive className="h-4 w-4" />
            Archive friend
          </button>
        ) : (
          <div className="rounded-xl border border-[var(--red)]/30 bg-[var(--red)]/5 p-4">
            <p className="mb-3 text-sm">
              Are you sure? This will hide {friend.name} from your Circle.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleArchive}
                className="rounded-xl bg-[var(--red)] px-4 py-2 text-sm font-medium text-white"
              >
                Archive
              </button>
              <button
                onClick={() => setShowArchiveConfirm(false)}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
