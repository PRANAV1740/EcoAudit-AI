/**
 * EcoAudit AI — API Client
 *
 * Centralized API calls to the FastAPI backend.
 * Gracefully falls back to local demo datasets if the backend is unreachable,
 * guaranteeing seamless offline and hackathon presentation reliability.
 */

import type {
  AuditSummary,
  TreeSample,
  PhotoRecord,
  PhotoUploadResponse,
  ActionReport,
  ActionReportCreate,
  HealthResponse,
} from "./types";

import {
  MOCK_AUDIT_SUMMARY,
  MOCK_TREES,
  MOCK_REPORTS,
  MOCK_GEOJSON,
} from "./mockData";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const detail = await res.text().catch(() => res.statusText);
      throw new ApiError(res.status, `API error ${res.status}: ${detail}`);
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ── Health ───────────────────────────────────────────────────────────────

export async function getHealth(): Promise<HealthResponse> {
  try {
    return await request<HealthResponse>("/health");
  } catch {
    return {
      status: "degraded",
      version: "0.1.0-fallback",
      timestamp: new Date().toISOString(),
      services: {
        api: "offline",
        persistence: "local-cache",
        agent37: "placeholder",
      },
    };
  }
}

// ── Audits ──────────────────────────────────────────────────────────────

export async function getAuditSummary(): Promise<AuditSummary> {
  try {
    return await request<AuditSummary>("/audits/summary");
  } catch (err) {
    console.warn("Backend unavailable, using mock audit summary", err);
    return MOCK_AUDIT_SUMMARY;
  }
}

// ── Trees ───────────────────────────────────────────────────────────────

export async function getTrees(): Promise<TreeSample[]> {
  try {
    return await request<TreeSample[]>("/trees");
  } catch (err) {
    console.warn("Backend unavailable, using mock trees", err);
    return MOCK_TREES;
  }
}

export async function getTree(treeId: string): Promise<TreeSample> {
  try {
    return await request<TreeSample>(`/trees/${treeId}`);
  } catch {
    const found = MOCK_TREES.find((t) => t.id === treeId);
    if (!found) throw new ApiError(404, `Tree ${treeId} not found`);
    return found;
  }
}

// ── Photos ──────────────────────────────────────────────────────────────

export async function uploadPhoto(file: File): Promise<PhotoUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_BASE}/photos/upload`;
  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => res.statusText);
      throw new ApiError(res.status, `Upload failed: ${detail}`);
    }

    return await res.json();
  } catch (err) {
    console.warn("Backend photo upload failed or offline; synthesizing mock photo record", err);
    // Simulate successful photo record for presentation resilience
    const mockId = `photo_${Date.now()}`;
    return {
      id: mockId,
      filename: `${mockId}_${file.name}`,
      original_filename: file.name,
      file_size_bytes: file.size,
      content_type: file.type || "image/jpeg",
      uploaded_at: new Date().toISOString(),
      has_gps: true,
      exif_data: {
        camera_make: "DJI Mavic 3 Enterprise",
        camera_model: "Hasselblad L2D-20c",
        datetime_original: new Date().toISOString(),
        gps_coords: {
          latitude: 3.1075,
          longitude: 101.7042,
          altitude: 48.5,
        },
        image_width: 5280,
        image_height: 3956,
      },
      message: "Photo uploaded and processed successfully (Demonstration fallback)",
    };
  }
}

export async function getPhotos(): Promise<PhotoRecord[]> {
  try {
    return await request<PhotoRecord[]>("/photos");
  } catch {
    return [
      {
        id: "p001",
        filename: "p001_palm_canopy_rgb.jpg",
        original_filename: "palm_canopy_rgb.jpg",
        file_size_bytes: 3450000,
        content_type: "image/jpeg",
        uploaded_at: "2026-10-09T11:20:00Z",
        has_gps: true,
        exif_data: {
          camera_make: "DJI",
          camera_model: "Mavic 3E",
          datetime_original: "2026-10-09T11:15:30Z",
          gps_coords: { latitude: 3.1085, longitude: 101.7095, altitude: 45.0 },
          image_width: 4000,
          image_height: 3000,
        },
      },
      {
        id: "p002",
        filename: "p002_ganoderma_bracket_close.jpg",
        original_filename: "ganoderma_bracket_close.jpg",
        file_size_bytes: 2890000,
        content_type: "image/jpeg",
        uploaded_at: "2026-10-08T15:10:00Z",
        has_gps: true,
        exif_data: {
          camera_make: "Sony",
          camera_model: "ILCE-7M4",
          datetime_original: "2026-10-08T14:45:10Z",
          gps_coords: { latitude: 3.0995, longitude: 101.7055, altitude: 38.2 },
          image_width: 6000,
          image_height: 4000,
        },
      },
    ];
  }
}

// ── Reports ─────────────────────────────────────────────────────────────

export async function getReports(): Promise<ActionReport[]> {
  try {
    return await request<ActionReport[]>("/reports");
  } catch (err) {
    console.warn("Backend unavailable, using mock reports", err);
    return MOCK_REPORTS;
  }
}

export async function createReport(
  data: ActionReportCreate,
): Promise<ActionReport> {
  try {
    return await request<ActionReport>("/reports", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch {
    const newReport: ActionReport = {
      id: `R${String(MOCK_REPORTS.length + 1).padStart(3, "0")}`,
      title: data.title,
      description: data.description,
      zone: data.zone,
      priority: data.priority || "medium",
      status: "pending",
      recommendations: data.recommendations || [],
      created_at: new Date().toISOString(),
      is_demo_data: true,
    };
    MOCK_REPORTS.unshift(newReport);
    return newReport;
  }
}

// ── Zones (GeoJSON) ────────────────────────────────────────────────────

export async function getZonesGeoJSON(): Promise<GeoJSON.FeatureCollection> {
  try {
    return await request<GeoJSON.FeatureCollection>("/zones/geojson");
  } catch (err) {
    console.warn("Backend unavailable, using mock geojson", err);
    return MOCK_GEOJSON;
  }
}
