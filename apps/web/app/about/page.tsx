"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Users,
  Sparkles,
  Clock,
  Globe,
  Bell,
  Shield,
  Mail,
  MessageCircle,
  Github,
  ArrowRight,
  Rocket,
  Target,
  Zap,
  Calendar,
} from "lucide-react";
import { useState } from "react";

// ──────────────────────────────────────────────
// Phase 1 Features
// ──────────────────────────────────────────────

const phase1Features = [
  {
    icon: Sparkles,
    title: "Smart Friend Recommender",
    description: "AI-powered algorithm suggests which friend needs your attention most, based on last contact, relationship strength, and your preferred cadence.",
  },
  {
    icon: Clock,
    title: "Snooze & Defer",
    description: "Can't connect right now? Snooze until tomorrow, this weekend, or next week. We'll remind you gently.",
  },
  {
    icon: Globe,
    title: "Timezone Intelligence",
    description: "Know the best times to reach out. We factor in timezones to recommend contacts at appropriate hours.",
  },
  {
    icon: MessageCircle,
    title: "Interaction Timeline",
    description: "Track calls, texts, voice notes, and in-person meetups. View contextual snippets of past conversations.",
  },
  {
    icon: Users,
    title: "Circle Management",
    description: "Organize friends by cadence preference, relationship type, and important dates. Archive what you don't need.",
  },
  {
    icon: Shield,
    title: "Privacy by Design",
    description: "Fully GDPR compliant. Export your data or delete your account completely at any time.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Gradual escalation from gentle reminders to more prominent nudges as friends become overdue.",
  },
  {
    icon: Calendar,
    title: "Important Dates",
    description: "Never miss a birthday or anniversary. Log important dates and get advance notice.",
  },
];

// ──────────────────────────────────────────────
// Phase 2 Roadmap
// ──────────────────────────────────────────────

const phase2Roadmap = [
  {
    phase: "Phase 2",
    timeframe: "Q1-Q2 2025",
    icon: Rocket,
    features: [
      "Cross-platform mobile apps (iOS & Android)",
      "Push notifications with smart scheduling",
      "Weekly & monthly friend rotation options",
      "Integration with native phone dialers & messaging",
      "Siri & Google Assistant voice shortcuts",
      "Home screen widgets",
    ],
  },
  {
    phase: "Phase 3",
    timeframe: "Q3-Q4 2025",
    icon: Target,
    features: [
      "Group circles for families & teams",
      "Shared moments & collaborative memory keeping",
      "Gift suggestion engine with calendar sync",
      "AI conversation starters based on prior context",
      "Relationship health analytics dashboard",
      "Team/family plan sharing",
    ],
  },
  {
    phase: "Phase 4",
    timeframe: "2026+",
    icon: Zap,
    features: [
      "Advanced relationship insights & coaching",
      "AI-powered auto-scheduling",
      "Third-party integrations (calendar, social)",
      "Import contacts from your phone",
      "Custom reminder templates",
      "Priority support & concierge features",
    ],
  },
];

// ──────────────────────────────────────────────
// Support FAQ
// ──────────────────────────────────────────────

const faqs = [
  {
    question: "Is StayClose free?",
    answer: "Yes! StayClose is free for the base features during Phase 1. We may introduce premium features in future phases to support development.",
  },
  {
    question: "Who can see my data?",
    answer: "Only you. Your friend data, messages, and interactions are private and encrypted. We never sell your data to third parties.",
  },
  {
    question: "Can I export my data?",
    answer: "Full data export is coming in Phase 2. For now, you can view all your data in the web app.",
  },
  {
    question: "How does the friend recommender work?",
    answer: "We use an overdue score algorithm that weighs days since last contact against your preferred cadence. The highest overdue friend is suggested daily.",
  },
  {
    question: "Will there be a mobile app?",
    answer: "Yes! Native iOS and Android apps are planned for Phase 2 (Q1-Q2 2025). The web app is fully responsive and works great on mobile devices today.",
  },
];

