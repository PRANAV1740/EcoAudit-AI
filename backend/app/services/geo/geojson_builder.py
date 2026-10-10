"""
GeoJSON Zone Builder
====================

Builds GeoJSON FeatureCollections from tree sample data and
pre-defined zone polygons.

The initial version uses illustrative (hand-drawn) demo zone polygons.
Future versions will generate zone boundaries from IDW interpolation
of actual tree health measurements.

Each Feature's `properties.source` field distinguishes:
  - "illustrative": demo polygon, not derived from real analysis
  - "calculated":   polygon derived from spatial interpolation (future)
"""

from typing import Any
from ...models.schemas import RiskClass, TreeSample
from .risk_classifier import (
    classify_zone_color,
    classify_zone_label,
    classify_zone_description,
)


# ── Illustrative demo zone polygons ─────────────────────────────────────
# Coordinates are [longitude, latitude] per GeoJSON spec.
# These polygons are hand-drawn around the sample tree clusters.

DEMO_ZONE_POLYGONS: dict[RiskClass, list[list[float]]] = {
    RiskClass.GOOD: [
        [101.7082, 3.1068],
        [101.7098, 3.1062],
        [101.7125, 3.1070],
        [101.7128, 3.1088],
        [101.7118, 3.1098],
        [101.7088, 3.1098],
        [101.7082, 3.1068],  # close the ring
    ],
    RiskClass.RISKY: [
        [101.6955, 3.1028],
        [101.6978, 3.1028],
        [101.6998, 3.1040],
        [101.6995, 3.1065],
        [101.6975, 3.1072],
        [101.6955, 3.1060],
        [101.6955, 3.1028],
    ],
    RiskClass.AVOID: [
        [101.7035, 3.0978],
        [101.7058, 3.0975],
        [101.7078, 3.0985],
        [101.7075, 3.1012],
        [101.7055, 3.1018],
        [101.7035, 3.1008],
        [101.7035, 3.0978],
    ],
}


def build_zone_feature(
    zone_type: RiskClass,
    polygon_coords: list[list[float]],
    trees_in_zone: list[TreeSample],
    *,
    source: str = "illustrative",
    is_demo: bool = True,
) -> dict[str, Any]:
    """Build a single GeoJSON Feature for a zone polygon."""
    avg_health = 0.0
    if trees_in_zone:
        avg_health = round(
            sum(t.health_score for t in trees_in_zone) / len(trees_in_zone), 1
        )

    return {
        "type": "Feature",
        "properties": {
            "zone_type": zone_type.value,
            "label": classify_zone_label(zone_type),
            "description": classify_zone_description(zone_type),
            "color": classify_zone_color(zone_type),
            "tree_count": len(trees_in_zone),
            "avg_health_score": avg_health,
            "is_demo_data": is_demo,
            "source": source,
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [polygon_coords],
        },
    }


def build_tree_feature(tree: TreeSample) -> dict[str, Any]:
    """Build a GeoJSON Feature for a single tree point."""
    return {
        "type": "Feature",
        "properties": {
            "id": tree.id,
            "species": tree.species,
            "health_score": tree.health_score,
            "risk_class": tree.risk_class.value,
            "color": classify_zone_color(tree.risk_class),
            "diameter_cm": tree.diameter_cm,
            "height_m": tree.height_m,
            "canopy_cover_pct": tree.canopy_cover_pct,
            "notes": tree.notes,
            "is_demo_data": tree.is_demo_data,
        },
        "geometry": {
            "type": "Point",
            "coordinates": [tree.longitude, tree.latitude],
        },
    }


def build_geojson(trees: list[TreeSample]) -> dict[str, Any]:
    """Build a complete GeoJSON FeatureCollection with zones and tree points.

    Returns a FeatureCollection containing:
    - Zone polygons (illustrative demo boundaries)
    - Individual tree point markers
    """
    from .risk_classifier import classify_risk

    features: list[dict] = []

    # Group trees by risk class
    tree_groups: dict[RiskClass, list[TreeSample]] = {
        RiskClass.GOOD: [],
        RiskClass.RISKY: [],
        RiskClass.AVOID: [],
    }
    for tree in trees:
        risk = classify_risk(tree.health_score)
        tree_groups[risk].append(tree)

    # Add zone polygons
    for zone_type, polygon in DEMO_ZONE_POLYGONS.items():
        features.append(
            build_zone_feature(
                zone_type=zone_type,
                polygon_coords=polygon,
                trees_in_zone=tree_groups[zone_type],
                source="illustrative",
                is_demo=True,
            )
        )

    # Add tree points
    for tree in trees:
        features.append(build_tree_feature(tree))

    return {
        "type": "FeatureCollection",
        "features": features,
    }
