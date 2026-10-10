"""Health check endpoint."""

from datetime import datetime, timezone
from fastapi import APIRouter

from ..models.schemas import HealthResponse
from ..services import agent37

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Return service health status."""
    return HealthResponse(
        status="healthy",
        version="0.1.0",
        timestamp=datetime.now(timezone.utc),
        services={
            "api": "running",
            "persistence": "json_file_store",
            "image_processing": "available",
            "geospatial": "available",
            "agent37": "connected" if agent37.is_connected() else "not_connected (placeholder)",
        },
    )
