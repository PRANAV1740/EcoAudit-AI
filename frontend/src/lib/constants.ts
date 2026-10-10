/** Shared constants for risk class colors and labels */

import type { RiskClass, Priority, ReportStatus } from "./types";

export const RISK_COLORS: Record<RiskClass, string> = {
  good: "#22c55e",
  risky: "#f59e0b",
  avoid: "#ef4444",
};

export const RISK_BG_COLORS: Record<RiskClass, string> = {
  good: "rgba(34, 197, 94, 0.15)",
  risky: "rgba(245, 158, 11, 0.15)",
  avoid: "rgba(239, 68, 68, 0.15)",
};

export const RISK_LABELS: Record<RiskClass, string> = {
  good: "Good",
  risky: "Risky",
  avoid: "Avoid",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#3b82f6",
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

export const STATUS_COLORS: Record<ReportStatus, string> = {
  pending: "#94a3b8",
  in_progress: "#3b82f6",
  completed: "#22c55e",
};