// ──────────────────────────────────────────────
// FAQ Item Component (Updated for Accessibility)
// ──────────────────────────────────────────────

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div className="border-b border-[var(--border)] last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left"
        aria-expanded={isOpen}
        aria-controls={`faq-${index}`}
      >
        <span className="font-medium text-[var(--foreground)]">{question}</span>
        <span
          className={`ml-4 text-[var(--muted-foreground)] transition-transform ${
            isOpen ? "rotate-90" : ""
          }`}
          aria-hidden="true"
        >
          →
        </span>
      </button>
      <motion.div
        id={`faq-${index}`}
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="pb-4 text-sm text-[var(--muted-foreground)]">{answer}</p>
      </motion.div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────

export default function AboutPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2" aria-label="StayClose Home">
            <Heart className="h-6 w-6 text-[var(--accent)]" />
            <span className="text-lg font-bold">StayClose</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/#features"
              className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
              aria-label="View features"
            >
              Features
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              aria-label="Open dashboard"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-32 pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-2 text-sm text-[var(--accent)]"
          >
            <Sparkles className="h-4 w-4" />
            Last updated: December 2024
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 text-4xl font-bold text-[var(--foreground)]"
          >
            About StayClose
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-[var(--muted-foreground)]"
          >
            A mindful approach to relationship maintenance. One friend, one day, one meaningful connection at a time.
          </motion.p>
        </div>
      </section>

      {/* Phase 1 Features */}
      <section className="border-y border-[var(--border)] bg-[var(--muted)]/30 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="mb-2 inline-block text-sm font-semibold text-[var(--accent)]">
              Currently Available
            </span>
            <h2 className="mb-4 text-3xl font-bold text-[var(--foreground)]">
              Phase 1 Features
            </h2>
            <p className="mx-auto max-w-2xl text-[var(--muted-foreground)]">
              Everything available today in StayClose 1.0
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {phase1Features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 transition-all hover:border-[var(--accent)]/50 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10">
                  <feature.icon className="h-6 w-6 text-[var(--accent)]" />
                </div>
                <h3 className="mb-2 font-semibold text-[var(--foreground)]">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <span className="mb-2 inline-block text-sm font-semibold text-[var(--accent)]">
              What's Coming
            </span>
            <h2 className="mb-4 text-3xl font-bold text-[var(--foreground)]">
              Product Roadmap
            </h2>
            <p className="text-[var(--muted-foreground)]">
              Our vision for StayClose's future
            </p>
          </div>
          <div className="space-y-8">
            {phase2Roadmap.map((phase, i) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10">
                    <phase.icon className="h-6 w-6 text-[var(--accent)]" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-3">
                      <h3 className="font-semibold text-[var(--foreground)]">
                        {phase.phase}
                      </h3>
                      <span className="text-sm text-[var(--muted-foreground)]">
                        {phase.timeframe}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {phase.features.map((feature, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]"
                        >
                          <span className="mt-1 text-[var(--accent)]">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-[var(--border)] bg-[var(--muted)]/30 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <span className="mb-2 inline-block text-sm font-semibold text-[var(--accent)]">
              Questions & Answers
            </span>
            <h2 className="mb-4 text-3xl font-bold text-[var(--foreground)]">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-6 py-4">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === i}
                onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Support */}
      <section id="support" className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-[var(--foreground)]">
              Get in Touch
            </h2>
            <p className="mb-8 text-[var(--muted-foreground)]">
              Have questions, feedback, or need support? We'd love to hear from you.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="mailto:hello@stayclose.app"
                className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
                aria-label="Email StayClose support"
              >
                <Mail className="h-4 w-4" />
                hello@stayclose.app
              </a>
              <a
                href="#"
                className="flex items-center gap-2 rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
                aria-label="View StayClose GitHub"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </div>
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
            <p className="text-sm text-[var(--muted-foreground)]">
              © 2024 StayClose. Building better connections, one day at a time.
            </p>
            <Link
              href="/"
              className="flex items-center gap-1 text-sm text-[var(--accent)] transition-colors hover:opacity-80"
              aria-label="Back to home"
            >
              Back home
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
