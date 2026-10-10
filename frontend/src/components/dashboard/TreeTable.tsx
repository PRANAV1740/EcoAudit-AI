"use client";

import React, { useState, useMemo } from "react";
import type { TreeSample, RiskClass } from "@/lib/types";
import { RISK_COLORS } from "@/lib/constants";

interface TreeTableProps {
  trees: TreeSample[];
  isLoading?: boolean;
}

export default function TreeTable({ trees, isLoading = false }: TreeTableProps) {
  const [filterClass, setFilterClass] = useState<RiskClass | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTree, setSelectedTree] = useState<TreeSample | null>(null);

  const filteredTrees = useMemo(() => {
    return trees.filter((tree) => {
      const matchesFilter = filterClass === "all" || tree.risk_class === filterClass;
      const matchesSearch =
        tree.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tree.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tree.notes && tree.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [trees, filterClass, searchQuery]);

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-[#16202e] to-[#0e1624] border border-border">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-text-primary">Tree Health Inventory</h3>
            <span className="demo-badge text-[10px] px-2 py-0.5">Demo Data</span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Individual tree specimens mapped with health scores and dendrometric attributes
          </p>
        </div>

        {/* Filter Buttons & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Risk Filter Tabs */}
          <div className="inline-flex rounded-xl bg-bg-secondary p-1 border border-border">
            {(["all", "good", "risky", "avoid"] as const).map((risk) => (
              <button
                key={risk}
                onClick={() => setFilterClass(risk)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  filterClass === risk
                    ? "bg-bg-card text-text-primary shadow-sm border border-border"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {risk}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <svg
              className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search tree ID or species..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-bg-secondary border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-accent w-48 md:w-56"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div className="space-y-3 py-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 skeleton w-full" />
          ))}
        </div>
      ) : filteredTrees.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <svg
            className="w-10 h-10 mx-auto text-text-muted mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <p className="text-sm font-semibold text-text-secondary">No tree records found</p>
          <p className="text-xs text-text-muted mt-1">
            Try adjusting your search query or risk filter tabs
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111927] border-b border-border text-text-muted font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Tree ID</th>
                <th className="py-3 px-4">Species</th>
                <th className="py-3 px-4 text-center">Health Score</th>
                <th className="py-3 px-4 text-center">Classification</th>
                <th className="py-3 px-4">Coordinates</th>
                <th className="py-3 px-4">Biometrics</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTrees.map((tree) => {
                const badgeColor =
                  tree.risk_class === "good"
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : tree.risk_class === "risky"
                    ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    : "text-rose-400 bg-rose-500/10 border-rose-500/20";

                return (
                  <tr
                    key={tree.id}
                    className="hover:bg-bg-card-hover/40 transition-colors cursor-pointer group"
                    onClick={() => setSelectedTree(tree)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-text-primary">
                      {tree.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-text-primary block">{tree.species}</span>
                      {tree.notes && (
                        <span className="text-[11px] text-text-muted truncate max-w-xs block">
                          {tree.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                      <span
                        style={{ color: RISK_COLORS[tree.risk_class] }}
                        className="inline-block px-2 py-0.5 rounded"
                      >
                        {tree.health_score}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}
                      >
                        {tree.risk_class}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-text-secondary">
                      {tree.latitude.toFixed(4)}, {tree.longitude.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-[11px]">
                      {tree.diameter_cm ? `${tree.diameter_cm}cm Ø` : "—"} ·{" "}
                      {tree.height_m ? `${tree.height_m}m h` : "—"} ·{" "}
                      {tree.canopy_cover_pct ? `${tree.canopy_cover_pct}% canopy` : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTree(tree);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-accent hover:bg-accent/10 rounded-lg border border-accent/20 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Tree Detail Modal */}
      {selectedTree && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-bg-card border border-border shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedTree(null)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-card-hover"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-xl font-bold text-text-primary">
                Tree {selectedTree.id}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  selectedTree.risk_class === "good"
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : selectedTree.risk_class === "risky"
                    ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    : "text-rose-400 bg-rose-500/10 border-rose-500/20"
                }`}
              >
                {selectedTree.risk_class} Zone
              </span>
              <span className="demo-badge text-[10px] ml-auto">Demo Specimen</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-bg-secondary border border-border">
                <div>
                  <span className="text-text-muted block text-[10px] uppercase font-semibold">
                    Species
                  </span>
                  <span className="text-sm font-semibold text-text-primary">
                    {selectedTree.species}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px] uppercase font-semibold">
                    Health Score
                  </span>
                  <span
                    className="text-base font-bold font-mono"
                    style={{ color: RISK_COLORS[selectedTree.risk_class] }}
                  >
                    {selectedTree.health_score} / 100
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px] uppercase font-semibold">
                    GPS Coordinates
                  </span>
                  <span className="font-mono text-text-secondary">
                    {selectedTree.latitude.toFixed(5)}°N, {selectedTree.longitude.toFixed(5)}°E
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px] uppercase font-semibold">
                    Canopy Cover
                  </span>
                  <span className="text-text-secondary font-mono">
                    {selectedTree.canopy_cover_pct || "—"}%
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px] uppercase font-semibold">
                    Trunk Diameter (DBH)
                  </span>
                  <span className="text-text-secondary font-mono">
                    {selectedTree.diameter_cm ? `${selectedTree.diameter_cm} cm` : "Not recorded"}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px] uppercase font-semibold">
                    Tree Height
                  </span>
                  <span className="text-text-secondary font-mono">
                    {selectedTree.height_m ? `${selectedTree.height_m} m` : "Not recorded"}
                  </span>
                </div>
              </div>

              {selectedTree.notes && (
                <div className="p-3.5 rounded-xl bg-bg-secondary/60 border border-border">
                  <span className="text-text-muted block text-[10px] uppercase font-semibold mb-1">
                    Agronomic Field Observations
                  </span>
                  <p className="text-text-secondary leading-relaxed">{selectedTree.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedTree(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-bg-card-hover text-text-primary hover:bg-border transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
