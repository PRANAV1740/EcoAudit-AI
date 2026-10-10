"""Tests for the deterministic risk classifier."""

import pytest
from app.services.geo.risk_classifier import (
    classify_risk,
    classify_zone_color,
    classify_zone_label,
    GOOD_THRESHOLD,
    RISKY_THRESHOLD,
)
from app.models.schemas import RiskClass


class TestClassifyRisk:
    """Test the deterministic risk classification rules."""

    def test_good_zone_high_score(self):
        assert classify_risk(95) == RiskClass.GOOD

    def test_good_zone_at_threshold(self):
        assert classify_risk(GOOD_THRESHOLD) == RiskClass.GOOD

    def test_risky_zone_mid_score(self):
        assert classify_risk(55) == RiskClass.RISKY

    def test_risky_zone_at_threshold(self):
        assert classify_risk(RISKY_THRESHOLD) == RiskClass.RISKY

    def test_risky_zone_just_below_good(self):
        assert classify_risk(GOOD_THRESHOLD - 0.1) == RiskClass.RISKY

    def test_avoid_zone_low_score(self):
        assert classify_risk(20) == RiskClass.AVOID

    def test_avoid_zone_zero(self):
        assert classify_risk(0) == RiskClass.AVOID

    def test_avoid_zone_just_below_risky(self):
        assert classify_risk(RISKY_THRESHOLD - 0.1) == RiskClass.AVOID

    def test_perfect_score(self):
        assert classify_risk(100) == RiskClass.GOOD


class TestDisplayHelpers:
    """Test the zone color and label mappings."""

    def test_good_color_is_green(self):
        assert classify_zone_color(RiskClass.GOOD) == "#22c55e"

    def test_risky_color_is_amber(self):
        assert classify_zone_color(RiskClass.RISKY) == "#f59e0b"

    def test_avoid_color_is_red(self):
        assert classify_zone_color(RiskClass.AVOID) == "#ef4444"

    def test_good_label(self):
        label = classify_zone_label(RiskClass.GOOD)
        assert "Good" in label
        assert "Healthy" in label

    def test_risky_label(self):
        label = classify_zone_label(RiskClass.RISKY)
        assert "Risky" in label

    def test_avoid_label(self):
        label = classify_zone_label(RiskClass.AVOID)
        assert "Avoid" in label
        assert "Immediate" in label
