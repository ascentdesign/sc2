"use client";

import { ReactNode, useEffect, useState } from "react";

// This component ensures content is visible even before hydration
export function HydrationSafe({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial render, ensure content is visible
  return (
    <div
      style={{
        opacity: 1,
        visibility: "visible",
      }}
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}

// Wrapper for Framer Motion to disable animations until hydration
export function SafeMotionWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return children with CSS that ensures visibility
  return (
    <div
      className="safe-motion-wrapper"
      style={{ opacity: 1, visibility: "visible" }}
      data-mounted={mounted}
    >
      {children}
    </div>
  );
}
