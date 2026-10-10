"use client";

import React from "react";

interface HealthGaugeProps {
  score: number; // 0 to 100
  title?: string;
  subtitle?: string;
}

export default function HealthGauge({
  score,
  title = "Average Plantation Health",
  subtitle = "Index derived from frond chlorophyll & canopy structure",
}: HealthGaugeProps) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return { stroke: "#10b981", text: "text-emerald-400", label: "Good Condition" };
    if (s >= 40) return { stroke: "#f59e0b", text: "text-amber-400", label: "Elevated Risk" };
    return { stroke: "#ef4444", text: "text-rose-400", label: "Critical Hazard" };
  };

  const status = getColor(score);

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#16202e] to-[#0e1624] border border-border flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary">
          {title}
        </h3>
        <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center justify-center my-4 relative">
        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="text-bg-secondary stroke-current"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={status.stroke}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-extrabold font-mono tracking-tight ${status.text}`}>
            {score}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted mt-0.5">
            / 100 Score
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs">
        <span className="text-text-secondary">Health Status</span>
        <span className={`font-semibold ${status.text}`}>{status.label}</span>
      </div>
    </div>
  );
}
