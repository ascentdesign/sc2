// ──────────────────────────────────────────────
// StayClose UI Package — Barrel Export
// ──────────────────────────────────────────────

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with clsx + tailwind-merge */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export components as they are added
// export { Button } from "./components/Button";
// export { Card } from "./components/Card";
