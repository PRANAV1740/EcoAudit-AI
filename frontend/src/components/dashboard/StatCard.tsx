"use client";

import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon: React.ReactNode;
  variant?: "good" | "risky" | "avoid" | "accent" | "default";
}

export default function StatCard({
  label,
  value,
  unit,
  subtext,
  icon,
  variant = "default",
}: StatCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "good":
        return {
          glow: "border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_20px_rgba(34,197,94,0.1)]",
          iconBg: "bg-emerald-500/15 text-emerald-400",
          valColor: "text-emerald-400",
        };
      case "risky":
        return {
          glow: "border-amber-500/30 hover:border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.1)]",
          iconBg: "bg-amber-500/15 text-amber-400",
          valColor: "text-amber-400",
        };
      case "avoid":
        return {
          glow: "border-rose-500/30 hover:border-rose-500/60 shadow-[0_0_20px_rgba(239,68,68,0.1)]",
          iconBg: "bg-rose-500/15 text-rose-400",
          valColor: "text-rose-400",
        };
      case "accent":
        return {
          glow: "border-accent/40 hover:border-accent/70 shadow-[0_0_25px_rgba(16,185,129,0.15)]",
          iconBg: "bg-accent/15 text-accent",
          valColor: "text-accent",
        };
      default:
        return {
          glow: "border-border hover:border-border-light",
          iconBg: "bg-bg-card-hover text-text-secondary",
          valColor: "text-text-primary",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`relative p-5 rounded-2xl bg-gradient-to-br from-[#16202e] to-[#0e1624] border transition-all duration-300 hover:-translate-y-0.5 ${styles.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {label}
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className={`text-3xl font-extrabold tracking-tight font-mono ${styles.valColor}`}>
              {value}
            </span>
            {unit && <span className="text-xs font-medium text-text-secondary">{unit}</span>}
          </div>
        </div>
        <div className={`p-2.5 rounded-xl ${styles.iconBg}`}>{icon}</div>
      </div>
      {subtext && (
        <p className="mt-3 text-xs text-text-secondary flex items-center gap-1.5 border-t border-white/5 pt-2.5">
          {subtext}
        </p>
      )}
    </div>
  );
}
