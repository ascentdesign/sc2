"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@stayclose/convex";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  User,
  Globe,
  Bell,
  Trash2,
  AlertTriangle,
  Clock,
  Mail,
  Shield,
  ChevronDown,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// ──────────────────────────────────────────────
// Timezone Selector
// ──────────────────────────────────────────────

const COMMON_TIMEZONES = [
  { iana: "US/Eastern", label: "US Eastern" },
  { iana: "US/Central", label: "US Central" },
  { iana: "US/Mountain", label: "US Mountain" },
  { iana: "US/Pacific", label: "US Pacific" },
  { iana: "Europe/London", label: "London" },
  { iana: "Europe/Paris", label: "Paris / Central Europe" },
  { iana: "Europe/Berlin", label: "Berlin" },
  { iana: "Asia/Tokyo", label: "Tokyo" },
  { iana: "Asia/Shanghai", label: "Shanghai" },
  { iana: "Asia/Singapore", label: "Singapore" },
  { iana: "Australia/Sydney", label: "Sydney" },
  { iana: "Pacific/Auckland", label: "Auckland" },
  { iana: "America/Toronto", label: "Toronto" },
  { iana: "America/Vancouver", label: "Vancouver" },
  { iana: "America/Sao_Paulo", label: "São Paulo" },
];

// ──────────────────────────────────────────────
// Accordion Section Component
// ──────────────────────────────────────────────

function AccordionSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: typeof User;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[var(--muted)]"
        aria-expanded={isOpen}
        aria-controls={`section-${title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10">
            <Icon className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <span className="font-semibold text-[var(--foreground)]">{title}</span>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-[var(--muted-foreground)] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`section-${title.toLowerCase().replace(/\s+/g, "-")}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[var(--border)]"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Profile Page
// ──────────────────────────────────────────────

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const convexUser = useQuery(api.users.getCurrent);
  const deleteAccount = useMutation(api.users.deleteAccount);

  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification preferences (placeholder)
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    friendBirthdays: true,
    appUpdates: false,
    marketing: false,
  });

  useEffect(() => {
    if (convexUser?.timezone) {
      setSelectedTimezone(convexUser.timezone);
    }
  }, [convexUser]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    redirect("/sign-in");
    return null;
  }

  const handleTimezoneChange = (timezone: string) => {
    setSelectedTimezone(timezone);
    // TODO: Implement timezone update via API
    console.log("Timezone changed to:", timezone);
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") return;

    setIsDeleting(true);
    try {
      await deleteAccount();
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Failed to delete account:", error);
      setIsDeleting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
  };

  return (
    <div className="mx-auto max-w-lg px-6 pt-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)]">
          Settings
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4"
        role="region"
        aria-label="User profile summary"
      >
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[var(--accent)] text-xl font-semibold text-white">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={`${user.firstName || "User"} profile`}
              className="h-full w-full object-cover"
            />
          ) : (
            user.firstName?.charAt(0) || "U"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="truncate text-lg font-semibold text-[var(--foreground)]">
            {user.firstName} {user.lastName}
          </h2>
          <p className="truncate text-sm text-[var(--muted-foreground)]">
            {user.emailAddresses[0]?.emailAddress}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
          aria-label="Go to Today view"
        >
          Today
        </Link>
      </motion.div>

      {/* Settings Accordion */}
      <div className="space-y-4">
        {/* Timezone */}
        <AccordionSection title="Timezone" icon={Globe} defaultOpen={!convexUser?.timezone}>
          <div className="space-y-3">
            <p className="text-sm text-[var(--muted-foreground)]">
              Your timezone helps us show you the right daily friend and send notifications at appropriate times.
            </p>
            <label className="sr-only" htmlFor="timezone-select">
              Select your timezone
            </label>
            <select
              id="timezone-select"
              value={selectedTimezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)] py-3 px-4 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              aria-label="Timezone selection"
            >
              <option value="">Select your timezone...</option>
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.iana} value={tz.iana}>
                  {tz.label} ({tz.iana})
                </option>
              ))}
            </select>
            {selectedTimezone && (
              <p className="flex items-center gap-2 text-sm text-[var(--accent)]">
                <Clock className="h-4 w-4" />
                Current time: {new Date().toLocaleTimeString("en-US", { timeZone: selectedTimezone, hour: "numeric", minute: "2-digit" })}
              </p>
            )}
            <p className="text-xs text-[var(--muted-foreground)]">
              We automatically sync your timezone from your browser when possible.
            </p>
          </div>
        </AccordionSection>

        {/* Notifications */}
        <AccordionSection title="Notifications" icon={Bell}>
          <div className="space-y-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              Choose what you would like to be notified about. (Coming soon)
            </p>
            <div className="space-y-3">
              {[
                { key: "dailyReminder", label: "Daily friend reminder", description: "Get notified when your daily friend is ready" },
                { key: "friendBirthdays", label: "Important dates", description: "Reminders about birthdays and anniversaries" },
                { key: "appUpdates", label: "App updates", description: "Learn about new features and improvements" },
                { key: "marketing", label: "Tips & insights", description: "Relationship tips and stats from StayClose" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 p-3 transition-colors hover:bg-[var(--muted)]"
                >
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(e) =>
                      setNotifications((prev) => ({
                        ...prev,
                        [item.key]: e.target.checked,
                      }))
                    }
                    disabled
                    className="mt-0.5 h-4 w-4 accent-[var(--accent)] disabled:opacity-50"
                    aria-label={item.label}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {item.label}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {item.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="rounded-xl bg-[var(--accent)]/5 p-3">
              <p className="flex items-center gap-2 text-sm text-[var(--accent)]">
                <Bell className="h-4 w-4" />
                Push notifications coming in Phase 2
              </p>
            </div>
          </div>
        </AccordionSection>

        {/* Privacy & Security */}
        <AccordionSection title="Privacy & Security" icon={Shield}>
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-4">
              <h3 className="mb-2 font-medium text-[var(--foreground)]">
                Data Protection
              </h3>
              <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[var(--accent)]" />
                  Your data is encrypted in transit and at rest
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[var(--accent)]" />
                  We never sell your data to third parties
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[var(--accent)]" />
                  Export your data anytime (coming soon)
                </li>
              </ul>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              Your data is protected under the General Data Protection Regulation (GDPR).
            </p>
          </div>
        </AccordionSection>
      </div>

      {/* Account Actions */}
      <div className="mt-6 space-y-3">
        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>

        {/* Delete Account */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--red)]/30 bg-[var(--red)]/5 py-3 text-sm font-medium text-[var(--red)] transition-colors hover:bg-[var(--red)]/10"
            aria-label="Delete account"
          >
            <Trash2 className="h-4 w-4" />
            Delete account
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-[var(--red)]/50 bg-[var(--red)]/10 p-4"
            role="alert"
            aria-label="Account deletion confirmation"
          >
            <div className="mb-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-[var(--red)]" />
              <div>
                <h3 className="mb-1 font-semibold text-[var(--red)]">
                  This cannot be undone
                </h3>
                <p className="text-sm text-[var(--foreground)]">
                  All your data will be permanently deleted, including friends,
                  interactions, and moments. This action is immediate and
                  irreversible.
                </p>
              </div>
            </div>
            <label className="mb-3 block text-sm text-[var(--foreground)]">
              Type <strong>DELETE</strong> to confirm:
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Type DELETE..."
                className="mt-2 w-full rounded-xl border border-[var(--red)]/50 bg-[var(--background)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--red)]"
                aria-label="Type DELETE to confirm account deletion"
              />
            </label>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== "DELETE" || isDeleting}
                className="flex-1 rounded-xl bg-[var(--red)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
                aria-label="Permanently delete account"
              >
                {isDeleting ? "Deleting..." : "Permanently delete"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteInput("");
                }}
                disabled={isDeleting}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--muted)]"
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* App Info */}
      <div className="mt-8 border-t border-[var(--border)] pt-6 text-center">
        <p className="mb-1 text-sm text-[var(--foreground)]">
          StayClose
        </p>
        <p className="text-xs text-[var(--muted-foreground)]">
          Version 1.0.0 · Phase 1
        </p>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Built with care for meaningful connections
        </p>
      </div>
    </div>
  );
}
