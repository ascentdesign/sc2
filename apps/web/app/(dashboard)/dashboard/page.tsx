"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@stayclose/convex";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
  Phone,
  MessageSquare,
  Mic,
  Clock,
  ChevronRight,
  Send,
  Image as ImageIcon,
  Loader2,
  Check,
} from "lucide-react";
import { getTimeOfDay, GREETING_DISPLAY, getStatusLabel, STATUS_LABEL_DISPLAY, STATUS_LABEL_COLOR } from "@stayclose/types";
import { VoiceRecorder } from "../../components/VoiceRecorder";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface RecordingData {
  blob: Blob;
  url: string;
}

// ──────────────────────────────────────────────
// Animation Variants
// ──────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: { duration: 0.3 },
  },
};

const sheetVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 300,
    },
  },
};

const statusIndicatorVariants = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
  pulse: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const pageTransitionVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3, staggerChildren: 0.1 },
  },
  exit: { opacity: 0 },
};

const staggerChildrenVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ──────────────────────────────────────────────
// Snooze Sheet Component
// ──────────────────────────────────────────────

function SnoozeSheet({
  isOpen,
  onClose,
  onSnooze,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSnooze: (option: "tomorrow" | "this_weekend" | "next_week") => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-lg rounded-t-2xl bg-[var(--background)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <motion.div
              className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-[var(--muted)]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.1 }}
            />

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-4 text-lg font-semibold"
            >
              Snooze for later
            </motion.h3>

            <div className="space-y-2">
              {[
                { value: "tomorrow" as const, label: "Tomorrow", sub: "Remind me tomorrow", icon: Clock },
                { value: "this_weekend" as const, label: "This weekend", sub: "Remind me Saturday", icon: Clock },
                { value: "next_week" as const, label: "Next week", sub: "Remind me in 7 days", icon: Clock },
              ].map((option, index) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={{ scale: 1.01, backgroundColor: "var(--muted)" }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onSnooze(option.value)}
                  className="flex w-full items-center justify-between rounded-xl border border-[var(--border)] p-4 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--muted)]">
                      <option.icon className="h-5 w-5 text-[var(--muted-foreground)]" />
                    </div>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-[var(--muted-foreground)]">
                        {option.sub}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
                </motion.button>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={onClose}
              className="mt-4 w-full rounded-xl py-3 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]"
            >
              Cancel
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ──────────────────────────────────────────────
// Post-Action Prompt Sheet
// ──────────────────────────────────────────────

function PostActionSheet({
  isOpen,
  onClose,
  friendId,
  interactionType,
}: {
  isOpen: boolean;
  onClose: () => void;
  friendId: string;
  interactionType: string;
}) {
  const [noteText, setNoteText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingData, setRecordingData] = useState<RecordingData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const createInteraction = useMutation(api.interactions.create);
  const generateVoiceUploadUrl = useMutation(api.interactions.generateVoiceUploadUrl);

  const handleRecordingComplete = useCallback((blob: Blob, url: string) => {
    setRecordingData({ blob, url });
  }, []);

  const handleRecordingError = useCallback((error: string) => {
    // Error is handled by the VoiceRecorder component
    console.error("Recording error:", error);
  }, []);

  const uploadVoiceNote = useCallback(async (blob: Blob): Promise<string | undefined> => {
    try {
      const uploadUrl = await generateVoiceUploadUrl({});

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": blob.type || "audio/webm",
        },
        body: blob,
      });

      if (!response.ok) {
        throw new Error("Failed to upload voice note");
      }

      const { storageId } = await response.json();
      return storageId;
    } catch (error) {
      console.error("Failed to upload voice note:", error);
      return undefined;
    }
  }, [generateVoiceUploadUrl]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      let voiceStorageId: string | undefined;

      // Upload voice note if present
      if (recordingData?.blob) {
        voiceStorageId = await uploadVoiceNote(recordingData.blob);
      }

      // Create the interaction
      await createInteraction({
        friend_id: friendId as any,
        type: interactionType as any,
        note_text: noteText || undefined,
        voice_storage_id: voiceStorageId,
      });

      setSubmitSuccess(true);

      // Small delay to show success state before closing
      setTimeout(() => {
        setNoteText("");
        setRecordingData(null);
        setIsRecording(false);
        setSubmitSuccess(false);
        onClose();
      }, 800);
    } catch (error) {
      console.error("Failed to submit interaction:", error);
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Create interaction without notes
    createInteraction({
      friend_id: friendId as any,
      type: interactionType as any,
    }).then(() => {
      setNoteText("");
      setRecordingData(null);
      setIsRecording(false);
      onClose();
    }).catch(console.error);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-lg rounded-t-2xl bg-[var(--background)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <motion.div
              className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-[var(--muted)]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.1 }}
            />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h3 className="mb-2 text-lg font-semibold">How did it go?</h3>
              <p className="mb-4 text-sm text-[var(--muted-foreground)]">
                {isRecording
                  ? "Record a voice note about your conversation"
                  : "Add a quick note about your conversation"}
              </p>
            </motion.div>

            {/* Voice Recording or Text Input */}
            <AnimatePresence mode="wait">
              {isRecording ? (
                <motion.div
                  key="voice-recorder"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-4"
                >
                  <VoiceRecorder
                    onRecordingComplete={handleRecordingComplete}
                    onRecordingError={handleRecordingError}
                    maxDurationMs={120000} // 2 minutes
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="text-input"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-4"
                >
                  <motion.textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="What did you talk about?"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    rows={3}
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recording indicator */}
            <AnimatePresence>
              {recordingData && !isRecording && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700"
                >
                  <Mic className="h-4 w-4" />
                  <span>Voice note recorded</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setRecordingData(null);
                      setIsRecording(true);
                    }}
                    className="ml-auto text-xs text-green-600 underline"
                  >
                    Re-record
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex gap-3">
              {!isRecording && !recordingData && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsRecording(true)}
                  className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-medium transition-colors hover:bg-[var(--muted)]"
                >
                  <Mic className="h-4 w-4" />
                  Voice
                </motion.button>
              )}

              {(isRecording || recordingData) && !isRecording && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setRecordingData(null);
                    setIsRecording(false);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-medium transition-colors hover:bg-[var(--muted)]"
                >
                  Type instead
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isSubmitting || (!noteText && !recordingData)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="h-4 w-4" />
                  </motion.div>
                ) : submitSuccess ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Save
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSkip}
                disabled={isSubmitting}
                className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] disabled:opacity-50"
              >
                Skip
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ──────────────────────────────────────────────
// Empty State Component
// ──────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center px-6 py-20 text-center"
    >
      <motion.div
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--muted)] text-5xl"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
      >
        ✨
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-2 text-xl font-semibold"
      >
        You&apos;re all caught up!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-sm text-[var(--muted-foreground)]"
      >
        No one needs your attention right now. Check back tomorrow or add more
        friends to your Circle.
      </motion.p>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Friend Photo Component
