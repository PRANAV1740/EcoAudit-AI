/**
 * EcoAudit AI â€” API Client
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

// â”€â”€ Health â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Audits â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getAuditSummary(): Promise<AuditSummary> {
  try {
    return await request<AuditSummary>("/audits/summary");
  } catch (err) {
    console.warn("Backend unavailable, using mock audit summary", err);
    return MOCK_AUDIT_SUMMARY;
  }
}

// â”€â”€ Trees â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Photos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€


export async function uploadPhoto(file: File): Promise<PhotoUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_BASE}/photos/upload`;

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new ApiError(
      res.status,
      `Upload failed: ${detail}`,
    );
  }

  return await res.json();
}

// â”€â”€ Zones (GeoJSON) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getZonesGeoJSON(): Promise<GeoJSON.FeatureCollection> {
  try {
    return await request<GeoJSON.FeatureCollection>("/zones/geojson");
  } catch (err) {
    console.warn("Backend unavailable, using mock geojson", err);
    return MOCK_GEOJSON;
  }
}




// Photos
export async function getPhotos(): Promise<PhotoRecord[]> {
  try {
    return await request<PhotoRecord[]>("/photos");
  } catch (err) {
    console.warn("Backend unavailable, returning no photos", err);
    return [];
  }
}

// Action Reports
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
  } catch (err) {
    console.warn("Backend unavailable, creating a demo report", err);

    return {
      id: `R-${Date.now()}`,
      title: data.title,
      description: data.description,
      zone: data.zone,
      priority: data.priority ?? "medium",
      status: "pending",
      recommendations: data.recommendations ?? [],
      created_at: new Date().toISOString(),
      is_demo_data: true,
    };
  }
}
