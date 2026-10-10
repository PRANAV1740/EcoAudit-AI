"""Tests for the health endpoint."""

import pytest


@pytest.mark.asyncio
async def test_health_returns_200(client):
    response = await client.get("/api/health")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_health_response_shape(client):
    response = await client.get("/api/health")
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "0.1.0"
    assert "timestamp" in data
    assert "services" in data
    assert "api" in data["services"]
    assert "agent37" in data["services"]


@pytest.mark.asyncio
async def test_health_agent37_not_connected(client):
    response = await client.get("/api/health")
    data = response.json()
    # Agent37 should report not connected in test environment
    assert "not_connected" in data["services"]["agent37"]
