"""
Deterministic Risk Classification Rules
========================================

Classification is based on a tree's health_score (0–100 scale):

    ┌──────────────┬────────────┬──────────────────────────────────────┐
    │ Score Range   │ Risk Class │ Description                          │
    ├──────────────┼────────────┼──────────────────────────────────────┤
    │ 70 – 100      │ GOOD       │ Healthy, no immediate action needed  │
    │ 40 – 69       │ RISKY      │ Requires monitoring or intervention  │
    │  0 – 39       │ AVOID      │ Critical condition, immediate action │
    └──────────────┴────────────┴──────────────────────────────────────┘

These rules are intentionally simple and deterministic for V1.
Future versions will use IDW spatial interpolation (GeoPandas / SciPy)
to create continuous risk surfaces from discrete tree measurements.

NOTE: This module will be augmented (not replaced) by the IDW module.
      Keep the public interface stable.
"""

from ...models.schemas import RiskClass

# ── Configurable thresholds ──────────────────────────────────────────────

GOOD_THRESHOLD: float = 70.0
RISKY_THRESHOLD: float = 40.0


# ── Core classifier ─────────────────────────────────────────────────────

def classify_risk(health_score: float) -> RiskClass:
    """Classify a tree's risk level from its health score.

    Args:
        health_score: Value between 0 and 100 (inclusive).

    Returns:
        RiskClass.GOOD, RiskClass.RISKY, or RiskClass.AVOID.
    """
    if health_score >= GOOD_THRESHOLD:
        return RiskClass.GOOD
    elif health_score >= RISKY_THRESHOLD:
        return RiskClass.RISKY
    else:
        return RiskClass.AVOID


# ── Display helpers ──────────────────────────────────────────────────────

ZONE_COLORS: dict[RiskClass, str] = {
    RiskClass.GOOD: "#22c55e",   # green-500
    RiskClass.RISKY: "#f59e0b",  # amber-500
    RiskClass.AVOID: "#ef4444",  # red-500
}

ZONE_LABELS: dict[RiskClass, str] = {
    RiskClass.GOOD: "Good Zone – Healthy Growth",
    RiskClass.RISKY: "Risky Zone – Monitor Closely",
    RiskClass.AVOID: "Avoid Zone – Immediate Action Required",
}

ZONE_DESCRIPTIONS: dict[RiskClass, str] = {
    RiskClass.GOOD: "Trees in this zone show strong health indicators. Continue standard maintenance.",
    RiskClass.RISKY: "Trees require increased monitoring. Consider soil testing and pest inspection.",
    RiskClass.AVOID: "Critical health decline detected. Immediate intervention recommended.",
}


def classify_zone_color(risk_class: RiskClass) -> str:
    """Map risk class to hex display color."""
    return ZONE_COLORS[risk_class]


def classify_zone_label(risk_class: RiskClass) -> str:
    """Map risk class to a human-readable label."""
    return ZONE_LABELS[risk_class]


def classify_zone_description(risk_class: RiskClass) -> str:
    """Map risk class to a longer description."""
    return ZONE_DESCRIPTIONS[risk_class]
