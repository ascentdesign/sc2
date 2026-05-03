"use client";

import { cn } from "../lib/utils";
import { motion } from "framer-motion";

// ──────────────────────────────────────────────
// Skeleton Base Component
// ──────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  variant?: "default" | "card" | "text" | "circle" | "avatar";
  lines?: number;
  animate?: boolean;
}

export function Skeleton({
  className,
  variant = "default",
  lines = 1,
  animate = true,
}: SkeletonProps) {
  const baseStyles = "bg-[var(--muted)]";

  const variants = {
    default: "rounded-md",
    card: "rounded-2xl",
    text: "rounded-md h-4 w-full",
    circle: "rounded-full",
    avatar: "h-12 w-12 rounded-full",
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            initial={animate ? { opacity: 0.5 } : false}
            animate={animate ? { opacity: [0.5, 1, 0.5] } : false}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
            className={cn(
              baseStyles,
              variants.text,
              i === lines - 1 && "w-3/4"
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={animate ? { opacity: 0.5 } : false}
      animate={animate ? { opacity: [0.5, 1, 0.5] } : false}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={cn(baseStyles, variants[variant], className)}
    />
  );
}

// ──────────────────────────────────────────────
// Friend Card Skeleton
// ──────────────────────────────────────────────

export function FriendCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-4 rounded-xl border border-[var(--border)] p-4"
        >
          <div className="h-12 w-12 shrink-0 rounded-full bg-[var(--muted)]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded-md bg-[var(--muted)]" />
            <div className="h-3 w-1/2 rounded-md bg-[var(--muted)]" />
          </div>
          <div className="h-3 w-3 shrink-0 rounded-full bg-[var(--muted)]" />
        </motion.div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// Today Card Skeleton
// ──────────────────────────────────────────────

export function TodayCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-sm">
      {/* Status indicator */}
      <div className="mb-4 flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-[var(--muted)]" />
        <div className="h-3 w-16 rounded-md bg-[var(--muted)]" />
      </div>

      {/* Friend info */}
      <div className="mb-4 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-[var(--muted)]" />
        <div className="space-y-2">
          <div className="h-5 w-32 rounded-md bg-[var(--muted)]" />
          <div className="h-3 w-24 rounded-md bg-[var(--muted)]" />
        </div>
      </div>

      {/* Context snippet */}
      <div className="mb-4 h-12 rounded-xl bg-[var(--muted)]" />

      {/* Reason */}
      <div className="mb-6 h-3 w-full rounded-md bg-[var(--muted)]" />

      {/* Actions */}
      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-xl bg-[var(--muted)]" />
        <div className="h-10 flex-1 rounded-xl bg-[var(--muted)]" />
        <div className="h-10 flex-1 rounded-xl bg-[var(--muted)]" />
      </div>

      {/* Snooze */}
      <div className="mt-4 h-10 w-full rounded-xl bg-[var(--muted)]" />
    </div>
  );
}

// ──────────────────────────────────────────────
// Timeline Skeleton
// ──────────────────────────────────────────────

export function TimelineSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-[var(--muted)]" />
            {i < count - 1 && (
              <div className="mt-1 h-full w-px bg-[var(--border)]" />
            )}
          </div>
          <div className="flex-1 space-y-2 pb-4">
            <div className="h-3 w-24 rounded-md bg-[var(--muted)]" />
            <div className="h-4 w-full rounded-md bg-[var(--muted)]" />
            <div className="h-4 w-3/4 rounded-md bg-[var(--muted)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// Form Skeleton
// ──────────────────────────────────────────────

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-1/4 rounded-md bg-[var(--muted)]" />
          <div className="h-12 w-full rounded-xl bg-[var(--muted)]" />
        </div>
      ))}
      <div className="h-12 w-full rounded-xl bg-[var(--muted)]" />
    </div>
  );
}

// ──────────────────────────────────────────────
// Page Skeleton Loader
// ──────────────────────────────────────────────

export function PageSkeleton({ variant = "dashboard" }: { variant?: "dashboard" | "circle" | "detail" | "form" }) {
  const variants: Record<string, React.ReactNode> = {
    dashboard: (
      <div className="mx-auto max-w-lg px-6 pt-12">
        <div className="mb-8 h-8 w-48 rounded-lg bg-[var(--muted)]" />
        <TodayCardSkeleton />
      </div>
    ),
    circle: (
      <div className="mx-auto max-w-lg px-6 pt-12">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-8 w-32 rounded-lg bg-[var(--muted)]" />
          <div className="h-9 w-20 rounded-xl bg-[var(--muted)]" />
        </div>
        <div className="mb-6 h-11 rounded-xl bg-[var(--muted)]" />
        <FriendCardSkeleton count={5} />
      </div>
    ),
    detail: (
      <div className="mx-auto max-w-lg px-6 pt-6 pb-24">
        <div className="mb-6 flex items-center gap-4">
          <div className="h-5 w-5 rounded bg-[var(--muted)]" />
          <div className="h-6 w-32 rounded-md bg-[var(--muted)]" />
        </div>
        <div className="mb-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[var(--muted)]" />
          <div className="space-y-2">
            <div className="h-5 w-32 rounded-md bg-[var(--muted)]" />
            <div className="h-3 w-24 rounded-md bg-[var(--muted)]" />
          </div>
        </div>
        <TimelineSkeleton count={3} />
      </div>
    ),
    form: (
      <div className="mx-auto max-w-lg px-6 pt-6 pb-24">
        <div className="mb-6 flex items-center gap-4">
          <div className="h-5 w-5 rounded bg-[var(--muted)]" />
          <div className="h-6 w-32 rounded-md bg-[var(--muted)]" />
        </div>
        <FormSkeleton />
      </div>
    ),
  };

  return <div className="animate-pulse">{variants[variant]}</div>;
}