// ──────────────────────────────────────────────

function FriendPhoto({ name, storageId }: { name: string; storageId?: string }) {
  const [hasError, setHasError] = useState(false);

  if (!storageId || hasError) {
    return (
      <motion.div
        variants={statusIndicatorVariants}
        initial="initial"
        animate="animate"
        className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)] text-xl font-semibold"
      >
        {name.charAt(0).toUpperCase()}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="h-16 w-16 overflow-hidden rounded-full bg-[var(--muted)]"
    >
      {/* In production, use Convex getFileUrl */}
      <div className="flex h-full w-full items-center justify-center text-xl font-semibold">
        {name.charAt(0).toUpperCase()}
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Status Indicator Component
// ──────────────────────────────────────────────

function StatusIndicator({ statusLabel, statusDisplay, statusColor }: {
  statusLabel: string;
  statusDisplay: string;
  statusColor: string;
}) {
  const getStatusColor = () => {
    switch (statusColor) {
      case "gray": return "var(--gray)";
      case "amber": return "var(--amber)";
      case "red": return "var(--red)";
      default: return "var(--gray)";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-4 flex items-center gap-2"
    >
      <motion.span
        variants={statusIndicatorVariants}
        initial="initial"
        animate={["animate", "pulse"]}
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: getStatusColor() }}
      />
      <span className="text-sm font-medium text-[var(--muted-foreground)]">
        {statusDisplay}
      </span>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Action Button Component
// ──────────────────────────────────────────────

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant: "primary" | "secondary" | "tertiary";
  delay?: number;
}

function ActionButton({ onClick, icon, label, variant, delay = 0 }: ActionButtonProps) {
  const baseStyles = "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all";
  const variantStyles = {
    primary: "bg-[var(--accent)] text-white hover:opacity-90 hover:shadow-lg",
    secondary: "border border-[var(--border)] hover:bg-[var(--muted)] hover:shadow",
    tertiary: "border border-[var(--border)] hover:bg-[var(--muted)] hover:shadow",
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + delay, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]}`}
    >
      {icon}
      {label}
    </motion.button>
  );
}

// ──────────────────────────────────────────────
// Today Screen (Main)
// ──────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useUser();
  const todayCard = useQuery(api.rankings.getToday);
  const snoozeMutation = useMutation(api.rankings.snooze);

  const [showSnooze, setShowSnooze] = useState(false);
  const [showPostAction, setShowPostAction] = useState(false);
  const [activeAction, setActiveAction] = useState<string>("");
  const [hour, setHour] = useState(12);

  useEffect(() => {
    setHour(new Date().getHours());
  }, []);

  const timeOfDay = getTimeOfDay(hour);
  const greeting = GREETING_DISPLAY[timeOfDay];

  const handleAction = (type: string) => {
    setActiveAction(type);
    // In production, deep-link to web handler for call/text
    // For now, immediately show post-action prompt
    setShowPostAction(true);
  };

  const handleSnooze = async (option: "tomorrow" | "this_weekend" | "next_week") => {
    if (!todayCard?._id) return;
    await snoozeMutation({
      ranking_id: todayCard._id,
      snooze_until: option,
    });
    setShowSnooze(false);
  };

  // Loading state
  if (todayCard === undefined) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex min-h-screen items-center justify-center"
      >
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-[var(--accent)] border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    );
  }

  // Empty state
  if (!todayCard || !todayCard.friend) {
    return (
      <motion.div
        variants={pageTransitionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="mx-auto max-w-lg px-6 pt-12"
      >
        <motion.h1
          variants={staggerChildrenVariants}
          initial="hidden"
          animate="visible"
          className="mb-8 text-2xl font-bold"
        >
          {greeting}, {user?.firstName || "friend"}
        </motion.h1>
        <EmptyState />
      </motion.div>
    );
  }

  const friend = todayCard.friend;
  const statusLabel = getStatusLabel(todayCard.overdue_score);
  const statusDisplay = STATUS_LABEL_DISPLAY[statusLabel];
  const statusColor = STATUS_LABEL_COLOR[statusLabel];

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="mx-auto max-w-lg px-6 pt-12"
    >
      {/* Greeting */}
      <motion.h1
        variants={staggerChildrenVariants}
        initial="hidden"
        animate="visible"
        className="mb-8 text-2xl font-bold"
      >
        {greeting}, {user?.firstName || "friend"}
      </motion.h1>

      {/* Friend Card */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        layoutId="friend-card"
        className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-sm"
      >
        {/* Status indicator */}
        <StatusIndicator
          statusLabel={statusLabel}
          statusDisplay={statusDisplay}
          statusColor={statusColor}
        />

        {/* Friend info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4 flex items-center gap-4"
        >
          <FriendPhoto name={friend.name} storageId={friend.photo_storage_id} />
          <div>
            <h2 className="text-xl font-bold">{friend.name}</h2>
            {friend.relationship_context && (
              <p className="text-sm text-[var(--muted-foreground)]">
                {friend.relationship_context}
              </p>
            )}
          </div>
        </motion.div>

        {/* Context snippet */}
        <AnimatePresence>
          {todayCard.context_snippet && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4 rounded-xl bg-[var(--muted)] p-3 text-sm text-[var(--foreground)]"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                💡 {todayCard.context_snippet}
              </motion.span>
            </motion.p>
          )}
        </AnimatePresence>

        {/* Reason */}
        <AnimatePresence>
          {todayCard.reason && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-6 text-sm text-[var(--muted-foreground)]"
            >
              {todayCard.reason}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Primary actions */}
        <div className="flex gap-3">
          <ActionButton
            onClick={() => handleAction("call")}
            icon={<Phone className="h-4 w-4" />}
            label="Call"
            variant="primary"
            delay={0}
          />
          <ActionButton
            onClick={() => handleAction("text")}
            icon={<MessageSquare className="h-4 w-4" />}
            label="Text"
            variant="secondary"
            delay={0.1}
          />
          <ActionButton
            onClick={() => handleAction("voice_note")}
            icon={<Mic className="h-4 w-4" />}
            label="Voice"
            variant="tertiary"
            delay={0.2}
          />
        </div>

        {/* Snooze */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setShowSnooze(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]"
        >
          <Clock className="h-4 w-4" />
          Snooze for later
        </motion.button>
      </motion.div>

      {/* Snooze Sheet */}
      <SnoozeSheet
        isOpen={showSnooze}
        onClose={() => setShowSnooze(false)}
        onSnooze={handleSnooze}
      />

      {/* Post-Action Prompt */}
      {todayCard.ranked_friend_id && (
        <PostActionSheet
          isOpen={showPostAction}
          onClose={() => setShowPostAction(false)}
          friendId={todayCard.ranked_friend_id}
          interactionType={activeAction}
        />
      )}
    </motion.div>
  );
}
