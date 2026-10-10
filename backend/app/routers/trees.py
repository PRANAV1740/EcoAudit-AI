"""Tree sample endpoints."""

import uuid
from fastapi import APIRouter, Depends, HTTPException

from ..models.schemas import TreeSample, TreeSampleCreate
from ..services.persistence import PersistenceStore
from ..services.geo.risk_classifier import classify_risk
from ..dependencies import get_store

router = APIRouter()


@router.get("/trees", response_model=list[TreeSample])
async def list_trees(store: PersistenceStore = Depends(get_store)):
    """Return all tree samples."""
    trees = await store.get_all("trees")
    return [TreeSample(**t) for t in trees]


@router.get("/trees/{tree_id}", response_model=TreeSample)
async def get_tree(tree_id: str, store: PersistenceStore = Depends(get_store)):
    """Return a single tree sample by ID."""
    tree = await store.get_by_id("trees", tree_id)
    if not tree:
        raise HTTPException(status_code=404, detail=f"Tree {tree_id} not found")
    return TreeSample(**tree)


@router.post("/trees", response_model=TreeSample, status_code=201)
async def create_tree(
    body: TreeSampleCreate,
    store: PersistenceStore = Depends(get_store),
):
    """Create a new tree sample. Risk class is computed automatically."""
    tree = TreeSample(
        id=f"T{uuid.uuid4().hex[:6].upper()}",
        species=body.species,
        latitude=body.latitude,
        longitude=body.longitude,
        health_score=body.health_score,
        risk_class=classify_risk(body.health_score),
        diameter_cm=body.diameter_cm,
        height_m=body.height_m,
        canopy_cover_pct=body.canopy_cover_pct,
        notes=body.notes,
        photo_id=body.photo_id,
        is_demo_data=False,  # User-created data is not demo
    )
    await store.create("trees", tree.model_dump())
    return tree
