"""Shared test fixtures."""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.dependencies import get_store
from app.services.persistence import JsonFileStore

from pathlib import Path


@pytest_asyncio.fixture
async def clean_store(tmp_path):
    """Provide a fresh JSON store for each test."""
    store = JsonFileStore(tmp_path / "test_data")

    def override_store():
        return store

    app.dependency_overrides[get_store] = override_store
    yield store
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def client(clean_store):
    """Provide an async HTTP test client with a clean store."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
