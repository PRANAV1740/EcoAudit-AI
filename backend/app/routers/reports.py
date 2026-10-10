"""Action report endpoints."""

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends

from ..models.schemas import ActionReport, ActionReportCreate, ReportStatus
from ..services.persistence import PersistenceStore
from ..dependencies import get_store

router = APIRouter()


@router.get("/reports", response_model=list[ActionReport])
async def list_reports(store: PersistenceStore = Depends(get_store)):
    """Return all action reports."""
    reports = await store.get_all("reports")
    return [ActionReport(**r) for r in reports]


@router.post("/reports", response_model=ActionReport, status_code=201)
async def create_report(
    body: ActionReportCreate,
    store: PersistenceStore = Depends(get_store),
):
    """Create a new action report."""
    report = ActionReport(
        id=f"R{uuid.uuid4().hex[:6].upper()}",
        title=body.title,
        description=body.description,
        zone=body.zone,
        priority=body.priority,
        status=ReportStatus.PENDING,
        recommendations=body.recommendations,
        created_at=datetime.now(timezone.utc),
        is_demo_data=False,
    )
    await store.create("reports", report.model_dump())
    return report
