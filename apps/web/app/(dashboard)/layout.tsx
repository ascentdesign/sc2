"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Users, Plus, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Today", icon: Heart },
  { href: "/circle", label: "Circle", icon: Users },
  { href: "/friends/new", label: "Add", icon: Plus },
  { href: "/profile", label: "Profile", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col" role="main" aria-label="Dashboard">
      {/* Main content */}
      <main className="flex-1 pb-24" role="main" aria-label="Dashboard content">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--background)] px-6 py-3"
        role="navigation"
        aria-label="Primary navigation"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 rounded-lg px-3 py-1 ${
                  isActive
                    ? "text-[var(--accent)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                tabIndex={0}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
