"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { getZonesGeoJSON, getTrees } from "@/lib/api";
import type { TreeSample, RiskClass } from "@/lib/types";

// Dynamic import with SSR disabled for Leaflet
const AuditMap = dynamic(() => import("@/components/map/AuditMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[620px] rounded-2xl skeleton flex flex-col items-center justify-center border border-border">
      <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
      <span className="text-sm font-semibold text-text-secondary">Loading Plantation Map Engine...</span>
    </div>
  ),
});

export default function MapPage() {
  const [geoJsonData, setGeoJsonData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [trees, setTrees] = useState<TreeSample[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<RiskClass | "all">("all");
  const [showZones, setShowZones] = useState(true);
  const [showTrees, setShowTrees] = useState(true);
  const [selectedTree, setSelectedTree] = useState<TreeSample | null>(null);
  const [selectedZone, setSelectedZone] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [geojson, treeList] = await Promise.all([
          getZonesGeoJSON(),
          getTrees(),
        ]);
        setGeoJsonData(geojson);
        setTrees(treeList);
      } catch (err) {
        console.error("Error loading map data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
              Plantation Spatial Map
            </h1>
            <span className="demo-badge">GIS Demo Layer</span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Interactive GIS viewport with boundary polygons, stress zones, and geocoded trees
          </p>
        </div>

        {/* Toolbar: Filters & Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Risk Filter */}
          <div className="inline-flex rounded-xl bg-bg-secondary p-1 border border-border">
            {(["all", "good", "risky", "avoid"] as const).map((risk) => (
              <button
                key={risk}
                onClick={() => setSelectedRisk(risk)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  selectedRisk === risk
                    ? "bg-bg-card text-text-primary shadow-sm border border-border"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {risk}
              </button>
            ))}
          </div>

          {/* Layer toggles */}
          <div className="flex items-center gap-2 bg-bg-secondary p-1.5 rounded-xl border border-border text-xs">
            <button
              onClick={() => setShowZones(!showZones)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                showZones
                  ? "bg-accent/15 text-accent border border-accent/20"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Polygons {showZones ? "✓" : "✕"}
            </button>
            <button
              onClick={() => setShowTrees(!showTrees)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                showTrees
                  ? "bg-accent/15 text-accent border border-accent/20"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Trees {showTrees ? "✓" : "✕"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Map + Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Viewport */}
        <div className="lg:col-span-3">
          <AuditMap
            geoJsonData={geoJsonData}
            trees={trees}
            selectedRisk={selectedRisk}
            showZones={showZones}
            showTrees={showTrees}
            onSelectTree={(tree) => {
              setSelectedTree(tree);
              setSelectedZone(null);
            }}
            onSelectZone={(zone) => {
              setSelectedZone(zone);
              setSelectedTree(null);
            }}
          />
        </div>

        {/* Sidebar Inspector Panel */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#16202e] to-[#0e1624] border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Spatial Inspector
              </span>
              <span className="text-[10px] text-text-muted">
                {selectedTree ? "Tree Focus" : selectedZone ? "Zone Focus" : "Idle"}
              </span>
            </div>

            {selectedTree ? (
              <div className="space-y-4 text-xs animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-text-primary">
                    Tree {selectedTree.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      selectedTree.risk_class === "good"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : selectedTree.risk_class === "risky"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                        : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {selectedTree.risk_class}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-bg-secondary border border-border space-y-2">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-semibold block">
                      Species
                    </span>
                    <span className="font-semibold text-text-primary">{selectedTree.species}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Health Index</span>
                    <span className="font-mono font-bold text-accent">
                      {selectedTree.health_score} / 100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Canopy Density</span>
                    <span className="font-mono text-text-secondary">
                      {selectedTree.canopy_cover_pct || "—"}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Diameter (DBH)</span>
                    <span className="font-mono text-text-secondary">
                      {selectedTree.diameter_cm ? `${selectedTree.diameter_cm} cm` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Height</span>
                    <span className="font-mono text-text-secondary">
                      {selectedTree.height_m ? `${selectedTree.height_m} m` : "—"}
                    </span>
                  </div>
                </div>

                {selectedTree.notes && (
                  <div className="p-3 rounded-xl bg-bg-secondary/60 border border-border text-[11px] text-text-secondary">
                    <span className="text-[10px] text-text-muted uppercase font-semibold block mb-1">
                      Field Agronomist Notes
                    </span>
                    {selectedTree.notes}
                  </div>
                )}
              </div>
            ) : selectedZone ? (
              <div className="space-y-4 text-xs animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-text-primary capitalize">
                    {selectedZone.label || selectedZone.zone_type}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-text-secondary uppercase">
                    {selectedZone.source}
                  </span>
                </div>

                <p className="text-[11px] text-text-secondary leading-relaxed">
                  {selectedZone.description}
                </p>

                <div className="p-3 rounded-xl bg-bg-secondary border border-border space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Contained Trees</span>
                    <span className="font-mono font-bold text-text-primary">
                      {selectedZone.tree_count}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Avg Health Score</span>
                    <span className="font-mono font-bold text-accent">
                      {selectedZone.avg_health_score} / 100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Zone Source</span>
                    <span className="capitalize font-semibold text-amber-400">
                      {selectedZone.source === "illustrative"
                        ? "Illustrative Demo Polygon"
                        : "Calculated IDW Zone"}
                    </span>
                  </div>
                </div>

                {selectedZone.source === "illustrative" && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400">
                    Polygon coordinates are hand-drawn for illustration. Full spatial IDW interpolation module is scheduled for Sprint 2.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-text-muted space-y-2">
                <svg
                  className="w-8 h-8 mx-auto text-text-muted/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <p className="text-xs font-medium text-text-secondary">No item selected</p>
                <p className="text-[11px] text-text-muted">
                  Click on any colored tree pin or boundary polygon on the map to inspect telemetry
                </p>
              </div>
            )}
          </div>

          {(selectedTree || selectedZone) && (
            <button
              onClick={() => {
                setSelectedTree(null);
                setSelectedZone(null);
              }}
              className="mt-4 w-full py-2 rounded-xl text-xs font-semibold bg-bg-card-hover text-text-secondary hover:text-text-primary border border-border"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
