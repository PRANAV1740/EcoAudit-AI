"""
EcoAudit AI — Shared Data Schemas (API Contract)
=================================================

These Pydantic models define the API contract between frontend and backend.
The frontend TypeScript types in `frontend/src/lib/types.ts` MUST mirror
these schemas exactly.

Endpoints:
    GET  /api/health              -> HealthResponse
    GET  /api/audits/summary      -> AuditSummary
    GET  /api/trees               -> List[TreeSample]
    GET  /api/trees/{tree_id}     -> TreeSample
    POST /api/trees               -> TreeSample
    POST /api/photos/upload       -> PhotoUploadResponse
    GET  /api/photos              -> List[PhotoRecord]
    GET  /api/reports             -> List[ActionReport]
    POST /api/reports             -> ActionReport
    GET  /api/zones/geojson       -> GeoJSON FeatureCollection (raw dict)
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ── Enums ────────────────────────────────────────────────────────────────

class RiskClass(str, Enum):
    """Risk classification for trees and zones."""
    GOOD = "good"
    RISKY = "risky"
    AVOID = "avoid"


class Priority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ReportStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


# ── GPS & EXIF ───────────────────────────────────────────────────────────

class GPSCoords(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    altitude: Optional[float] = None


class ExifData(BaseModel):
    camera_make: Optional[str] = None
    camera_model: Optional[str] = None
    datetime_original: Optional[str] = None
    gps_coords: Optional[GPSCoords] = None
    image_width: Optional[int] = None
    image_height: Optional[int] = None


# ── Trees ────────────────────────────────────────────────────────────────

class TreeSample(BaseModel):
    id: str
    species: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    health_score: float = Field(..., ge=0, le=100)
    risk_class: RiskClass
    diameter_cm: Optional[float] = None
    height_m: Optional[float] = None
    canopy_cover_pct: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = None
    photo_id: Optional[str] = None
    is_demo_data: bool = True


class TreeSampleCreate(BaseModel):
    species: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    health_score: float = Field(..., ge=0, le=100)
    diameter_cm: Optional[float] = None
    height_m: Optional[float] = None
    canopy_cover_pct: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = None
    photo_id: Optional[str] = None


# ── Audit ────────────────────────────────────────────────────────────────

class AuditSummary(BaseModel):
    total_trees: int
    healthy_count: int
    risky_count: int
    avoid_count: int
    total_area_hectares: float
    average_health_score: float
    last_updated: datetime
    is_demo_data: bool = True


# ── Photos ───────────────────────────────────────────────────────────────

class PhotoRecord(BaseModel):
    id: str
    filename: str
    original_filename: str
    file_size_bytes: int
    content_type: str
    uploaded_at: datetime
    exif_data: Optional[ExifData] = None
    has_gps: bool = False


class PhotoUploadResponse(BaseModel):
    id: str
    filename: str
    original_filename: str
    file_size_bytes: int
    content_type: str
    uploaded_at: datetime
    exif_data: Optional[ExifData] = None
    has_gps: bool = False
    tree_id: Optional[str] = None
    message: str


# ── Action Reports ───────────────────────────────────────────────────────

class ActionReport(BaseModel):
    id: str
    title: str
    description: str
    zone: RiskClass
    priority: Priority
    status: ReportStatus
    recommendations: List[str] = []
    created_at: datetime
    is_demo_data: bool = True


class ActionReportCreate(BaseModel):
    title: str
    description: str
    zone: RiskClass
    priority: Priority = Priority.MEDIUM
    recommendations: List[str] = []


# ── GeoJSON Zone Properties ─────────────────────────────────────────────

class ZoneProperties(BaseModel):
    """Properties attached to each GeoJSON zone polygon.

    `source` distinguishes demo zones from real analysis:
      - "illustrative": hand-drawn demo polygons (initial version)
      - "calculated":   derived from IDW interpolation (future)
    """
    zone_type: RiskClass
    label: str
    description: str
    tree_count: int = 0
    avg_health_score: float = 0.0
    is_demo_data: bool = True
    source: str = "illustrative"


# ── Health ───────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: datetime
    services: dict
