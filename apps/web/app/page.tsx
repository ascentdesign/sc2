"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Users, Clock, Shield, Sparkles, Bell, Calendar, Globe, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

// ──────────────────────────────────────────────
// Floating backgrounds shapes
// ──────────────────────────────────────────────

function FloatingShapes() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[var(--accent)]/5 blur-3xl" />
      <div className="absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-[var(--primary)]/5 blur-3xl" />
      <div className="absolute bottom-20 right-1/4 h-80 w-80 rounded-full bg-[var(--accent)]/5 blur-3xl" />
    </div>
  );
}

// ──────────────────────────────────────────────
// Feature Card
// ──────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: typeof Heart;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 p-6 backdrop-blur-sm transition-all hover:border-[var(--accent)]/50 hover:shadow-lg"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10">
        <Icon className="h-6 w-6 text-[var(--accent)]" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{description}</p>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Features Data
// ──────────────────────────────────────────────

const features = [
  {
    icon: Heart,
    title: "One Friend Per Day",
    description: "Focus on a single meaningful connection each day. No overwhelm, just intention."
  },
  {
    icon: Sparkles,
    title: "Smart Reminders",
    description: "AI-powered suggestions based on your last contact and conversation history."
  },
  {
    icon: Clock,
    title: "Flexible Snooze",
    description: "Not the right time? Snooze reminders until tomorrow, weekend, or next week."
  },
  {
    icon: Globe,
    title: "Timezone Aware",
    description: "We know when it's a good time to reach out, wherever your friends are."
  },
  {
    icon: Bell,
    title: "Gradual Escalation",
    description: "Gentle nudges that become more visible as time passes without contact."
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data stays yours. Full GDPR compliance and easy account deletion."
  },
];

// ──────────────────────────────────────────────
// Phase 1 Changelog
// ──────────────────────────────────────────────

const changelog = [
  { version: "v1.0.0", title: "Initial Launch", date: "2024", items: ["Daily friend recommender algorithm", "Smart overdue scoring system", "Interactive friend timeline", "Voice notes & AI transcription", "Snooze & deferral system", "GDPR-compliant account deletion", "PWA support with offline capability", "Full mobile-responsive design", "Clerk authentication integration", "Convex real-time database"] },
];

// ──────────────────────────────────────────────
// Phase 2 Roadmap
// ──────────────────────────────────────────────

const roadmap = [
  { quarter: "Q1 2025", title: "Enhancement Phase", items: ["Smart push notifications", "Cross-platform mobile apps", "Advanced AI conversation starters", "Weekly & monthly friend rotation", "Integration with phone dialers"] },
  { quarter: "Q2 2025", title: "Social Features", items: ["Group circles for family/teams", "Shared moments & photos", "Gift suggestions & reminders", "Birthday calendar sync", "Import from contacts"] },
  { quarter: "H2 2025", title: "Pro Features", items: ["Relationship analytics dashboard", "Export data & reports", "Team/family plan sharing", "Custom reminder cadences", "Priority support"] },
];

// ──────────────────────────────────────────────
// Haptic feedback helper
// ──────────────────────────────────────────────

function useHaptic() {
  const trigger = (type: "light" | "medium" | "heavy" = "light") => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      const patterns = {
        light: [8],
        medium: [12],
        heavy: [20],
      };
      navigator.vibrate(patterns[type]);
    }
  };
  return { trigger };
}

