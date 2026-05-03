import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run daily ranking computation every hour at minute 0
// The action itself filters to only process users whose local time is ~6 AM
crons.hourly(
  "compute daily rankings",
  {
    minute: 0,
  },
  internal.rankings.computeDaily
);

// Run weekly cadence analysis every Sunday at 8 AM UTC
// Analyzes interaction patterns and recommends optimal contact cadence
crons.weekly(
  "analyze cadence weekly",
  {
    hourUTC: 8,
    minuteUTC: 0,
    dayOfWeek: "sunday",
  },
  internal.rankings.analyzeCadenceWeekly
);

export default crons;
