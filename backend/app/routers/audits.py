"""Audit summary endpoint."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends

from ..models.schemas import AuditSummary, RiskClass
from ..services.persistence import PersistenceStore
from ..services.geo.risk_classifier import classify_risk
from ..dependencies import get_store

router = APIRouter()


@router.get("/audits/summary", response_model=AuditSummary)
async def get_audit_summary(store: PersistenceStore = Depends(get_store)):
    """Return aggregated audit statistics from tree sample data."""
    trees = await store.get_all("trees")

    total = len(trees)
    healthy = sum(1 for t in trees if classify_risk(t["health_score"]) == RiskClass.GOOD)
    risky = sum(1 for t in trees if classify_risk(t["health_score"]) == RiskClass.RISKY)
    avoid = sum(1 for t in trees if classify_risk(t["health_score"]) == RiskClass.AVOID)
    avg_health = round(sum(t["health_score"] for t in trees) / total, 1) if total else 0.0

    # Check if any tree is real data
    is_demo = all(t.get("is_demo_data", True) for t in trees)

    return AuditSummary(
        total_trees=total,
        healthy_count=healthy,
        risky_count=risky,
        avoid_count=avoid,
        total_area_hectares=45.2,  # Demo value
        average_health_score=avg_health,
        last_updated=datetime.now(timezone.utc),
        is_demo_data=is_demo,
    )
