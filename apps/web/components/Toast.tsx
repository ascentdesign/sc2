"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, Trophy, Flame, Zap } from "lucide-react";
import { cn } from "../lib/utils";

// ──────────────────────────────────────────────
// Toast Types & Context
// ──────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "badge";
export type BadgeType = "streak" | "milestone" | "achievement";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  badgeType?: BadgeType;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

// ──────────────────────────────────────────────
// Badge Icons
// ──────────────────────────────────────────────

const badgeIcons: Record<BadgeType, React.ComponentType<{ className?: string }>> = {
  streak: Flame,
  milestone: Trophy,
  achievement: Zap,
};

const badgeColors: Record<BadgeType, string> = {
  streak: "from-amber-500 to-orange-600",
  milestone: "from-purple-500 to-indigo-600",
  achievement: "from-blue-500 to-cyan-600",
};

const badgeGradients: Record<BadgeType, string> = {
  streak: "rgba(245, 158, 11, 0.1)",
  milestone: "rgba(139, 92, 246, 0.1)",
  achievement: "rgba(59, 130, 246, 0.1)",
};

// ──────────────────────────────────────────────
// Toast Item Component
// ──────────────────────────────────────────────

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const isBadge = toast.type === "badge";

  const icons: Record<ToastType, React.ComponentType<{ className?: string }>> = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    badge: toast.badgeType ? badgeIcons[toast.badgeType] : Trophy,
  };

  const Icon = icons[toast.type];

  const colors: Record<ToastType, string> = {
    success: "bg-green-500/10 text-green-500 border-green-500/20",
    error: "bg-red-500/10 text-red-500 border-red-500/20",
    info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    badge: "",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 400 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 shadow-lg",
        isBadge ? "border-2 border-[var(--accent)] bg-[var(--background)]" : colors[toast.type],
        isBadge ? "min-w-[280px]" : "min-w-[300px]"
      )}
      style={isBadge ? { background: `linear-gradient(135deg, ${badgeGradients[toast.badgeType!]}, transparent)` } : undefined}
    >
      {/* Badge special styling */}
      {isBadge && (
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${badgeColors[toast.badgeType!]}`} />
      )}

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            isBadge ? `bg-gradient-to-br ${badgeColors[toast.badgeType!]} text-white` : "bg-white/10"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold">{toast.title}</p>
          {toast.message && (
            <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
              {toast.message}
            </p>
          )}
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 rounded-full p-1 text-[var(--muted-foreground)] transition-colors hover:bg-black/5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar for non-badge toasts */}
      {!isBadge && toast.duration && toast.duration > 0 && (
        <motion.div
          initial={{ scaleX: 1, originX: 0 }}
          animate={{ scaleX: 0, originX: 0 }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-current opacity-30"
        />
      )}
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Toast Container Component
// ──────────────────────────────────────────────

export function ToastContainer({
  toasts,
  onDismiss,
  position = "bottom-right",
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position?: "top-right" | "top-center" | "bottom-right" | "bottom-center";
}) {
  const positionClasses = {
    "top-right": "top-4 right-4 items-end",
    "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
    "bottom-right": "bottom-4 right-4 items-end",
    "bottom-center": "bottom-24 left-1/2 -translate-x-1/2 items-center",
  };

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col gap-2 p-4",
        positionClasses[position]
      )}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ──────────────────────────────────────────────
// Toast Hook
// ──────────────────────────────────────────────

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 4000,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, newToast.duration);
    }
  }, [dismissToast]);

  // Convenience methods
  const success = useCallback(
    (title: string, message?: string) => {
      showToast({ type: "success", title, message });
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      showToast({ type: "error", title, message });
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      showToast({ type: "info", title, message });
    },
    [showToast]
  );

  const awardBadge = useCallback(
    (badgeType: BadgeType, title: string, message?: string) => {
      showToast({
        type: "badge",
        badgeType,
        title,
        message,
        duration: 6000, // Badges stay longer
      });
    },
    [showToast]
  );

  // Streak badge convenience
  const streakBadge = useCallback(
    (weeks: number) => {
      awardBadge(
        "streak",
        `${weeks} Week Streak! 🔥`,
        `You've logged interactions ${weeks} weeks in a row!`
      );
    },
    [awardBadge]
  );

  // Milestone badge convenience
  const milestoneBadge = useCallback(
    (count: number) => {
      awardBadge(
        "milestone",
        `${count} Friends Milestone! 🏆`,
        `You've added ${count} friends to your circle!`
      );
    },
    [awardBadge]
  );

  // Achievement badge convenience
  const achievementBadge = useCallback(
    (title: string, message?: string) => {
      awardBadge("achievement", title, message);
    },
    [awardBadge]
  );

  return {
    toasts,
    showToast,
    dismissToast,
    success,
    error,
    info,
    awardBadge,
    streakBadge,
    milestoneBadge,
    achievementBadge,
    ToastContainer: (props: { position?: ToastContainerProps["position"] }) => (
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
        position={props.position}
      />
    ),
  };
}

interface ToastContainerProps {
  position?: "top-right" | "top-center" | "bottom-right" | "bottom-center";
}

// ──────────────────────────────────────────────
// Toast Provider HOC
// ──────────────────────────────────────────────

export function withToast<P extends object>(
  Component: React.ComponentType<P & { toast: ReturnType<typeof useToast> }>
) {
  return function WithToastWrapper(props: P) {
    const toast = useToast();
    return (
      <>
        <Component {...props} toast={toast} />
        <toast.ToastContainer position="bottom-center" />
      </>
    );
  };
}
