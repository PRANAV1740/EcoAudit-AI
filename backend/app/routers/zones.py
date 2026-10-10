"""GeoJSON zone endpoint."""

from fastapi import APIRouter, Depends

from ..models.schemas import TreeSample
from ..services.persistence import PersistenceStore
from ..services.geo.geojson_builder import build_geojson
from ..dependencies import get_store

router = APIRouter()


@router.get("/zones/geojson")
async def get_zones_geojson(store: PersistenceStore = Depends(get_store)):
    """Return GeoJSON FeatureCollection with zone polygons and tree points.

    Each zone polygon has `properties.source` indicating whether it's
    an "illustrative" demo zone or a "calculated" zone from real analysis.
    """
    raw_trees = await store.get_all("trees")
    trees = [TreeSample(**t) for t in raw_trees]
    return build_geojson(trees)
