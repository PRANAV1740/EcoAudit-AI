"use client";

import React from "react";

interface RiskDistributionBarProps {
  healthyCount: number;
  riskyCount: number;
  avoidCount: number;
  totalTrees: number;
}

export default function RiskDistributionBar({
  healthyCount,
  riskyCount,
  avoidCount,
  totalTrees,
}: RiskDistributionBarProps) {
  const healthyPct = totalTrees > 0 ? Math.round((healthyCount / totalTrees) * 100) : 0;
  const riskyPct = totalTrees > 0 ? Math.round((riskyCount / totalTrees) * 100) : 0;
  const avoidPct = totalTrees > 0 ? 100 - healthyPct - riskyPct : 0;

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#16202e] to-[#0e1624] border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary">
            Plantation Health Stratification
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Aggregated classification breakdown across surveyed zones
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-md border border-accent/20">
          {totalTrees} Sampled Trees
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-4 rounded-full bg-bg-secondary overflow-hidden flex p-0.5 border border-border">
        {healthyPct > 0 && (
          <div
            style={{ width: `${healthyPct}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full transition-all duration-700 relative group"
            title={`Healthy: ${healthyCount} (${healthyPct}%)`}
          />
        )}
        {riskyPct > 0 && (
          <div
            style={{ width: `${riskyPct}%` }}
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
            title={`Risky: ${riskyCount} (${riskyPct}%)`}
          />
        )}
        {avoidPct > 0 && (
          <div
            style={{ width: `${avoidPct}%` }}
            className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-r-full transition-all duration-700"
            title={`Avoid: ${avoidCount} (${avoidPct}%)`}
          />
        )}
      </div>

      {/* Legend & Breakdown stats */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border/50">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold font-mono text-emerald-400">{healthyCount}</span>
              <span className="text-xs text-text-muted">({healthyPct}%)</span>
            </div>
            <p className="text-[11px] font-medium text-text-secondary">Healthy (Good)</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold font-mono text-amber-400">{riskyCount}</span>
              <span className="text-xs text-text-muted">({riskyPct}%)</span>
            </div>
            <p className="text-[11px] font-medium text-text-secondary">Stressed (Risky)</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold font-mono text-rose-400">{avoidCount}</span>
              <span className="text-xs text-text-muted">({avoidPct}%)</span>
            </div>
            <p className="text-[11px] font-medium text-text-secondary">Diseased (Avoid)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
