
/**
 * EcoAudit AI — Shared TypeScript Types
 *
 * These types mirror the backend Pydantic schemas in
 * backend/app/models/schemas.py. Keep them in sync.
 */

// Enums

export type RiskClass = "good" | "risky" | "avoid";
export type Priority = "high" | "medium" | "low";
export type ReportStatus = "pending" | "in_progress" | "completed";

// GPS & EXIF

export interface GPSCoords {
  latitude: number;
  longitude: number;
  altitude?: number | null;
}

export interface ExifData {
  camera_make?: string | null;
  camera_model?: string | null;
  datetime_original?: string | null;
  gps_coords?: GPSCoords | null;
  image_width?: number | null;
  image_height?: number | null;
}

// Trees

export interface TreeSample {
  id: string;
  species: string;
  latitude: number;
  longitude: number;
  health_score: number;
  risk_class: RiskClass;
  diameter_cm?: number | null;
  height_m?: number | null;
  canopy_cover_pct?: number | null;
  notes?: string | null;
  photo_id?: string | null;
  is_demo_data: boolean;
}

// Audit

export interface AuditSummary {
  total_trees: number;
  healthy_count: number;
  risky_count: number;
  avoid_count: number;
  total_area_hectares: number;
  average_health_score: number;
  last_updated: string;
  is_demo_data: boolean;
}

// Canopy Analysis

export interface CanopyAnalysis {
  canopy_cover_pct: number;
  health_score: number;
  vegetation_pixels: number;
  total_pixels: number;
  chlorosis_ratio: number;
  notes: string;
  risk_class: RiskClass;
  method: string;
}

// Photos

export interface PhotoRecord {
  id: string;
  filename: string;
  original_filename: string;
  file_size_bytes: number;
  content_type: string;
  uploaded_at: string;
  exif_data?: ExifData | null;
  has_gps: boolean;
  analysis?: CanopyAnalysis | null;
}

export interface PhotoUploadResponse extends PhotoRecord {
  message: string;
}

// Action Reports

export interface ActionReport {
  id: string;
  title: string;
  description: string;
  zone: RiskClass;
  priority: Priority;
  status: ReportStatus;
  recommendations: string[];
  created_at: string;
  is_demo_data: boolean;
}

export interface ActionReportCreate {
  title: string;
  description: string;
  zone: RiskClass;
  priority?: Priority;
  recommendations?: string[];
}

// GeoJSON

export interface ZoneProperties {
  zone_type: RiskClass;
  label: string;
  description: string;
  color: string;
  tree_count: number;
  avg_health_score: number;
  is_demo_data: boolean;
  source: "illustrative" | "calculated";
}

export interface TreePointProperties {
  id: string;
  species: string;
  health_score: number;
  risk_class: RiskClass;
  color: string;
  diameter_cm?: number | null;
  height_m?: number | null;
  canopy_cover_pct?: number | null;
  notes?: string | null;
  is_demo_data: boolean;
}

// Health

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
  services: Record<string, string>;
}

// UI State

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface ApiState<T> {
  data: T | null;
  state: LoadingState;
  error: string | null;
}
