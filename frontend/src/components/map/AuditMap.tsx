
"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { TreeSample, RiskClass, ZoneProperties } from "@/lib/types";
import type * as Leaflet from "leaflet";

interface AuditMapProps {
  geoJsonData: GeoJSON.FeatureCollection | null;
  trees: TreeSample[];
  selectedRisk: RiskClass | "all";
  showZones: boolean;
  showTrees: boolean;
  onSelectTree?: (tree: TreeSample | null) => void;
  onSelectZone?: (zone: ZoneProperties | null) => void;
}

export default function AuditMap({
  geoJsonData,
  trees,
  selectedRisk,
  showZones,
  showTrees,
  onSelectTree,
  onSelectZone,
}: AuditMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Leaflet.Map | null>(null);
  const zonesLayerGroupRef = useRef<Leaflet.LayerGroup | null>(null);
  const treesLayerGroupRef = useRef<Leaflet.LayerGroup | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current) return;

      // Plantation center: lat ~3.105, lng ~101.705
      const map = L.map(mapContainerRef.current, {
        center: [3.1045, 101.704],
        zoom: 15,
        zoomControl: true,
      });

      // OpenStreetMap tiles — no API key required
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      ).addTo(map);

      zonesLayerGroupRef.current = L.layerGroup().addTo(map);
      treesLayerGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);
    }

    initMap();

    return () => {
      isMounted = false;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update layers when data or filters change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    let isMounted = true;

    async function updateLayers() {
      const L = (await import("leaflet")).default;
      if (!isMounted) return;

      // Update zone polygons
      if (zonesLayerGroupRef.current) {
        zonesLayerGroupRef.current.clearLayers();

        if (showZones && geoJsonData) {
          geoJsonData.features.forEach((feature) => {
            if (feature.geometry?.type === "Polygon") {
              const props = (feature.properties ?? {}) as ZoneProperties;
              const zoneType = props.zone_type as RiskClass;

              // Filter check
              if (selectedRisk !== "all" && zoneType !== selectedRisk) {
                return;
              }

              const color =
                zoneType === "good"
                  ? "#22c55e"
                  : zoneType === "risky"
                    ? "#f59e0b"
                    : "#ef4444";

              const isIllustrative = props.source === "illustrative";

              const polygonLayer = L.geoJSON(feature, {
                style: {
                  color,
                  weight: 2,
                  dashArray: isIllustrative ? "4, 4" : undefined,
                  fillColor: color,
                  fillOpacity: 0.22,
                },
              });

              // Popup content
              const popupHtml = `
                <div style="font-family: inherit; min-width: 200px; padding: 4px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                    <strong style="color: ${color}; font-size: 13px; text-transform: uppercase;">
                      ${props.label || zoneType}
                    </strong>
                    <span style="font-size: 9px; padding: 2px 6px; border-radius: 999px; background: rgba(255,255,255,0.1); color: #cbd5e1; text-transform: uppercase; font-weight: 700;">
                      ${isIllustrative ? "Illustrative Demo" : "Calculated"}
                    </span>
                  </div>
                  <p style="font-size: 11px; color: #94a3b8; margin: 4px 0 8px 0; line-height: 1.4;">
                    ${props.description || ""}
                  </p>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 8px;">
                    <div>
                      <span style="color: #64748b;">Trees:</span>
                      <strong>${props.tree_count || "—"}</strong>
                    </div>
                    <div>
                      <span style="color: #64748b;">Avg Health:</span>
                      <strong>${props.avg_health_score || "—"}/100</strong>
                    </div>
                  </div>
                </div>
              `;

              polygonLayer.bindPopup(popupHtml);

              polygonLayer.on("click", () => {
                if (onSelectZone) onSelectZone(props);
              });

              if (zonesLayerGroupRef.current) {
                polygonLayer.addTo(zonesLayerGroupRef.current);
              }
            }
          });
        }
      }

      // Update tree point markers
      if (treesLayerGroupRef.current) {
        treesLayerGroupRef.current.clearLayers();

        if (showTrees && trees.length > 0) {
          trees.forEach((tree) => {
            if (
              selectedRisk !== "all" &&
              tree.risk_class !== selectedRisk
            ) {
              return;
            }

            const color =
              tree.risk_class === "good"
                ? "#22c55e"
                : tree.risk_class === "risky"
                  ? "#f59e0b"
                  : "#ef4444";

            // Custom glowing dot icon
            const customIcon = L.divIcon({
              className: "custom-tree-pin",
              html: `
                <div style="
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: ${color};
                  border: 2px solid #ffffff;
                  box-shadow: 0 0 10px ${color}, 0 0 4px rgba(0,0,0,0.8);
                  cursor: pointer;
                  transition: transform 0.2s ease;
                "></div>
              `,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            });

            const marker = L.marker(
              [tree.latitude, tree.longitude],
              {
                icon: customIcon,
              }
            );

            const popupHtml = `
              <div style="font-family: inherit; min-width: 220px; padding: 4px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <strong style="color: #ffffff; font-size: 13px; font-family: monospace;">
                    Tree ${tree.id}
                  </strong>
                  <span style="font-size: 10px; font-weight: 700; color: ${color}; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                    ${tree.risk_class} (${tree.health_score}/100)
                  </span>
                </div>
                <div style="font-size: 11px; color: #cbd5e1; font-weight: 600; margin-bottom: 4px;">
                  ${tree.species}
                </div>
                <div style="font-size: 10px; color: #94a3b8; margin-bottom: 6px; line-height: 1.3;">
                  ${tree.notes || "No notes"}
                </div>
                <div style="font-size: 10px; color: #64748b; font-family: monospace; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
                  Coords: ${tree.latitude.toFixed(4)}, ${tree.longitude.toFixed(4)}
                </div>
              </div>
            `;

            marker.bindPopup(popupHtml);

            marker.on("click", () => {
              if (onSelectTree) onSelectTree(tree);
            });

            if (treesLayerGroupRef.current) {
              marker.addTo(treesLayerGroupRef.current);
            }
          });
        }
      }
    }

    updateLayers();

    return () => {
      isMounted = false;
    };
  }, [
    mapLoaded,
    geoJsonData,
    trees,
    selectedRisk,
    showZones,
    showTrees,
    onSelectTree,
    onSelectZone,
  ]);

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-border shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 p-3.5 rounded-xl bg-bg-card/90 backdrop-blur-md border border-border text-xs shadow-lg max-w-xs pointer-events-auto">
        <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-2">
          Zone Legend &amp; Boundary Status
        </span>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
              <span className="text-text-primary text-[11px]">
                Good (70-100)
              </span>
            </div>
            <span className="text-[10px] text-text-muted font-mono">
              Healthy
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
              <span className="text-text-primary text-[11px]">
                Risky (40-69)
              </span>
            </div>
            <span className="text-[10px] text-text-muted font-mono">
              Monitor
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
              <span className="text-text-primary text-[11px]">
                Avoid (0-39)
              </span>
            </div>
            <span className="text-[10px] text-text-muted font-mono">
              Quarantine
            </span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-border/60 text-[10px] text-text-muted flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-3 border-b-2 border-dashed border-amber-400" />
            <span>Dashed = Illustrative</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 border-b-2 border-solid border-emerald-400" />
            <span>Solid = Calculated</span>
          </span>
        </div>
      </div>
    </div>
  );
}