export default function HomePage() {
  const [hour, setHour] = useState(12);
  const haptic = useHaptic();

  useEffect(() => {
    setHour(new Date().getHours());
  }, []);

  const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const greeting = timeOfDay === "morning" ? "Start your day with connection" : timeOfDay === "afternoon" ? "Take a moment to reach out" : "End your day with warmth";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <FloatingShapes />

      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2" aria-label="StayClose Home">
            <Heart className="h-6 w-6 text-[var(--accent)]" />
            <span className="text-lg font-bold">StayClose</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]" aria-label="About page">
              About
            </Link>
            <Link href="/sign-in" className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]" aria-label="Sign in">
              Sign in
            </Link>
            <Link href="/sign-up" className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90" aria-label="Get started">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pb-20 pt-32 lg:pt-40">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block text-sm font-medium text-[var(--accent)]">
              {greeting}
            </span>
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
              Maintain meaningful
              <br />
              <span className="text-[var(--accent)]">connections</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-[var(--muted-foreground)]">
              One friend per day. One reach-out at a time. StayClose helps you nurture the relationships that matter most, without the overwhelm.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="rounded-full bg-[var(--accent)] px-8 py-4 text-base font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
                onClick={() => haptic.trigger("medium")}
                aria-label="Start your journey - Sign up"
              >
                Start your journey
              </Link>
              <Link
                href="/about#changelog"
                className="rounded-full border border-[var(--border)] bg-[var(--background)] px-8 py-4 text-base font-semibold text-[var(--foreground)] transition-all hover:bg-[var(--muted)]"
                aria-label="View what's new"
              >
                View what's new
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8 border-t border-[var(--border)] pt-8"
          >
            <div>
              <div className="text-2xl font-bold text-[var(--foreground)]">1</div>
              <div className="text-sm text-[var(--muted-foreground)]">Friend per day</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--foreground)]">100%</div>
              <div className="text-sm text-[var(--muted-foreground)]">Private & secure</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--foreground)]">0</div>
              <div className="text-sm text-[var(--muted-foreground)]">Ads or trackers</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-[var(--foreground)]">Built for real relationships</h2>
            <p className="mx-auto max-w-2xl text-[var(--muted-foreground)]">
              We designed StayClose around the way people actually want to stay in touch — gently and meaningfully.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-[var(--border)] bg-[var(--muted)]/30 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[var(--foreground)]">How it works</h2>
            <p className="text-[var(--muted-foreground)]">Four simple steps to better relationships</p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: "01", title: "Add Friends", desc: "Build your circle with people you want to stay close to" },
              { step: "02", title: "Set Cadence", desc: "Choose how often you want to connect with each person" },
              { step: "03", title: "Daily Focus", desc: "Each day we suggest one friend who needs attention" },
              { step: "04", title: "Track Moments", desc: "Log interactions and capture memories over time" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="mb-3 text-3xl font-bold text-[var(--accent)]/30">{item.step}</div>
                <h3 className="mb-2 font-semibold text-[var(--foreground)]">{item.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Changelog Section */}
      <section id="changelog" className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[var(--foreground)]">What's in Phase 1</h2>
            <p className="text-[var(--muted-foreground)]">The foundation for meaningful connections</p>
          </div>
          {changelog.map((version) => (
            <motion.div
              key={version.version}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]"
            >
              <div className="border-b border-[var(--border)] bg-[var(--muted)]/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white">
                      {version.version}
                    </span>
                    <span className="font-semibold text-[var(--foreground)]">{version.title}</span>
                  </div>
                  <span className="text-sm text-[var(--muted-foreground)]">{version.date}</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {version.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                      <span className="mt-0.5 text-[var(--accent)]">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] p-8 text-center text-white sm:p-12"
          >
            <h2 className="mb-4 text-3xl font-bold">Ready to stay close?</h2>
            <p className="mb-8 text-lg opacity-90">
              Join others who are prioritizing meaningful relationships.
            </p>
            <Link
              href="/sign-up"
              className="inline-block rounded-full bg-white px-8 py-4 text-base font-semibold text-[var(--accent)] transition-all hover:opacity-90 hover:shadow-lg"
              onClick={() => haptic.trigger("heavy")}
              aria-label="Get started for free"
            >
              Get started for free
            </Link>
            <p className="mt-4 text-sm opacity-75">No credit card required</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-[var(--accent)]" />
              <span className="font-semibold">StayClose</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/about" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]" aria-label="About StayClose">
                About
              </Link>
              <Link href="/about#roadmap" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]" aria-label="Roadmap">
                Roadmap
              </Link>
              <Link href="/about#support" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]" aria-label="Support">
                Support
              </Link>
              <Link href="/sign-in" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]" aria-label="Sign in">
                Sign in
              </Link>
            </nav>
            <p className="text-sm text-[var(--muted-foreground)]">
              © 2024 StayClose. Built with care.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
