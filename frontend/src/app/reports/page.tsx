"use client";

import React, { useState, useEffect } from "react";
import { getReports, createReport } from "@/lib/api";
import type { ActionReport, RiskClass, Priority } from "@/lib/types";
import { PRIORITY_COLORS, STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";

export default function ReportsPage() {
  const [reports, setReports] = useState<ActionReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterZone, setFilterZone] = useState<RiskClass | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formZone, setFormZone] = useState<RiskClass>("avoid");
  const [formPriority, setFormPriority] = useState<Priority>("high");
  const [formRecs, setFormRecs] = useState("");

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true);
      try {
        const data = await getReports();
        setReports(data);
      } catch (err) {
        console.error("Failed to load action reports:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDescription) return;

    setIsSubmitting(true);
    try {
      const recList = formRecs
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);

      const created = await createReport({
        title: formTitle,
        description: formDescription,
        zone: formZone,
        priority: formPriority,
        recommendations: recList.length > 0 ? recList : ["Follow standard field protocol"],
      });

      setReports((prev) => [created, ...prev]);
      setIsModalOpen(false);
      // Reset form
      setFormTitle("");
      setFormDescription("");
      setFormRecs("");
    } catch (err) {
      console.error("Failed to create report:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesPriority = filterPriority === "all" || r.priority === filterPriority;
    const matchesZone = filterZone === "all" || r.zone === filterZone;
    return matchesPriority && matchesZone;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
              Agronomic Action Protocols
            </h1>
            <span className="demo-badge">Prescriptions</span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Automated treatment orders, fungicide containment zones, and soil nutrition interventions
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-accent text-black font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center gap-2 self-start md:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Issue Action Order</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-br from-[#16202e] to-[#0e1624] border border-border">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-text-muted uppercase text-[10px] font-bold">Priority Filter:</span>
          <div className="inline-flex rounded-lg bg-bg-secondary p-1 border border-border">
            {(["all", "high", "medium", "low"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-all ${
                  filterPriority === p
                    ? "bg-bg-card text-text-primary shadow-sm border border-border"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <span className="text-text-muted uppercase text-[10px] font-bold ml-2">Zone Filter:</span>
          <div className="inline-flex rounded-lg bg-bg-secondary p-1 border border-border">
            {(["all", "good", "risky", "avoid"] as const).map((z) => (
              <button
                key={z}
                onClick={() => setFilterZone(z)}
                className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-all ${
                  filterZone === z
                    ? "bg-bg-card text-text-primary shadow-sm border border-border"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs font-mono text-text-muted">
          Showing <span className="text-text-primary font-bold">{filteredReports.length}</span> of{" "}
          <span className="text-text-primary font-bold">{reports.length}</span> reports
        </div>
      </div>

      {/* Reports Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 skeleton rounded-2xl" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl">
          <svg className="w-10 h-10 mx-auto text-text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-semibold text-text-secondary">No action reports match current filters</p>
          <p className="text-xs text-text-muted mt-1">Try resetting the priority or zone filters above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.map((report) => {
            const priorityColor = PRIORITY_COLORS[report.priority] || "#94a3b8";
            const statusLabel = STATUS_LABELS[report.status] || report.status;
            const statusColor = STATUS_COLORS[report.status] || "#94a3b8";

            return (
              <div
                key={report.id}
                className="p-6 rounded-2xl bg-gradient-to-br from-[#16202e] to-[#0e1624] border border-border hover:border-border-light transition-all shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-text-muted">{report.id}</span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
                        style={{
                          color: priorityColor,
                          backgroundColor: `${priorityColor}15`,
                          borderColor: `${priorityColor}30`,
                        }}
                      >
                        {report.priority} Priority
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          report.zone === "good"
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : report.zone === "risky"
                            ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                            : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                        }`}
                      >
                        {report.zone} Zone
                      </span>
                    </div>

                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border"
                      style={{
                        color: statusColor,
                        backgroundColor: `${statusColor}15`,
                        borderColor: `${statusColor}30`,
                      }}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary mb-2">{report.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed mb-4">{report.description}</p>

                  {/* Recommendations checklist */}
                  {report.recommendations && report.recommendations.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-bg-secondary/60 border border-border/60 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-text-muted block mb-1">
                        Prescribed Actions
                      </span>
                      {report.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-text-primary">
                          <span className="text-accent font-bold">â€º</span>
                          <span className="leading-snug">{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-text-muted mt-5 pt-3 border-t border-border/40 font-mono">
                  <span>Logged: {new Date(report.created_at).toLocaleDateString()}</span>
                  <span className="text-amber-400 font-sans text-[10px] uppercase">
                    {report.is_demo_data ? "Demo Prescription" : "Field Validated"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-bg-card border border-border shadow-2xl p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-card-hover"
            >
              âœ•
            </button>

            <h3 className="text-lg font-bold text-text-primary mb-1">Issue New Action Order</h3>
            <p className="text-xs text-text-muted mb-5">
              Submit a target agronomic prescription or biosecurity intervention protocol
            </p>

            <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
              <div>
                <label className="text-text-muted uppercase font-semibold block mb-1">
                  Protocol Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper Hydroxide Spraying â€” Block 2"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-muted uppercase font-semibold block mb-1">Target Zone</label>
                  <select
                    value={formZone}
                    onChange={(e) => setFormZone(e.target.value as RiskClass)}
                    className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-accent capitalize"
                  >
                    <option value="good">Good (Healthy)</option>
                    <option value="risky">Risky (Moderate)</option>
                    <option value="avoid">Avoid (Quarantine)</option>
                  </select>
                </div>
                <div>
                  <label className="text-text-muted uppercase font-semibold block mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-accent capitalize"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-text-muted uppercase font-semibold block mb-1">
                  Description & Symptoms
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail observations, pest pathology, or nutrient deficiencies noticed during inspection..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-text-muted uppercase font-semibold block mb-1">
                  Prescribed Actions (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Deploy soil trenching around affected trees&#10;Apply systemic fungicide foliar spray&#10;Schedule 14-day drone revisitation"
                  value={formRecs}
                  onChange={(e) => setFormRecs(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-secondary border border-border text-text-primary focus:outline-none focus:border-accent font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary bg-bg-card-hover font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-accent text-black font-bold uppercase tracking-wider hover:bg-emerald-400 transition-colors"
                >
                  {isSubmitting ? "Submitting..." : "Publish Protocol"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


