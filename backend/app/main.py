"""
EcoAudit AI — FastAPI Application Entry Point
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .routers import health, audits, trees, photos, reports, zones
from .dependencies import get_store, get_upload_dir
from .data.seed import seed_sample_data

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    # Startup: seed sample data if store is empty
    store = get_store()
    await seed_sample_data(store)
    yield
    # Shutdown: nothing to clean up for JSON store


app = FastAPI(
    title="EcoAudit AI API",
    description="AI-powered plantation auditing platform — API backend",
    version="0.1.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static file serving for uploads ──────────────────────────────────────
upload_dir = get_upload_dir()
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

# ── Routers ──────────────────────────────────────────────────────────────
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(audits.router, prefix="/api", tags=["Audits"])
app.include_router(trees.router, prefix="/api", tags=["Trees"])
app.include_router(photos.router, prefix="/api", tags=["Photos"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])
app.include_router(zones.router, prefix="/api", tags=["Zones"])
