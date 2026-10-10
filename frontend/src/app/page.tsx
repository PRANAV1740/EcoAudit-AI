"use client";

import React, { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import RiskDistributionBar from "@/components/dashboard/RiskDistributionBar";
import HealthGauge from "@/components/dashboard/HealthGauge";
import TreeTable from "@/components/dashboard/TreeTable";
import QuickActions from "@/components/dashboard/QuickActions";
import { getAuditSummary, getTrees, getHealth } from "@/lib/api";
import type { AuditSummary, TreeSample, HealthResponse } from "@/lib/types";

export default function DashboardPage() {
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [trees, setTrees] = useState<TreeSample[]>([]);
  const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [sum, treeList, health] = await Promise.all([
          getAuditSummary(),
          getTrees(),
          getHealth(),
        ]);
        setSummary(sum);
        setTrees(treeList);
        setHealthStatus(health);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const isBackendLive = healthStatus?.status === "ok" || healthStatus?.status === "healthy";

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Header & Context Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
              Plantation Audit Dashboard
            </h1>
            <span className="demo-badge">Demo Dataset</span>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                isBackendLive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isBackendLive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              {isBackendLive ? "Backend Online" : "Local Demo Fallback"}
            </div>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Seremban Agro-Forestry Estate · Sector 4B · Autonomous Health & Risk Audit
          </p>
        </div>

        {/* Live sync details */}
        <div className="flex items-center gap-4 text-xs font-mono text-text-muted bg-bg-secondary px-4 py-2.5 rounded-xl border border-border">
          <div>
            <span className="block text-[10px] uppercase font-bold text-text-muted">Last Surveyed</span>
            <span className="text-text-secondary font-medium">
              {summary ? new Date(summary.last_updated).toLocaleDateString() : "2026-10-10"}
            </span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div>
            <span className="block text-[10px] uppercase font-bold text-text-muted">Agent37</span>
            <span className="text-amber-400 font-medium">Standby / Unconnected</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Sampled Trees"
          value={summary?.total_trees ?? 20}
          unit="trees"
          subtext="Stratified across 3 parcels"
          variant="accent"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        />

        <StatCard
          label="Healthy Trees"
          value={summary?.healthy_count ?? 8}
          unit="optimal"
          subtext="Health score ≥ 70"
          variant="good"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        <StatCard
          label="At-Risk (Stressed)"
          value={summary?.risky_count ?? 7}
          unit="moderate"
          subtext="Health score 40–69"
          variant="risky"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          }
        />

        <StatCard
          label="Avoid (Quarantine)"
          value={summary?.avoid_count ?? 5}
          unit="critical"
          subtext="Health score < 40"
          variant="avoid"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          }
        />

        <StatCard
          label="Audited Area"
          value={summary?.total_area_hectares ?? 42.5}
          unit="hectares"
          subtext="GIS Boundary Mapped"
          variant="default"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
              />
            </svg>
          }
        />
      </div>

      {/* Middle Analytical Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RiskDistributionBar
            healthyCount={summary?.healthy_count ?? 8}
            riskyCount={summary?.risky_count ?? 7}
            avoidCount={summary?.avoid_count ?? 5}
            totalTrees={summary?.total_trees ?? 20}
          />
        </div>
        <div>
          <HealthGauge score={summary?.average_health_score ?? 65.8} />
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
          Platform Operations & Tools
        </h2>
        <QuickActions />
      </div>

      {/* Tree Inventory Table */}
      <TreeTable trees={trees} isLoading={isLoading} />
    </div>
  );
}
